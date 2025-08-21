import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../src/lib/dbConnect';
import User from '../../../src/models/User';
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

    // Find all scouts without affiliate codes
    const scoutsWithoutCodes = await User.find({
      role: UserRole.SCOUT,
      $or: [
        { affiliateCode: { $exists: false } },
        { affiliateCode: null },
        { affiliateCode: '' },
      ],
    });

    const updates = [];

    for (const scout of scoutsWithoutCodes) {
      const affiliateCode = generateAffiliateCode();

      // Make sure the code is unique
      const existingCode = await User.findOne({ affiliateCode });
      if (existingCode) {
        continue; // Try again with new code
      }

      await User.findByIdAndUpdate(scout._id, { affiliateCode });

      updates.push({
        userId: scout._id.toString(),
        email: scout.email,
        name: scout.name,
        affiliateCode,
      });
    }

    return res.status(200).json({
      message: `Updated ${updates.length} scouts with affiliate codes`,
      updates,
    });
  } catch (error) {
    console.error('Error fixing scout codes:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
