import {
  AppError,
  ErrorCode,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  createValidationError,
  createRequiredFieldError,
  createDuplicateError,
  createFileError,
  isOperationalError
} from '../../src/utils/errors';

describe('AppError', () => {
  it('should create an error with all properties', () => {
    const error = new AppError(
      'Test error',
      ErrorCode.VALIDATION_ERROR,
      400,
      true,
      { field: 'email' }
    );

    expect(error.message).toBe('Test error');
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
    expect(error.details).toEqual({ field: 'email' });
    expect(error.timestamp).toBeInstanceOf(Date);
    expect(error.name).toBe('AppError');
  });

  it('should have default values', () => {
    const error = new AppError('Test error', ErrorCode.INTERNAL_ERROR);

    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
    expect(error.details).toBeUndefined();
  });

  it('should convert to JSON format', () => {
    const error = new AppError(
      'Test error',
      ErrorCode.VALIDATION_ERROR,
      400,
      true,
      { field: 'email' }
    );

    const json = error.toJSON();

    expect(json).toEqual({
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Test error',
        statusCode: 400,
        timestamp: error.timestamp.toISOString(),
        details: { field: 'email' }
      }
    });
  });
});

describe('Specific Error Classes', () => {
  it('should create ValidationError correctly', () => {
    const error = new ValidationError('Invalid data', { field: 'email' });

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Invalid data');
    expect(error.details).toEqual({ field: 'email' });
  });

  it('should create AuthenticationError correctly', () => {
    const error = new AuthenticationError();

    expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Authentication required');
  });

  it('should create AuthenticationError with custom message', () => {
    const error = new AuthenticationError('Invalid token');

    expect(error.message).toBe('Invalid token');
  });

  it('should create AuthorizationError correctly', () => {
    const error = new AuthorizationError();

    expect(error.code).toBe(ErrorCode.FORBIDDEN);
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Insufficient permissions');
  });

  it('should create NotFoundError correctly', () => {
    const error = new NotFoundError('User');

    expect(error.code).toBe(ErrorCode.NOT_FOUND);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('User not found');
  });

  it('should create ConflictError correctly', () => {
    const error = new ConflictError('Email already exists');

    expect(error.code).toBe(ErrorCode.RESOURCE_CONFLICT);
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('Email already exists');
  });
});

describe('Factory Functions', () => {
  it('should create validation error', () => {
    const error = createValidationError('email', 'invalid@email');

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe("Invalid value for field 'email'");
    expect(error.details).toEqual({ field: 'email', value: 'invalid@email' });
  });

  it('should create required field error', () => {
    const error = createRequiredFieldError('password');

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe("Field 'password' is required");
    expect(error.details).toEqual({ field: 'password', code: ErrorCode.REQUIRED_FIELD });
  });

  it('should create duplicate error', () => {
    const error = createDuplicateError('User', 'email', 'test@example.com');

    expect(error).toBeInstanceOf(ConflictError);
    expect(error.message).toBe("User with email 'test@example.com' already exists");
  });

  it('should create file size error', () => {
    const error = createFileError('size', { maxSize: '5MB' });

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(ErrorCode.FILE_TOO_LARGE);
    expect(error.message).toBe('File size exceeds the maximum allowed limit');
    expect(error.details).toEqual({ maxSize: '5MB' });
  });

  it('should create file type error', () => {
    const error = createFileError('type');

    expect(error.code).toBe(ErrorCode.INVALID_FILE_TYPE);
    expect(error.message).toBe('File type is not supported');
  });

  it('should create file upload error', () => {
    const error = createFileError('upload');

    expect(error.code).toBe(ErrorCode.UPLOAD_FAILED);
    expect(error.message).toBe('File upload failed');
  });
});

describe('isOperationalError', () => {
  it('should return true for AppError with operational flag', () => {
    const error = new AppError('Test', ErrorCode.VALIDATION_ERROR, 400, true);
    expect(isOperationalError(error)).toBe(true);
  });

  it('should return false for AppError with non-operational flag', () => {
    const error = new AppError('Test', ErrorCode.INTERNAL_ERROR, 500, false);
    expect(isOperationalError(error)).toBe(false);
  });

  it('should return false for regular Error', () => {
    const error = new Error('Regular error');
    expect(isOperationalError(error)).toBe(false);
  });
});