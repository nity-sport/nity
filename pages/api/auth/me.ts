import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../src/lib/dbConnect';
import User from '../../../src/models/User';
import { verifyToken, getTokenFromHeader } from '../../../src/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const token = getTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    console.log('[API /auth/me] User found:', {
      id: userResponse.id,
      email: userResponse.email,
      role: userResponse.role,
      roleType: typeof userResponse.role
    });

    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}