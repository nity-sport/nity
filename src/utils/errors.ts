/**
 * Custom error classes for structured error handling
 */

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Database
  DATABASE_ERROR = 'DATABASE_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',

  // File Operations
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',

  // Business Logic
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // External Services
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  PAYMENT_ERROR = 'PAYMENT_ERROR',

  // Generic
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);

    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date();

    // Maintains proper stack trace (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    this.name = this.constructor.name;
  }

  /**
   * Convert error to JSON format for API responses
   */
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp.toISOString(),
        ...(this.details && { details: this.details }),
      },
    };
  }
}

// Specific error classes for common scenarios
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, ErrorCode.UNAUTHORIZED, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, ErrorCode.FORBIDDEN, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, ErrorCode.NOT_FOUND, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, ErrorCode.RESOURCE_CONFLICT, 409);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.UPLOAD_FAILED, 400, true, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.DATABASE_ERROR, 500, true, details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(
      `${service} service error: ${message}`,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      502,
      true,
      details
    );
  }
}

/**
 * Error factory functions for common scenarios
 */
export const createValidationError = (field: string, value?: any) => {
  return new ValidationError(`Invalid value for field '${field}'`, {
    field,
    value,
  });
};

export const createRequiredFieldError = (field: string) => {
  return new ValidationError(`Field '${field}' is required`, {
    field,
    code: ErrorCode.REQUIRED_FIELD,
  });
};

export const createDuplicateError = (
  resource: string,
  field: string,
  value: any
) => {
  return new ConflictError(
    `${resource} with ${field} '${value}' already exists`
  );
};

export const createFileError = (
  type: 'size' | 'type' | 'upload',
  details?: any
) => {
  const messages = {
    size: 'File size exceeds the maximum allowed limit',
    type: 'File type is not supported',
    upload: 'File upload failed',
  };

  const codes = {
    size: ErrorCode.FILE_TOO_LARGE,
    type: ErrorCode.INVALID_FILE_TYPE,
    upload: ErrorCode.UPLOAD_FAILED,
  };

  return new AppError(messages[type], codes[type], 400, true, details);
};

/**
 * Utility function to check if error is operational
 */
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};
