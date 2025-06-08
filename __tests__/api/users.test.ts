import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/users/index';
import User, { UserRole } from '../../src/models/User';
import jwt from 'jsonwebtoken';

jest.mock('../../src/models/User');
jest.mock('../../src/lib/dbConnect');
jest.mock('jsonwebtoken');

const mockUser = jest.mocked(User);
const mockJwt = jest.mocked(jwt);

describe('/api/users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return users list for authenticated user', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      mockJwt.verify.mockReturnValue({ userId: 'user123' } as any);
      
      const mockAuthUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: UserRole.SUPERUSER
      };

      const mockUsers = [
        {
          _id: 'user1',
          email: 'user1@example.com',
          name: 'User 1',
          role: UserRole.USER,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'user2',
          email: 'user2@example.com',
          name: 'User 2',
          role: UserRole.MARKETING,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockUser.findById.mockResolvedValue(mockAuthUser);
      mockUser.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockUsers)
            })
          })
        })
      } as any);
      mockUser.countDocuments.mockResolvedValue(2);

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.users).toHaveLength(2);
      expect(data.pagination).toBeDefined();
    });

    it('should filter users by role', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { role: UserRole.MARKETING },
        headers: {
          authorization: 'Bearer valid-token'
        }
      });

      mockJwt.verify.mockReturnValue({ userId: 'user123' } as any);
      
      const mockAuthUser = {
        _id: 'user123',
        email: 'test@example.com',
        role: UserRole.SUPERUSER
      };

      mockUser.findById.mockResolvedValue(mockAuthUser);
      mockUser.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue([])
            })
          })
        })
      } as any);
      mockUser.countDocuments.mockResolvedValue(0);

      await handler(req as any, res as any);

      expect(mockUser.find).toHaveBeenCalledWith({ role: UserRole.MARKETING });
      expect(res._getStatusCode()).toBe(200);
    });

    it('should require authentication', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('No token provided');
    });
  });

  describe('POST /api/users', () => {
    it('should create user with SUPERUSER role', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token'
        },
        body: {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          role: UserRole.MARKETING
        }
      });

      mockJwt.verify.mockReturnValue({ userId: 'user123' } as any);
      
      const mockAuthUser = {
        _id: 'user123',
        email: 'superuser@example.com',
        role: UserRole.SUPERUSER
      };

      const mockNewUser = {
        _id: 'new-user-id',
        email: 'newuser@example.com',
        name: 'New User',
        role: UserRole.MARKETING,
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: 'new-user-id',
          email: 'newuser@example.com',
          name: 'New User',
          role: UserRole.MARKETING
        })
      };

      mockUser.findById.mockResolvedValue(mockAuthUser);
      mockUser.findOne.mockResolvedValue(null); // No existing user
      mockUser.mockImplementation(() => mockNewUser as any);

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('User created successfully');
      expect(data.user.email).toBe('newuser@example.com');
    });

    it('should not allow non-superuser to create users', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token'
        },
        body: {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User'
        }
      });

      mockJwt.verify.mockReturnValue({ userId: 'user123' } as any);
      
      const mockAuthUser = {
        _id: 'user123',
        email: 'regular@example.com',
        role: UserRole.USER
      };

      mockUser.findById.mockResolvedValue(mockAuthUser);

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(403);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('Insufficient permissions');
    });

    it('should validate required fields', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token'
        },
        body: {
          email: 'newuser@example.com'
          // Missing name
        }
      });

      mockJwt.verify.mockReturnValue({ userId: 'user123' } as any);
      
      const mockAuthUser = {
        _id: 'user123',
        email: 'superuser@example.com',
        role: UserRole.SUPERUSER
      };

      mockUser.findById.mockResolvedValue(mockAuthUser);

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('Email and name are required');
    });
  });

  describe('Unsupported methods', () => {
    it('should return 405 for unsupported methods', async () => {
      const { req, res } = createMocks({
        method: 'DELETE'
      });

      await handler(req as any, res as any);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.message).toBe('Method not allowed');
    });
  });
});