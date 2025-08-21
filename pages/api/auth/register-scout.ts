import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../src/lib/dbConnect';
import User from '../../../src/models/User';
import { hashPassword, generateToken } from '../../../src/lib/auth';
import { UserRole } from '../../../src/types/auth';
import { generateAffiliateCode } from '../../../src/lib/affiliateCode';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const affiliateCode = generateAffiliateCode();

    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      provider: 'email',
      role: UserRole.SCOUT,
      affiliateCode,
    });

    await user.save();

    const token = generateToken(user._id.toString());

    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
      role: user.role,
      affiliateCode: user.affiliateCode,
      referredBy: user.referredBy,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(201).json({
      message: 'Scout registered successfully',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Scout registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
