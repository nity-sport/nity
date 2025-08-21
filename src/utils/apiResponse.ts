import { NextApiResponse } from 'next';
import { AppError, isOperationalError } from './errors';
import { logger } from './logger';

/**
 * Standard API response interfaces
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  metadata?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    timestamp: string;
    details?: any;
    requestId?: string;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Pagination interface for list responses
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

/**
 * API Response utility class
 */
export class ResponseHandler {
  /**
   * Send success response
   */
  static success<T>(
    res: NextApiResponse,
    data: T,
    options?: {
      message?: string;
      statusCode?: number;
      pagination?: PaginationOptions;
      requestId?: string;
    }
  ): void {
    const { message, statusCode = 200, pagination, requestId } = options || {};
    
    const response: ApiSuccessResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
      metadata: {
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId }),
        ...(pagination && {
          pagination: {
            ...pagination,
            totalPages: Math.ceil(pagination.total / pagination.limit),
            hasNextPage: pagination.page * pagination.limit < pagination.total,
            hasPrevPage: pagination.page > 1
          }
        })
      }
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: NextApiResponse,
    error: Error | AppError,
    requestId?: string
  ): void {
    let statusCode = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details: any = undefined;

    // Handle custom AppError
    if (error instanceof AppError) {
      statusCode = error.statusCode;
      code = error.code;
      message = error.message;
      details = error.details;
    } 
    // Handle known Node.js errors
    else if (error.name === 'ValidationError') {
      statusCode = 400;
      code = 'VALIDATION_ERROR';
      message = error.message;
    }
    else if (error.name === 'CastError') {
      statusCode = 400;
      code = 'INVALID_FORMAT';
      message = 'Invalid data format';
    }
    else if (error.name === 'MongoServerError' && (error as any).code === 11000) {
      statusCode = 409;
      code = 'DUPLICATE_ENTRY';
      message = 'Duplicate entry found';
    }
    // Handle unexpected errors
    else if (!isOperationalError(error)) {
      // Log unexpected errors
      logger.error('Unexpected error occurred', {
        error: error.message,
        stack: error.stack,
        requestId
      });
      
      // Don't expose internal error details in production
      if (process.env.NODE_ENV === 'production') {
        message = 'An unexpected error occurred';
      } else {
        message = error.message;
      }
    }

    const response: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        statusCode,
        timestamp: new Date().toISOString(),
        ...(details && { details }),
        ...(requestId && { requestId })
      }
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: NextApiResponse,
    data: T[],
    pagination: PaginationOptions,
    options?: {
      message?: string;
      requestId?: string;
    }
  ): void {
    this.success(res, data, {
      ...options,
      pagination
    });
  }

  /**
   * Send created response (201)
   */
  static created<T>(
    res: NextApiResponse,
    data: T,
    message?: string,
    requestId?: string
  ): void {
    this.success(res, data, {
      statusCode: 201,
      message: message || 'Resource created successfully',
      requestId
    });
  }

  /**
   * Send no content response (204)
   */
  static noContent(res: NextApiResponse): void {
    res.status(204).end();
  }

  /**
   * Send not found response (404)
   */
  static notFound(
    res: NextApiResponse,
    message: string = 'Resource not found',
    requestId?: string
  ): void {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message,
        statusCode: 404,
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId })
      }
    };

    res.status(404).json(response);
  }

  /**
   * Send unauthorized response (401)
   */
  static unauthorized(
    res: NextApiResponse,
    message: string = 'Authentication required',
    requestId?: string
  ): void {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message,
        statusCode: 401,
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId })
      }
    };

    res.status(401).json(response);
  }

  /**
   * Send forbidden response (403)
   */
  static forbidden(
    res: NextApiResponse,
    message: string = 'Insufficient permissions',
    requestId?: string
  ): void {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message,
        statusCode: 403,
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId })
      }
    };

    res.status(403).json(response);
  }
}

/**
 * Utility functions for backwards compatibility
 */
export const sendSuccess = ResponseHandler.success;
export const sendError = ResponseHandler.error;
export const sendPaginated = ResponseHandler.paginated;
export const sendCreated = ResponseHandler.created;
export const sendNotFound = ResponseHandler.notFound;
export const sendUnauthorized = ResponseHandler.unauthorized;
export const sendForbidden = ResponseHandler.forbidden;