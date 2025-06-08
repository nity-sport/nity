import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/users/[id]/role';
import User, { UserRole } from '../../src/models/User';
import jwt from 'jsonwebtoken';

jest.mock('../../src/models/User');
jest.mock('../../src/lib/dbConnect');
jest.mock('jsonwebtoken');

const mockUser = jest.mocked(User);
const mockJwt = jest.mocked(jwt);

describe('/api/users/[id]/role', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH /api/users/[id]/role', () => {
    it('should change user role as superuser', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { id: '507f1f77bcf86cd799439011' },
        headers: {
          authorization: 'Bearer valid-token'
        },
        body: {
          role: UserRole.MARKETING
        }
      });

      mockJwt.verify.mockReturnValue({ userId: 'superuser123' } as any);
      
      const mockAuthUser = {
        _id: 'superuser123',
        email: 'superuser@example.com',
        role: UserRole.SUPERUSER
      };

      const mockTargetUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'target@example.com',
        name: 'Target User',
        role: UserRole.USER,
        toString: () => '507f1f77bcf86cd799439011'
      };

      const mockUpdatedUser = {
        ...mockTargetUser,
        role: UserRole.MARKETING
      };

      mockUser.findById.mockImplementation((id) => {
        if (id === 'superuser123') {
          return Promise.resolve({ ...mockAuthUser, select: jest.fn().mockReturnThis() });
        }
        return Promise.resolve(mockTargetUser);
      });

      mockUser.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUpdatedUser)
      } as any);

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('User role updated successfully');
      expect(data.user.role).toBe(UserRole.MARKETING);
    });

    it('should not allow non-superuser to change roles', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { id: '507f1f77bcf86cd799439011' },
        headers: {
          authorization: 'Bearer valid-token'
        },
        body: {
          role: UserRole.MARKETING
        }
      });

      mockJwt.verify.mockReturnValue({ userId: 'user123' } as any);
      
      const mockAuthUser = {
        _id: 'user123',
        email: 'user@example.com',
        role: UserRole.USER
      };

      mockUser.findById.mockResolvedValue({ ...mockAuthUser, select: jest.fn().mockReturnThis() });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('Insufficient permissions');
    });

    it('should not allow user to change their own role', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { id: userId },
        headers: {
          authorization: 'Bearer valid-token'
        },
        body: {
          role: UserRole.MARKETING
        }
      });

      mockJwt.verify.mockReturnValue({ userId } as any);
      
      const mockAuthUser = {
        _id: userId,
        email: 'superuser@example.com',
        role: UserRole.SUPERUSER
      };

      const mockTargetUser = {
        _id: userId,
        email: 'superuser@example.com',
        toString: () => userId
      };

      mockUser.findById.mockImplementation((id) => {
        if (id === userId) {
          return Promise.resolve(mockTargetUser);
        }
        return Promise.resolve({ ...mockAuthUser, select: jest.fn().mockReturnThis() });
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('Cannot change your own role');
    });

    it('should validate role value', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { id: '507f1f77bcf86cd799439011' },
        headers: {
          authorization: 'Bearer valid-token'
        },
        body: {
          role: 'INVALID_ROLE'
        }
      });

      mockJwt.verify.mockReturnValue({ userId: 'superuser123' } as any);
      
      const mockAuthUser = {
        _id: 'superuser123',
        email: 'superuser@example.com',
        role: UserRole.SUPERUSER
      };

      mockUser.findById.mockResolvedValue({ ...mockAuthUser, select: jest.fn().mockReturnThis() });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('Invalid role');
      expect(data.validRoles).toEqual(Object.values(UserRole));
    });

    it('should return 404 for non-existent user', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { id: '507f1f77bcf86cd799439011' },
        headers: {
          authorization: 'Bearer valid-token'
        },
        body: {
          role: UserRole.MARKETING
        }
      });

      mockJwt.verify.mockReturnValue({ userId: 'superuser123' } as any);
      
      const mockAuthUser = {
        _id: 'superuser123',
        email: 'superuser@example.com',
        role: UserRole.SUPERUSER
      };

      mockUser.findById.mockImplementation((id) => {
        if (id === 'superuser123') {
          return Promise.resolve({ ...mockAuthUser, select: jest.fn().mockReturnThis() });
        }
        return Promise.resolve(null);
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('User not found');
    });
  });

  describe('Unsupported methods', () => {
    it('should return 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: '507f1f77bcf86cd799439011' }
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('Method not allowed');
    });
  });

  describe('Input validation', () => {
    it('should return 400 for invalid ObjectId', async () => {
      const { req, res } = createMocks({
        method: 'PATCH',
        query: { id: 'invalid-id' },
        body: { role: UserRole.MARKETING }
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('Invalid user ID');
    });
  });
});