import mongoose, { Schema, Document, Model } from 'mongoose';

export enum UserRole {
  SUPERUSER = 'SUPERUSER',
  MARKETING = 'MARKETING',
  OWNER = 'OWNER',
  USER = 'USER',
  ATHLETE = 'ATHLETE'
}

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'facebook' | 'email';
  providerId?: string;
  isVerified: boolean;
  role: UserRole;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends Model<IUser> {}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function(this: IUser) {
        return this.provider === 'email';
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: ['google', 'facebook', 'email'],
      default: 'email',
    },
    providerId: {
      type: String,
      sparse: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      required: true,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 });
UserSchema.index({ providerId: 1, provider: 1 });
UserSchema.index({ role: 1 });

const User: IUserModel = (mongoose.models.User as IUserModel) || mongoose.model<IUser, IUserModel>('User', UserSchema);
export default User;
