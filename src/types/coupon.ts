import { User } from './auth';

export interface Coupon {
  id: string;
  code: string;
  discountValue?: number;
  discountPercentage?: number;
  createdBy: string;
  creator?: User;
  uses: number;
  usedBy: string[];
  users?: User[];
  maxUses?: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCouponRequest {
  code: string;
  discountValue?: number;
  discountPercentage?: number;
  maxUses?: number;
  expiresAt?: Date;
}

export interface UseCouponRequest {
  code: string;
}

export interface CouponUsage {
  userId: string;
  user?: User;
  usedAt: Date;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalUses: number;
  totalDiscountGiven: number;
}