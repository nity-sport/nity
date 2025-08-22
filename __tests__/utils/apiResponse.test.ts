import { createMocks } from 'node-mocks-http';
import { NextApiResponse } from 'next';
import { ResponseHandler } from '../../src/utils/apiResponse';
import { ValidationError } from '../../src/utils/errors';

describe('ResponseHandler', () => {
  let res: NextApiResponse;

  beforeEach(() => {
    const { res: mockRes } = createMocks();
    res = mockRes;
  });

  describe('success', () => {
    it('should send success response with data', () => {
      const data = { id: 1, name: 'Test' };
      
      ResponseHandler.success(res, data);

      expect(res.statusCode).toBe(200);
      const responseData = JSON.parse(res._getData());
      
      expect(responseData.success).toBe(true);
      expect(responseData.data).toEqual(data);
      expect(responseData.metadata.timestamp).toBeDefined();
    });

    it('should send success response with message and custom status', () => {
      const data = { id: 1 };
      
      ResponseHandler.success(res, data, {
        message: 'Custom success',
        statusCode: 201,
        requestId: 'test-request-id'
      });

      expect(res.statusCode).toBe(201);
      const responseData = JSON.parse(res._getData());
      
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Custom success');
      expect(responseData.metadata.requestId).toBe('test-request-id');
    });
  });

  describe('error', () => {
    it('should handle AppError correctly', () => {
      const error = new ValidationError('Invalid data', { field: 'email' });
      
      ResponseHandler.error(res, error, 'test-request-id');

      expect(res.statusCode).toBe(400);
      const responseData = JSON.parse(res._getData());
      
      expect(responseData.success).toBe(false);
      expect(responseData.error.code).toBe('VALIDATION_ERROR');
      expect(responseData.error.message).toBe('Invalid data');
      expect(responseData.error.details).toEqual({ field: 'email' });
      expect(responseData.error.requestId).toBe('test-request-id');
    });

    it('should handle regular Error', () => {
      const error = new Error('Regular error');
      
      ResponseHandler.error(res, error);

      expect(res.statusCode).toBe(500);
      const responseData = JSON.parse(res._getData());
      
      expect(responseData.success).toBe(false);
      expect(responseData.error.code).toBe('INTERNAL_ERROR');
      expect(responseData.error.message).toBe('Regular error');
    });

    it('should handle ValidationError from mongoose', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      
      ResponseHandler.error(res, error);

      expect(res.statusCode).toBe(400);
      const responseData = JSON.parse(res._getData());
      
      expect(responseData.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle CastError from mongoose', () => {
      const error = new Error('Cast failed');
      error.name = 'CastError';
      
      ResponseHandler.error(res, error);

      expect(res.statusCode).toBe(400);
      const responseData = JSON.parse(res._getData());
      
      expect(responseData.error.code).toBe('INVALID_FORMAT');
      expect(responseData.error.message).toBe('Invalid data format');
    });

    it('should handle MongoDB duplicate key error', () => {
      const error = new Error('Duplicate key') as any;
      error.name = 'MongoServerError';
      error.code = 11000;
      
      ResponseHandler.error(res, error);

      expect(res.statusCode).toBe(409);
      const responseData = JSON.parse(res._getData());
      
      expect(responseData.error.code).toBe('DUPLICATE_ENTRY');
      expect(responseData.error.message).toBe('Duplicate entry found');
    });
  });

  describe('paginated', () => {
    it('should send paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = { page: 1, limit: 2, total: 10 };
      
      ResponseHandler.paginated(res, data, pagination, {
        requestId: 'test-request-id'
      });

      expect(res.statusCode).toBe(200);
      const responseData = JSON.parse(res._getData());
      
      expect(responseData.success).toBe(true);
      expect(responseData.data).toEqual(data);
      expect(responseData.metadata.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 10,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: false
      });
    });
  });

  describe('created', () => {
    it('should send created response', () => {
      const data = { id: 1, name: 'New Resource' };
      
      ResponseHandler.created(res, data, 'Resource created', 'test-request-id');

      expect(res.statusCode).toBe(201);
      const responseData = JSON.parse(res._getData());
      
      expect(responseData.success).toBe(true);
      expect(responseData.data).toEqual(data);
      expect(responseData.message).toBe('Resource created');
      expect(responseData.metadata.requestId).toBe('test-request-id');
    });
  });

  describe('noContent', () => {
    it('should send no content response', () => {
      ResponseHandler.noContent(res);

      expect(res.statusCode).toBe(204);
      expect(res._getData()).toBe('');
    });
  });

  describe('notFound', () => {
    it('should send not found response', () => {
      ResponseHandler.notFound(res, 'User not found', 'test-request-id');

      expect(res.statusCode).toBe(404);
      const responseData = JSON.parse(res._getData());
      
      expect(responseData.success).toBe(false);
      expect(responseData.error.code).toBe('NOT_FOUND');
      expect(responseData.error.message).toBe('User not found');
      expect(responseData.error.requestId).toBe('test-request-id');
    });
  });

  describe('unauthorized', () => {
    it('should send unauthorized response', () => {
      ResponseHandler.unauthorized(res, 'Invalid token', 'test-request-id');

      expect(res.statusCode).toBe(401);
      const responseData = JSON.parse(res._getData());
      
      expect(responseData.success).toBe(false);
      expect(responseData.error.code).toBe('UNAUTHORIZED');
      expect(responseData.error.message).toBe('Invalid token');
    });
  });

  describe('forbidden', () => {
    it('should send forbidden response', () => {
      ResponseHandler.forbidden(res, 'Access denied', 'test-request-id');

      expect(res.statusCode).toBe(403);
      const responseData = JSON.parse(res._getData());
      
      expect(responseData.success).toBe(false);
      expect(responseData.error.code).toBe('FORBIDDEN');
      expect(responseData.error.message).toBe('Access denied');
    });
  });
});