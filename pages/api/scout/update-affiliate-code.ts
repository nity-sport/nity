import { NextApiResponse } from 'next';
import User from '../../../src/models/User';
import dbConnect from '../../../src/lib/dbConnect';
import { 
  AuthenticatedRequest, 
  authenticate, 
  requireAuthenticated, 
  createApiHandler 
} from '../../../src/lib/auth-middleware';
import { UserRole } from '../../../src/types/auth';
import { generateAffiliateCode } from '../../../src/lib/affiliateCode';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const userId = req.user!.id;

    // Check if user is scout
    if (req.user!.role !== UserRole.SCOUT) {
      return res.status(403).json({ message: 'Only scouts can update affiliate code' });
    }

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has affiliate code
    if (user.affiliateCode) {
      return res.status(200).json({ 
        message: 'Affiliate code already exists',
        affiliateCode: user.affiliateCode 
      });
    }

    // Generate new affiliate code
    const affiliateCode = generateAffiliateCode();

    // Update user with affiliate code
    await User.findByIdAndUpdate(userId, { affiliateCode });

    return res.status(200).json({
      message: 'Affiliate code generated successfully',
      affiliateCode
    });

  } catch (error) {
    console.error('Error updating affiliate code:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createApiHandler(handler, [
  authenticate,
  requireAuthenticated
]);