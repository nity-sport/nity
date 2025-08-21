import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../src/lib/dbConnect';
import User from '../../../src/models/User';
import { hashPassword, generateToken } from '../../../src/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { email, password, name, referralCode, teamId, role } = req.body;

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

    // Validate referral code if provided
    let referralValid = false;
    let scoutUser = null;
    let targetTeam = null;

    if (referralCode) {
      const referralCodeUpper = referralCode.trim().toUpperCase();
      scoutUser = await User.findOne({ affiliateCode: referralCodeUpper });
      if (!scoutUser) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
      referralValid = true;

      // If teamId is provided, validate it belongs to the scout
      if (teamId) {
        const Team = require('../../../src/models/Team').default;
        targetTeam = await Team.findOne({
          _id: teamId,
          scoutId: scoutUser._id,
        });
        if (!targetTeam) {
          return res
            .status(400)
            .json({ message: 'Invalid team or team does not belong to scout' });
        }
      }
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      provider: 'email',
      ...(role && { role }),
      ...(referralValid && { referredBy: referralCode.trim().toUpperCase() }),
    });

    await user.save();

    // If user was invited to a team, add them to the team
    if (targetTeam) {
      const Team = require('../../../src/models/Team').default;
      await Team.findByIdAndUpdate(targetTeam._id, {
        $addToSet: { memberIds: user._id },
      });

      // Also add team to user's teams array
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { teams: targetTeam._id },
      });
    }

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
      message: 'User created successfully',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
