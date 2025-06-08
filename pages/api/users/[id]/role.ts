import { NextApiResponse } from 'next';
import mongoose from 'mongoose';
import User, { UserRole } from '../../../../src/models/User';
import dbConnect from '../../../../src/lib/dbConnect';
import { 
  AuthenticatedRequest, 
  authenticate, 
  requireSuperuser,
  createApiHandler 
} from '../../../../src/lib/auth-middleware';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  await dbConnect();

  const { id } = req.query;

  if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  if (req.method === 'PATCH') {
    return handleChangeRole(req, res);
  } else {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
};

const handleChangeRole = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    const { role } = req.body;

    if (!role || !Object.values(UserRole).includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role',
        validRoles: Object.values(UserRole)
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user?.id) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    return res.status(200).json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error changing user role:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createApiHandler(handler, [
  authenticate,
  requireSuperuser
]);