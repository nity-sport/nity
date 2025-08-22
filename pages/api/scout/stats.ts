import { NextApiResponse } from 'next';
import User from '../../../src/models/User';

import dbConnect from '../../../src/lib/dbConnect';
import {
  AuthenticatedRequest,
  authenticate,
  requireScout,
  createApiHandler,
} from '../../../src/lib/auth-middleware';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    await dbConnect();

    if (req.method === 'GET') {
      return handleGetScoutStats(req, res);
    } else {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[API /scout/stats] Handler error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? error.message : 'Server error',
    });
  }
};

const handleGetScoutStats = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  try {
    const scoutId = req.user!.id;

    // Get scout user to get affiliate code
    const scout = await User.findById(scoutId).select(
      'affiliateCode name email'
    );
    if (!scout || !scout.affiliateCode) {
      return res
        .status(404)
        .json({ message: 'Scout affiliate code not found' });
    }

    // Get referral statistics
    const totalReferrals = await User.countDocuments({
      referredBy: scout.affiliateCode,
    });

    const recentReferrals = await User.find({ referredBy: scout.affiliateCode })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    const referralsByMonth = await User.aggregate([
      { $match: { referredBy: scout.affiliateCode } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    // Get this month's referrals
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthReferrals = await User.countDocuments({
      referredBy: scout.affiliateCode,
      createdAt: { $gte: startOfMonth },
    });

    // Get this week's referrals
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekReferrals = await User.countDocuments({
      referredBy: scout.affiliateCode,
      createdAt: { $gte: startOfWeek },
    });

    const stats = {
      scout: {
        id: scout._id.toString(),
        name: scout.name,
        email: scout.email,
        affiliateCode: scout.affiliateCode,
      },
      totalReferrals,
      thisMonthReferrals,
      thisWeekReferrals,
      recentReferrals: recentReferrals.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      })),
      referralsByMonth: referralsByMonth.map(item => ({
        year: item._id.year,
        month: item._id.month,
        count: item.count,
      })),
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching scout stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createApiHandler(handler, [authenticate, requireScout]);
