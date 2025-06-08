import { NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import User, { UserRole } from '../../../src/models/User';
import dbConnect from '../../../src/lib/dbConnect';
import { 
  AuthenticatedRequest, 
  authenticate, 
  requireAuthenticated, 
  requireSuperuser,
  createApiHandler 
} from '../../../src/lib/auth-middleware';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  await dbConnect();

  if (req.method === 'GET') {
    return handleGetUsers(req, res);
  } else if (req.method === 'POST') {
    return handleCreateUser(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
};

const handleGetUsers = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
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

    const skip = (Number(page) - 1) * Number(limit);
    
    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

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
    return res.status(500).json({ message: 'Internal server error' });
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