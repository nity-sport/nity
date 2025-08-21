import { NextApiRequest, NextApiResponse } from 'next';
import { ResponseHandler } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Enhanced request interface with request ID
 */
export interface ApiRequest extends NextApiRequest {
  requestId?: string;
}

/**
 * API handler function type
 */
export type ApiHandler = (
  req: ApiRequest,
  res: NextApiResponse
) => Promise<void> | void;

/**
 * Error handling middleware for API routes
 */
export function withErrorHandler(handler: ApiHandler) {
  return async (req: ApiRequest, res: NextApiResponse) => {
    // Generate unique request ID for tracing
    const requestId = uuidv4();
    req.requestId = requestId;

    // Add request ID to response headers
    res.setHeader('X-Request-ID', requestId);

    // Log incoming request
    logger.info('API Request', {
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection?.remoteAddress,
      requestId
    });

    try {
      await handler(req, res);
    } catch (error) {
      logger.error('API Error', {
        method: req.method,
        url: req.url,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        requestId
      });

      ResponseHandler.error(res, error as Error, requestId);
    }
  };
}

/**
 * Validation middleware factory
 */
export function withValidation<T = any>(
  schema: any,
  target: 'body' | 'query' | 'params' = 'body'
) {
  return function (handler: ApiHandler): ApiHandler {
    return withErrorHandler(async (req: ApiRequest, res: NextApiResponse) => {
      try {
        const data = req[target];
        
        // Validate using the provided schema (works with Joi, Zod, etc.)
        if (schema.validate) {
          // Joi validation
          const { error, value } = schema.validate(data);
          if (error) {
            return ResponseHandler.error(
              res,
              new Error(error.details[0].message),
              req.requestId
            );
          }
          req[target] = value;
        } else if (schema.parse) {
          // Zod validation
          req[target] = schema.parse(data);
        }

        await handler(req, res);
      } catch (error) {
        ResponseHandler.error(res, error as Error, req.requestId);
      }
    });
  };
}

/**
 * Rate limiting middleware factory
 */
interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests' } = options;

  return function (handler: ApiHandler): ApiHandler {
    return withErrorHandler(async (req: ApiRequest, res: NextApiResponse) => {
      const identifier = req.ip || req.connection?.remoteAddress || 'unknown';
      const now = Date.now();
      const windowStart = now - windowMs;

      // Clean up old entries
      for (const [key, data] of rateLimitStore.entries()) {
        if (data.resetTime < windowStart) {
          rateLimitStore.delete(key);
        }
      }

      // Get current count for this identifier
      const current = rateLimitStore.get(identifier) || { count: 0, resetTime: now + windowMs };

      if (current.count >= max) {
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', new Date(current.resetTime));

        return ResponseHandler.error(
          res,
          new Error(message),
          req.requestId
        );
      }

      // Increment counter
      current.count++;
      rateLimitStore.set(identifier, current);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current.count));
      res.setHeader('X-RateLimit-Reset', new Date(current.resetTime));

      await handler(req, res);
    });
  };
}

/**
 * Method validation middleware
 */
export function withMethods(allowedMethods: string[]) {
  return function (handler: ApiHandler): ApiHandler {
    return withErrorHandler(async (req: ApiRequest, res: NextApiResponse) => {
      if (!req.method || !allowedMethods.includes(req.method)) {
        res.setHeader('Allow', allowedMethods.join(', '));
        return ResponseHandler.error(
          res,
          new Error(`Method ${req.method} not allowed`),
          req.requestId
        );
      }

      await handler(req, res);
    });
  };
}

/**
 * CORS middleware
 */
interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export function withCors(options: CorsOptions = {}) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    exposedHeaders = ['X-Request-ID'],
    credentials = false,
    maxAge = 86400
  } = options;

  return function (handler: ApiHandler): ApiHandler {
    return withErrorHandler(async (req: ApiRequest, res: NextApiResponse) => {
      // Set CORS headers
      if (typeof origin === 'string') {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else if (Array.isArray(origin)) {
        const requestOrigin = req.headers.origin;
        if (requestOrigin && origin.includes(requestOrigin)) {
          res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        }
      } else if (origin === true) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      }

      res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
      res.setHeader('Access-Control-Expose-Headers', exposedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', maxAge.toString());

      if (credentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      await handler(req, res);
    });
  };
}

/**
 * Compose multiple middleware functions
 */
export function compose(...middlewares: Array<(handler: ApiHandler) => ApiHandler>) {
  return function (handler: ApiHandler): ApiHandler {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}