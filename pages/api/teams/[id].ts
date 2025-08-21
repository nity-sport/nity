import { NextApiResponse } from 'next';
import mongoose from 'mongoose';
import Team from '../../../src/models/Team';
import User from '../../../src/models/User';
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
      return res.status(400).json({ message: 'Invalid team ID' });
    }

    if (req.method === 'GET') {
      return handleGetTeam(req, res, id);
    } else if (req.method === 'PUT') {
      return handleUpdateTeam(req, res, id);
    } else if (req.method === 'DELETE') {
      return handleDeleteTeam(req, res, id);
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[API /teams/[id]] Handler error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? error.message : 'Server error',
    });
  }
};

const handleGetTeam = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  teamId: string
) => {
  try {
    const userId = req.user!.id;

    const team = (await Team.findById(teamId)
      .populate('scoutId', 'name email avatar role')
      .populate('memberIds', 'name email avatar role')) as any;

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isScout = team.scoutId._id.toString() === userId;
    const isMember = team.memberIds.some(
      member => member._id.toString() === userId
    );

    if (!isScout && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const teamResponse = {
      id: team._id.toString(),
      name: team.name,
      scoutId: team.scoutId._id.toString(),
      scout: {
        id: team.scoutId._id.toString(),
        name: team.scoutId.name,
        email: team.scoutId.email,
        avatar: team.scoutId.avatar,
        role: team.scoutId.role,
      },
      memberIds: team.memberIds.map(member => member._id.toString()),
      members: team.memberIds.map(member => ({
        id: member._id.toString(),
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        role: member.role,
      })),
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      isScout,
      isMember,
    };

    return res.status(200).json({ team: teamResponse });
  } catch (error) {
    console.error('Error fetching team:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const handleUpdateTeam = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  teamId: string
) => {
  try {
    const userId = req.user!.id;
    const { name, memberIds } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.scoutId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'Only the scout can update the team' });
    }

    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ message: 'Team name is required' });
      }

      const existingTeam = await Team.findOne({
        name: name.trim(),
        scoutId: userId,
        _id: { $ne: teamId },
      });

      if (existingTeam) {
        return res
          .status(400)
          .json({ message: 'You already have a team with this name' });
      }

      team.name = name.trim();
    }

    if (memberIds !== undefined) {
      if (!Array.isArray(memberIds)) {
        return res.status(400).json({ message: 'memberIds must be an array' });
      }

      const validMemberIds = memberIds.filter(id =>
        mongoose.isValidObjectId(id)
      );
      if (validMemberIds.length !== memberIds.length) {
        return res.status(400).json({ message: 'Invalid member IDs provided' });
      }

      const existingUsers = await User.find({ _id: { $in: validMemberIds } });
      if (existingUsers.length !== validMemberIds.length) {
        return res.status(400).json({ message: 'Some users not found' });
      }

      const removedMembers = team.memberIds.filter(
        memberId => !validMemberIds.includes(memberId.toString())
      );
      const addedMembers = validMemberIds.filter(
        memberId =>
          !team.memberIds.some(existing => existing.toString() === memberId)
      );

      team.memberIds = validMemberIds;

      if (removedMembers.length > 0) {
        await User.updateMany(
          { _id: { $in: removedMembers } },
          { $pull: { teams: teamId } }
        );
      }

      if (addedMembers.length > 0) {
        await User.updateMany(
          { _id: { $in: addedMembers } },
          { $addToSet: { teams: teamId } }
        );
      }
    }

    await team.save();

    const updatedTeam = (await Team.findById(teamId)
      .populate('scoutId', 'name email avatar role')
      .populate('memberIds', 'name email avatar role')) as any;

    const teamResponse = {
      id: updatedTeam._id.toString(),
      name: updatedTeam.name,
      scoutId: updatedTeam.scoutId._id.toString(),
      scout: {
        id: updatedTeam.scoutId._id.toString(),
        name: updatedTeam.scoutId.name,
        email: updatedTeam.scoutId.email,
        avatar: updatedTeam.scoutId.avatar,
        role: updatedTeam.scoutId.role,
      },
      memberIds: updatedTeam.memberIds.map(member => member._id.toString()),
      members: updatedTeam.memberIds.map(member => ({
        id: member._id.toString(),
        name: member.name,
        email: member.email,
        avatar: member.avatar,
        role: member.role,
      })),
      createdAt: updatedTeam.createdAt,
      updatedAt: updatedTeam.updatedAt,
    };

    return res.status(200).json({
      message: 'Team updated successfully',
      team: teamResponse,
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const handleDeleteTeam = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  teamId: string
) => {
  try {
    const userId = req.user!.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.scoutId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'Only the scout can delete the team' });
    }

    await User.updateMany(
      { _id: { $in: team.memberIds } },
      { $pull: { teams: teamId } }
    );

    await Team.findByIdAndDelete(teamId);

    return res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createApiHandler(handler, [authenticate, requireAuthenticated]);
