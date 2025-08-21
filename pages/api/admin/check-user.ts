import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../src/lib/dbConnect';
import User from '../../../src/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email parameter required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      affiliateCode: user.affiliateCode,
      hasAffiliateCode: !!user.affiliateCode,
      affiliateCodeValue: user.affiliateCode || 'NOT_SET',
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
