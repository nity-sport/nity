import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';
import dbConnect from './dbConnect';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    await dbConnect();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

export const requireSuperuser = authorize([UserRole.SUPERUSER]);

export const requireMarketingOrHigher = authorize([
  UserRole.SUPERUSER,
  UserRole.MARKETING
]);

export const requireOwnerOrHigher = authorize([
  UserRole.SUPERUSER,
  UserRole.OWNER
]);

export const requireAuthenticated = authorize([
  UserRole.SUPERUSER,
  UserRole.MARKETING,
  UserRole.OWNER,
  UserRole.USER,
  UserRole.ATHLETE
]);

export const createApiHandler = (
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
  middlewares: Array<(req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => void> = []
) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    let middlewareIndex = 0;

    const runMiddleware = () => {
      if (middlewareIndex >= middlewares.length) {
        return handler(req, res);
      }

      const middleware = middlewares[middlewareIndex++];
      return middleware(req, res, runMiddleware);
    };

    return runMiddleware();
  };
};