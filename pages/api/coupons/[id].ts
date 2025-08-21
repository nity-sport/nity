import { NextApiResponse } from 'next';
import mongoose from 'mongoose';
import Coupon from '../../../src/models/Coupon';
import Team from '../../../src/models/Team';
import dbConnect from '../../../src/lib/dbConnect';
import {
  AuthenticatedRequest,
  authenticate,
  requireAuthenticated,
  createApiHandler,
} from '../../../src/lib/auth-middleware';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    await dbConnect();

    const { id } = req.query;

    if (!id || typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid coupon ID' });
    }

    if (req.method === 'GET') {
      return handleGetCoupon(req, res, id);
    } else if (req.method === 'PUT') {
      return handleUpdateCoupon(req, res, id);
    } else if (req.method === 'DELETE') {
      return handleDeleteCoupon(req, res, id);
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[API /coupons/[id]] Handler error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? error.message : 'Server error',
    });
  }
};

const handleGetCoupon = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  couponId: string
) => {
  try {
    const userId = req.user!.id;

    const coupon = (await Coupon.findById(couponId)
      .populate('createdBy', 'name email avatar')
      .populate('usedBy', 'name email avatar')) as any;

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const isCreator = coupon.createdBy._id.toString() === userId;

    if (!isCreator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const couponResponse = {
      id: coupon._id.toString(),
      code: coupon.code,
      discountValue: coupon.discountValue,
      discountPercentage: coupon.discountPercentage,
      createdBy: coupon.createdBy._id.toString(),
      creator: {
        id: coupon.createdBy._id.toString(),
        name: coupon.createdBy.name,
        email: coupon.createdBy.email,
        avatar: coupon.createdBy.avatar,
      },
      uses: coupon.uses,
      usedBy: coupon.usedBy.map(user => user._id.toString()),
      users: coupon.usedBy.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      })),
      maxUses: coupon.maxUses,
      expiresAt: coupon.expiresAt,
      isActive: coupon.isActive,
      isValid: coupon.isValid(),
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    };

    return res.status(200).json({ coupon: couponResponse });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const handleUpdateCoupon = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  couponId: string
) => {
  try {
    const userId = req.user!.id;
    const { isActive, maxUses, expiresAt } = req.body;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (coupon.createdBy.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'Only the creator can update the coupon' });
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'isActive must be a boolean' });
      }
      coupon.isActive = isActive;
    }

    if (maxUses !== undefined) {
      if (maxUses !== null && (typeof maxUses !== 'number' || maxUses <= 0)) {
        return res
          .status(400)
          .json({ message: 'maxUses must be a positive number or null' });
      }
      coupon.maxUses = maxUses;
    }

    if (expiresAt !== undefined) {
      if (expiresAt !== null) {
        const expireDate = new Date(expiresAt);
        if (expireDate <= new Date()) {
          return res
            .status(400)
            .json({ message: 'Expiration date must be in the future' });
        }
        coupon.expiresAt = expireDate;
      } else {
        coupon.expiresAt = undefined;
      }
    }

    await coupon.save();

    const updatedCoupon = (await Coupon.findById(couponId)
      .populate('createdBy', 'name email avatar')
      .populate('usedBy', 'name email avatar')) as any;

    const couponResponse = {
      id: updatedCoupon._id.toString(),
      code: updatedCoupon.code,
      discountValue: updatedCoupon.discountValue,
      discountPercentage: updatedCoupon.discountPercentage,
      createdBy: updatedCoupon.createdBy._id.toString(),
      creator: {
        id: updatedCoupon.createdBy._id.toString(),
        name: updatedCoupon.createdBy.name,
        email: updatedCoupon.createdBy.email,
        avatar: updatedCoupon.createdBy.avatar,
      },
      uses: updatedCoupon.uses,
      usedBy: updatedCoupon.usedBy.map(user => user._id.toString()),
      users: updatedCoupon.usedBy.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      })),
      maxUses: updatedCoupon.maxUses,
      expiresAt: updatedCoupon.expiresAt,
      isActive: updatedCoupon.isActive,
      isValid: updatedCoupon.isValid(),
      createdAt: updatedCoupon.createdAt,
      updatedAt: updatedCoupon.updatedAt,
    };

    return res.status(200).json({
      message: 'Coupon updated successfully',
      coupon: couponResponse,
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const handleDeleteCoupon = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  couponId: string
) => {
  try {
    const userId = req.user!.id;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (coupon.createdBy.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'Only the creator can delete the coupon' });
    }

    await Coupon.findByIdAndDelete(couponId);

    return res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createApiHandler(handler, [authenticate, requireAuthenticated]);
