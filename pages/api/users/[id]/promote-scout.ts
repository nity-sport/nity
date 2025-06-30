import { NextApiResponse } from 'next';
import mongoose from 'mongoose';
import User from '../../../../src/models/User';
import { UserRole } from '../../../../src/types/auth';
import { generateUniqueAffiliateCode } from '../../../../src/lib/affiliateCode';
import dbConnect from '../../../../src/lib/dbConnect';
import { 
  AuthenticatedRequest, 
  authenticate, 
  requireSuperuser, 
  createApiHandler 
} from '../../../../src/lib/auth-middleware';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    await dbConnect();

    const { id } = req.query;

    if (!id || typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (req.method === 'POST') {
      return handlePromoteToScout(req, res, id);
    } else if (req.method === 'DELETE') {
      return handleDemoteFromScout(req, res, id);
    } else {
      res.setHeader('Allow', ['POST', 'DELETE']);
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[API /users/[id]/promote-scout] Handler error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

const handlePromoteToScout = async (req: AuthenticatedRequest, res: NextApiResponse, userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === UserRole.SCOUT) {
      return res.status(400).json({ message: 'User is already a Scout' });
    }

    // Generate unique affiliate code
    const checkCodeExists = async (code: string) => {
      const existingUser = await User.findOne({ affiliateCode: code });
      return !existingUser;
    };

    const affiliateCode = await generateUniqueAffiliateCode(checkCodeExists);

    // Update user to Scout
    user.role = UserRole.SCOUT;
    user.affiliateCode = affiliateCode;
    await user.save();

    const userResponse = {
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
    };

    return res.status(200).json({
      message: 'User promoted to Scout successfully',
      user: userResponse,
      affiliateCode: affiliateCode
    });
  } catch (error) {
    console.error('Error promoting user to Scout:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const handleDemoteFromScout = async (req: AuthenticatedRequest, res: NextApiResponse, userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== UserRole.SCOUT) {
      return res.status(400).json({ message: 'User is not a Scout' });
    }

    // Check if Scout has active referrals
    const referralCount = await User.countDocuments({ referredBy: user.affiliateCode });
    
    if (referralCount > 0) {
      return res.status(400).json({ 
        message: `Cannot demote Scout: has ${referralCount} active referrals. Consider transferring referrals first.`,
        referralCount 
      });
    }

    // Demote to regular user
    user.role = UserRole.USER;
    user.affiliateCode = undefined;
    await user.save();

    const userResponse = {
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
    };

    return res.status(200).json({
      message: 'Scout demoted to regular user successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error demoting Scout:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createApiHandler(handler, [
  authenticate,
  requireSuperuser
]);