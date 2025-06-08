import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/users/[id]';
import User, { UserRole } from '../../src/models/User';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

jest.mock('../../src/models/User');
jest.mock('../../src/lib/dbConnect');
jest.mock('jsonwebtoken');

const mockUser = jest.mocked(User);
const mockJwt = jest.mocked(jwt);

describe('/api/users/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/[id]', () => {
    it('should return user for superuser', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: '507f1f77bcf86cd799439011' },
        headers: {
          authorization: 'Bearer valid-token'
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
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUser.findById.mockImplementation((id) => {
        if (id === 'superuser123') {
          return Promise.resolve({ ...mockAuthUser, select: jest.fn().mockReturnThis() });
        }
        return {
          select: jest.fn().mockResolvedValue(mockTargetUser)
        } as any;
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.user.email).toBe('target@example.com');
    });

    it('should allow user to view their own profile', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: userId },
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      mockJwt.verify.mockReturnValue({ userId } as any);
      
      const mockAuthUser = {
        _id: userId,
        email: 'user@example.com',
        role: UserRole.USER
      };

      const mockTargetUser = {
        _id: userId,
        email: 'user@example.com',
        name: 'User',
        role: UserRole.USER,
        toString: () => userId
      };

      mockUser.findById.mockImplementation((id) => {
        if (id === userId) {
          return {
            select: jest.fn().mockResolvedValue(mockTargetUser)
          } as any;
        }
        return Promise.resolve({ ...mockAuthUser, select: jest.fn().mockReturnThis() });
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
    });

    it('should deny access to other users profile for non-superuser', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: '507f1f77bcf86cd799439011' },
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      mockJwt.verify.mockReturnValue({ userId: 'user123' } as any);
      
      const mockAuthUser = {
        _id: 'user123',
        email: 'user@example.com',
        role: UserRole.USER
      };

      const mockTargetUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'target@example.com',
        name: 'Target User',
        role: UserRole.USER,
        toString: () => '507f1f77bcf86cd799439011'
      };

      mockUser.findById.mockImplementation((id) => {
        if (id === 'user123') {
          return Promise.resolve({ ...mockAuthUser, select: jest.fn().mockReturnThis() });
        }
        return {
          select: jest.fn().mockResolvedValue(mockTargetUser)
        } as any;
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('Access denied');
    });

    it('should return 404 for non-existent user', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: '507f1f77bcf86cd799439011' },
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      mockJwt.verify.mockReturnValue({ userId: 'user123' } as any);
      
      const mockAuthUser = {
        _id: 'user123',
        email: 'user@example.com',
        role: UserRole.SUPERUSER
      };

      mockUser.findById.mockImplementation((id) => {
        if (id === 'user123') {
          return Promise.resolve({ ...mockAuthUser, select: jest.fn().mockReturnThis() });
        }
        return {
          select: jest.fn().mockResolvedValue(null)
        } as any;
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('User not found');
    });
  });

  describe('DELETE /api/users/[id]', () => {
    it('should delete user as superuser', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: '507f1f77bcf86cd799439011' },
        headers: {
          authorization: 'Bearer valid-token'
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
        toString: () => '507f1f77bcf86cd799439011'
      };

      mockUser.findById.mockImplementation((id) => {
        if (id === 'superuser123') {
          return Promise.resolve({ ...mockAuthUser, select: jest.fn().mockReturnThis() });
        }
        return Promise.resolve(mockTargetUser);
      });

      mockUser.findByIdAndDelete.mockResolvedValue(mockTargetUser);

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('User deleted successfully');
    });

    it('should not allow user to delete themselves', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: userId },
        headers: {
          authorization: 'Bearer valid-token'
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
      expect(data.message).toBe('Cannot delete your own account');
    });

    it('should not allow non-superuser to delete users', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: '507f1f77bcf86cd799439011' },
        headers: {
          authorization: 'Bearer valid-token'
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
  });

  describe('Input validation', () => {
    it('should return 400 for invalid ObjectId', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: 'invalid-id' }
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('Invalid user ID');
    });
  });
});