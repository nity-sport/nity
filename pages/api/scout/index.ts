import { NextApiResponse } from 'next';
import User from '../../../src/models/User';
import { UserRole } from '../../../src/types/auth';
import dbConnect from '../../../src/lib/dbConnect';
import {
  AuthenticatedRequest,
  authenticate,
  requireSuperuser,
  createApiHandler,
} from '../../../src/lib/auth-middleware';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    await dbConnect();

    if (req.method === 'GET') {
      return handleGetScouts(req, res);
    } else {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[API /scout] Handler error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? error.message : 'Server error',
    });
  }
};

const handleGetScouts = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const filter: any = { role: UserRole.SCOUT };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { affiliateCode: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const scouts = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    // Get referral counts for each scout
    const scoutsWithStats = await Promise.all(
      scouts.map(async scout => {
        const referralCount = await User.countDocuments({
          referredBy: scout.affiliateCode,
        });

        const thisMonthStart = new Date();
        thisMonthStart.setDate(1);
        thisMonthStart.setHours(0, 0, 0, 0);

        const thisMonthReferrals = await User.countDocuments({
          referredBy: scout.affiliateCode,
          createdAt: { $gte: thisMonthStart },
        });

        return {
          id: scout._id.toString(),
          email: scout.email,
          name: scout.name,
          role: scout.role,
          avatar: scout.avatar,
          provider: scout.provider,
          isVerified: scout.isVerified,
          affiliateCode: scout.affiliateCode,
          referredBy: scout.referredBy,
          createdAt: scout.createdAt,
          updatedAt: scout.updatedAt,
          stats: {
            totalReferrals: referralCount,
            thisMonthReferrals,
          },
        };
      })
    );

    return res.status(200).json({
      scouts: scoutsWithStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching scouts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createApiHandler(handler, [authenticate, requireSuperuser]);
