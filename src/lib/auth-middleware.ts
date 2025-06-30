import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Team from '../models/Team';
import { UserRole } from '../types/auth';
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
    console.log('[Auth Middleware] Starting authentication...');
    console.log('[Auth Middleware] Method:', req.method);
    console.log('[Auth Middleware] URL:', req.url);
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('[Auth Middleware] No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('[Auth Middleware] Token found, verifying...');
    
    if (!process.env.JWT_SECRET) {
      console.error('[Auth Middleware] JWT_SECRET not found in environment');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('[Auth Middleware] Token decoded successfully, userId:', decoded.userId);
    
    console.log('[Auth Middleware] Connecting to database for user lookup...');
    await dbConnect();
    console.log('[Auth Middleware] Looking up user...');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('[Auth Middleware] User not found for userId:', decoded.userId);
      return res.status(401).json({ message: 'Invalid token' });
    }

    console.log('[Auth Middleware] User found:', { 
      id: user._id.toString(),
      email: user.email,
      role: user.role 
    });

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };

    console.log('[Auth Middleware] Authentication successful, calling next()');
    next();
  } catch (error) {
    console.error('[Auth Middleware] Authentication failed:', error);
    console.error('[Auth Middleware] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    });
    return res.status(401).json({ message: 'Invalid token', error: error instanceof Error ? error.message : 'Unknown error' });
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
  UserRole.SCOUT,
  UserRole.USER,
  UserRole.ATHLETE
]);

// Helper function that returns authenticated user or null
export const authenticateToken = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ id: string; email: string; name: string; role: UserRole } | null> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return null;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ message: 'Server configuration error' });
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    await dbConnect();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      res.status(401).json({ message: 'Invalid token' });
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
    return null;
  }
};

export const createApiHandler = (
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
  middlewares: Array<(req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => void> = []
) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    let middlewareIndex = 0;

    const runMiddleware = async (): Promise<void> => {
      if (middlewareIndex >= middlewares.length) {
        return await handler(req, res);
      }

      const middleware = middlewares[middlewareIndex++];
      return new Promise<void>((resolve, reject) => {
        try {
          middleware(req, res, () => {
            runMiddleware().then(resolve).catch(reject);
          });
        } catch (error) {
          reject(error);
        }
      });
    };

    try {
      await runMiddleware();
    } catch (error) {
      console.error('Middleware or handler error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };
};

// Scout permission helpers
export const isScout = async (userId: string): Promise<boolean> => {
  try {
    await dbConnect();
    const user = await User.findById(userId).select('role');
    return user && user.role === UserRole.SCOUT;
  } catch (error) {
    console.error('Error checking scout status:', error);
    return false;
  }
};

export const requireScout = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const userIsScout = await isScout(req.user.id);
  if (!userIsScout) {
    return res.status(403).json({ 
      message: 'Access denied. Only Scout users can perform this action.' 
    });
  }

  next();
};

export const requireTeamScout = (teamIdParam: string = 'id') => {
  return async (req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const teamId = req.query[teamIdParam] as string;
    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required' });
    }

    try {
      await dbConnect();
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }

      if (team.scoutId.toString() !== req.user.id) {
        return res.status(403).json({ 
          message: 'Access denied. Only the team scout can perform this action.' 
        });
      }

      next();
    } catch (error) {
      console.error('Error checking team scout permission:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

export const requireCouponCreator = (couponIdParam: string = 'id') => {
  return async (req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const couponId = req.query[couponIdParam] as string;
    if (!couponId) {
      return res.status(400).json({ message: 'Coupon ID is required' });
    }

    try {
      await dbConnect();
      const Coupon = (await import('../models/Coupon')).default;
      const coupon = await Coupon.findById(couponId);
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      if (coupon.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ 
          message: 'Access denied. Only the coupon creator can perform this action.' 
        });
      }

      next();
    } catch (error) {
      console.error('Error checking coupon creator permission:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};