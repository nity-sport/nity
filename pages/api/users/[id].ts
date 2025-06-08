import { NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User, { UserRole } from '../../../src/models/User';
import dbConnect from '../../../src/lib/dbConnect';
import { 
  AuthenticatedRequest, 
  authenticate, 
  requireAuthenticated,
  requireSuperuser,
  createApiHandler 
} from '../../../src/lib/auth-middleware';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  await dbConnect();

  const { id } = req.query;

  if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  if (req.method === 'GET') {
    return handleGetUser(req, res);
  } else if (req.method === 'PUT') {
    return handleUpdateUser(req, res);
  } else if (req.method === 'DELETE') {
    return handleDeleteUser(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ message: 'Method not allowed' });
  }
};

const handleGetUser = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    
    const user = await User.findById(id)
      .select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user?.role !== UserRole.SUPERUSER && req.user?.id !== user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const handleUpdateUser = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;
    const { name, email, password, avatar } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user?.role !== UserRole.SUPERUSER && req.user?.id !== user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updateData.email = email;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const handleDeleteUser = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user?.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createApiHandler(handler, [
  authenticate,
  (req, res, next) => {
    if (req.method === 'DELETE') {
      return requireSuperuser(req, res, next);
    } else {
      return requireAuthenticated(req, res, next);
    }
  }
]);