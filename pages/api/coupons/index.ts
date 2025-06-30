import { NextApiResponse } from 'next';
import Coupon from '../../../src/models/Coupon';
import User from '../../../src/models/User';
import { UserRole } from '../../../src/types/auth';
import dbConnect from '../../../src/lib/dbConnect';
import { 
  AuthenticatedRequest, 
  authenticate, 
  requireAuthenticated, 
  createApiHandler 
} from '../../../src/lib/auth-middleware';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    await dbConnect();

    if (req.method === 'GET') {
      return handleGetCoupons(req, res);
    } else if (req.method === 'POST') {
      return handleCreateCoupon(req, res);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[API /coupons] Handler error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

const handleGetCoupons = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { page = 1, limit = 10, onlyMine, includeStats } = req.query;
    const userId = req.user!.id;

    let filter: any = {};

    if (onlyMine === 'true') {
      filter.createdBy = userId;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const coupons = await Coupon.find(filter)
      .populate('createdBy', 'name email avatar')
      .populate('usedBy', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)) as any[];

    const total = await Coupon.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    const couponsResponse = coupons.map(coupon => ({
      id: coupon._id.toString(),
      code: coupon.code,
      discountValue: coupon.discountValue,
      discountPercentage: coupon.discountPercentage,
      createdBy: coupon.createdBy._id.toString(),
      creator: {
        id: coupon.createdBy._id.toString(),
        name: coupon.createdBy.name,
        email: coupon.createdBy.email,
        avatar: coupon.createdBy.avatar
      },
      uses: coupon.uses,
      usedBy: coupon.usedBy.map(user => user._id.toString()),
      users: coupon.usedBy.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar
      })),
      maxUses: coupon.maxUses,
      expiresAt: coupon.expiresAt,
      isActive: coupon.isActive,
      isValid: coupon.isValid(),
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt
    }));

    let stats = null;
    if (includeStats === 'true') {
      const statsData = await Coupon.aggregate([
        onlyMine === 'true' ? { $match: { createdBy: userId } } : { $match: {} },
        {
          $group: {
            _id: null,
            totalCoupons: { $sum: 1 },
            activeCoupons: {
              $sum: {
                $cond: [{ $eq: ['$isActive', true] }, 1, 0]
              }
            },
            totalUses: { $sum: '$uses' },
            totalDiscountValue: {
              $sum: {
                $cond: [
                  { $ne: ['$discountValue', null] },
                  { $multiply: ['$discountValue', '$uses'] },
                  0
                ]
              }
            }
          }
        }
      ]);

      stats = statsData[0] || {
        totalCoupons: 0,
        activeCoupons: 0,
        totalUses: 0,
        totalDiscountValue: 0
      };
    }

    return res.status(200).json({
      coupons: couponsResponse,
      stats,
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
    console.error('Error fetching coupons:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const handleCreateCoupon = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { code, discountValue, discountPercentage, maxUses, expiresAt } = req.body;
    const createdBy = req.user!.id;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    if (!discountValue && !discountPercentage) {
      return res.status(400).json({ message: 'Either discountValue or discountPercentage must be provided' });
    }

    if (discountValue && discountPercentage) {
      return res.status(400).json({ message: 'Provide either discountValue or discountPercentage, not both' });
    }

    if (discountValue && (typeof discountValue !== 'number' || discountValue <= 0)) {
      return res.status(400).json({ message: 'discountValue must be a positive number' });
    }

    if (discountPercentage && (typeof discountPercentage !== 'number' || discountPercentage <= 0 || discountPercentage > 100)) {
      return res.status(400).json({ message: 'discountPercentage must be a number between 1 and 100' });
    }

    const user = await User.findById(createdBy).select('role');
    if (!user || user.role !== UserRole.SCOUT) {
      return res.status(403).json({ message: 'Only Scout users can create coupons' });
    }

    const upperCode = code.trim().toUpperCase();
    const existingCoupon = await Coupon.findOne({ code: upperCode });

    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const couponData: any = {
      code: upperCode,
      createdBy,
      uses: 0,
      usedBy: [],
      isActive: true
    };

    if (discountValue) {
      couponData.discountValue = discountValue;
    } else {
      couponData.discountPercentage = discountPercentage;
    }

    if (maxUses && typeof maxUses === 'number' && maxUses > 0) {
      couponData.maxUses = maxUses;
    }

    if (expiresAt) {
      const expireDate = new Date(expiresAt);
      if (expireDate <= new Date()) {
        return res.status(400).json({ message: 'Expiration date must be in the future' });
      }
      couponData.expiresAt = expireDate;
    }

    const coupon = new Coupon(couponData);
    await coupon.save();

    const populatedCoupon = await Coupon.findById(coupon._id)
      .populate('createdBy', 'name email avatar') as any;

    const couponResponse = {
      id: populatedCoupon._id.toString(),
      code: populatedCoupon.code,
      discountValue: populatedCoupon.discountValue,
      discountPercentage: populatedCoupon.discountPercentage,
      createdBy: populatedCoupon.createdBy._id.toString(),
      creator: {
        id: populatedCoupon.createdBy._id.toString(),
        name: populatedCoupon.createdBy.name,
        email: populatedCoupon.createdBy.email,
        avatar: populatedCoupon.createdBy.avatar
      },
      uses: populatedCoupon.uses,
      usedBy: [],
      users: [],
      maxUses: populatedCoupon.maxUses,
      expiresAt: populatedCoupon.expiresAt,
      isActive: populatedCoupon.isActive,
      isValid: populatedCoupon.isValid(),
      createdAt: populatedCoupon.createdAt,
      updatedAt: populatedCoupon.updatedAt
    };

    return res.status(201).json({
      message: 'Coupon created successfully',
      coupon: couponResponse
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createApiHandler(handler, [
  authenticate,
  requireAuthenticated
]);