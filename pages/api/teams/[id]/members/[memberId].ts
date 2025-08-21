import { NextApiResponse } from 'next';
import mongoose from 'mongoose';
import Team from '../../../../../src/models/Team';
import User from '../../../../../src/models/User';
import dbConnect from '../../../../../src/lib/dbConnect';
import {
  AuthenticatedRequest,
  authenticate,
  requireAuthenticated,
  createApiHandler,
} from '../../../../../src/lib/auth-middleware';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  try {
    await dbConnect();

    const { id, memberId } = req.query;

    if (!id || typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid team ID' });
    }

    if (
      !memberId ||
      typeof memberId !== 'string' ||
      !mongoose.isValidObjectId(memberId)
    ) {
      return res.status(400).json({ message: 'Invalid member ID' });
    }

    if (req.method === 'DELETE') {
      return handleRemoveMember(req, res, id, memberId);
    } else {
      res.setHeader('Allow', ['DELETE']);
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[API /teams/[id]/members/[memberId]] Handler error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? error.message : 'Server error',
    });
  }
};

const handleRemoveMember = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  teamId: string,
  memberId: string
) => {
  try {
    const scoutId = req.user!.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Only scout can remove members
    if (team.scoutId.toString() !== scoutId) {
      return res
        .status(403)
        .json({ message: 'Only the scout can remove members from this team' });
    }

    // Check if user is a member
    if (!team.memberIds.some(id => id.toString() === memberId)) {
      return res
        .status(400)
        .json({ message: 'User is not a member of this team' });
    }

    // Remove member from team
    team.memberIds = team.memberIds.filter(id => id.toString() !== memberId);
    await team.save();

    return res.status(200).json({
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createApiHandler(handler, [authenticate, requireAuthenticated]);
