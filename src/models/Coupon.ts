import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountValue?: number;
  discountPercentage?: number;
  createdBy: mongoose.Types.ObjectId;
  uses: number;
  usedBy: mongoose.Types.ObjectId[];
  maxUses?: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isValid(): boolean;
  canBeUsedBy(userId: mongoose.Types.ObjectId): boolean;
}

export interface ICouponModel extends Model<ICoupon> {}

const CouponSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountValue: {
      type: Number,
      min: 0,
      validate: {
        validator: function (this: ICoupon) {
          return !!(this.discountValue || this.discountPercentage);
        },
        message: 'Either discountValue or discountPercentage must be provided',
      },
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      validate: {
        validator: function (this: ICoupon) {
          return !!(this.discountValue || this.discountPercentage);
        },
        message: 'Either discountValue or discountPercentage must be provided',
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uses: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxUses: {
      type: Number,
      min: 1,
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

CouponSchema.index({ code: 1 });
CouponSchema.index({ createdBy: 1 });
CouponSchema.index({ isActive: 1, expiresAt: 1 });
CouponSchema.index({ usedBy: 1 });

CouponSchema.methods.isValid = function (): boolean {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  if (this.maxUses && this.uses >= this.maxUses) return false;
  return true;
};

CouponSchema.methods.canBeUsedBy = function (
  userId: mongoose.Types.ObjectId
): boolean {
  if (!this.isValid()) return false;
  return !this.usedBy.includes(userId);
};

const Coupon: ICouponModel =
  (mongoose.models.Coupon as ICouponModel) ||
  mongoose.model<ICoupon, ICouponModel>('Coupon', CouponSchema);
export default Coupon;
