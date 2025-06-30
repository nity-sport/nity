import { NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import User from '../../../src/models/User';
import { UserRole } from '../../../src/types/auth';
import dbConnect from '../../../src/lib/dbConnect';
import { 
  AuthenticatedRequest, 
  authenticate, 
  requireAuthenticated, 
  requireSuperuser,
  createApiHandler 
} from '../../../src/lib/auth-middleware';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    console.log('[API /users] Handler started, method:', req.method);
    console.log('[API /users] Connecting to database...');
    await dbConnect();
    console.log('[API /users] Database connected successfully');

    if (req.method === 'GET') {
      return handleGetUsers(req, res);
    } else if (req.method === 'POST') {
      return handleCreateUser(req, res);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[API /users] Handler error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

const handleGetUsers = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    console.log('[API /users] Starting get users request');
    console.log('[API /users] User:', req.user);
    console.log('[API /users] Query params:', req.query);

    const { role, page = 1, limit = 10, search } = req.query;
    
    const filter: any = {};
    
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      filter.role = role;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('[API /users] Filter:', filter);

    const skip = (Number(page) - 1) * Number(limit);
    
    console.log('[API /users] Querying database...');
    const usersFromDb = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    console.log('[API /users] Found users:', usersFromDb.length);

    const users = usersFromDb.map(user => ({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      provider: user.provider,
      isVerified: user.isVerified,
      affiliateCode: user.affiliateCode,
      referredBy: user.referredBy,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    console.log('[API /users] Counting total documents...');
    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    console.log('[API /users] Sending response with', users.length, 'users');

    return res.status(200).json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

const handleCreateUser = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { email, password, name, role = UserRole.USER } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const user = new User({
      email,
      password: hashedPassword,
      name,
      role,
      provider: 'email',
      isVerified: false
    });

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpires;

    return res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createApiHandler(handler, [
  authenticate,
  (req, res, next) => {
    if (req.method === 'POST') {
      return requireSuperuser(req, res, next);
    } else {
      return requireAuthenticated(req, res, next);
    }
  }
]);