import { NextApiResponse } from 'next';
import mongoose from 'mongoose';
import Coupon from '../../../src/models/Coupon';
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

    if (req.method === 'POST') {
      return handleUseCoupon(req, res);
    } else {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[API /coupons/use] Handler error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

const handleUseCoupon = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { code } = req.body;
    const userId = req.user!.id;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const upperCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: upperCode })
      .populate('createdBy', 'name email avatar') as any;

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (!coupon.isValid()) {
      let reason = 'Invalid coupon';
      if (!coupon.isActive) {
        reason = 'Coupon is inactive';
      } else if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        reason = 'Coupon has expired';
      } else if (coupon.maxUses && coupon.uses >= coupon.maxUses) {
        reason = 'Coupon usage limit reached';
      }
      return res.status(400).json({ message: reason });
    }

    if (coupon.usedBy.some(id => id.toString() === userId)) {
      return res.status(400).json({ message: 'You have already used this coupon' });
    }

    coupon.uses += 1;
    coupon.usedBy.push(new mongoose.Types.ObjectId(userId));
    await coupon.save();

    const discount = coupon.discountValue || coupon.discountPercentage;
    const discountType = coupon.discountValue ? 'value' : 'percentage';

    return res.status(200).json({
      message: 'Coupon applied successfully',
      coupon: {
        id: coupon._id.toString(),
        code: coupon.code,
        discount,
        discountType,
        creator: {
          id: coupon.createdBy._id.toString(),
          name: coupon.createdBy.name,
          email: coupon.createdBy.email,
          avatar: coupon.createdBy.avatar
        }
      },
      discount: {
        value: coupon.discountValue,
        percentage: coupon.discountPercentage,
        type: discountType
      }
    });
  } catch (error) {
    console.error('Error using coupon:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createApiHandler(handler, [
  authenticate,
  requireAuthenticated
]);