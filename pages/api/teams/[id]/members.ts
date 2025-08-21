import { NextApiResponse } from 'next';
import mongoose from 'mongoose';
import Team from '../../../../src/models/Team';
import User from '../../../../src/models/User';
import dbConnect from '../../../../src/lib/dbConnect';
import {
  AuthenticatedRequest,
  authenticate,
  requireAuthenticated,
  createApiHandler,
} from '../../../../src/lib/auth-middleware';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    await dbConnect();

    const { id } = req.query;

    if (!id || typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid team ID' });
    }

    if (req.method === 'POST') {
      return handleAddMember(req, res, id);
    } else {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[API /teams/[id]/members] Handler error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? error.message : 'Server error',
    });
  }
};

const handleAddMember = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  teamId: string
) => {
  try {
    const { userId } = req.body;
    const scoutId = req.user!.id;

    if (
      !userId ||
      typeof userId !== 'string' ||
      !mongoose.isValidObjectId(userId)
    ) {
      return res.status(400).json({ message: 'Valid user ID is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Only scout can add members
    if (team.scoutId.toString() !== scoutId) {
      return res
        .status(403)
        .json({ message: 'Only the scout can add members to this team' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    if (team.memberIds.some(id => id.toString() === userId)) {
      return res
        .status(400)
        .json({ message: 'User is already a member of this team' });
    }

    // Add member to team
    team.memberIds.push(new mongoose.Types.ObjectId(userId));
    await team.save();

    const memberResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    };

    return res.status(200).json({
      message: 'Member added successfully',
      member: memberResponse,
    });
  } catch (error) {
    console.error('Error adding member:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createApiHandler(handler, [authenticate, requireAuthenticated]);
