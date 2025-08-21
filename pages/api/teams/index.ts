import { NextApiResponse } from 'next';
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

    if (req.method === 'GET') {
      return handleGetTeams(req, res);
    } else if (req.method === 'POST') {
      return handleCreateTeam(req, res);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[API /teams] Handler error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? error.message : 'Server error',
    });
  }
};

const handleGetTeams = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  try {
    const {
      page = 1,
      limit = 10,
      asScout,
      asMember,
      includeMembers,
    } = req.query;
    const userId = req.user!.id;

    const filter: any = {};

    if (asScout === 'true') {
      filter.scoutId = userId;
    } else if (asMember === 'true') {
      filter.memberIds = userId;
    } else {
      filter.$or = [{ scoutId: userId }, { memberIds: userId }];
    }

    const skip = (Number(page) - 1) * Number(limit);

    let query = Team.find(filter)
      .populate('scoutId', 'name email avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    if (includeMembers === 'true') {
      query = query.populate('memberIds', 'name email avatar role');
    }

    const teams = (await query) as any[];
    const total = await Team.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    const teamsResponse = teams.map(team => ({
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
      memberIds: team.memberIds.map(member =>
        typeof member === 'string' ? member : member._id.toString()
      ),
      members:
        includeMembers === 'true' && team.memberIds.length > 0
          ? team.memberIds.map(member => ({
              id: member._id.toString(),
              name: member.name,
              email: member.email,
              avatar: member.avatar,
              role: member.role,
            }))
          : [],
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    }));

    return res.status(200).json({
      teams: teamsResponse,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const handleCreateTeam = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  try {
    const { name } = req.body;
    const scoutId = req.user!.id;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const existingTeam = await Team.findOne({
      name: name.trim(),
      scoutId,
    });

    if (existingTeam) {
      return res
        .status(400)
        .json({ message: 'You already have a team with this name' });
    }

    const team = new Team({
      name: name.trim(),
      scoutId,
      memberIds: [],
    });

    await team.save();

    const populatedTeam = (await Team.findById(team._id)
      .populate('scoutId', 'name email avatar')
      .populate('memberIds', 'name email avatar')) as any;

    const teamResponse = {
      id: populatedTeam._id.toString(),
      name: populatedTeam.name,
      scoutId: populatedTeam.scoutId._id.toString(),
      scout: {
        id: populatedTeam.scoutId._id.toString(),
        name: populatedTeam.scoutId.name,
        email: populatedTeam.scoutId.email,
        avatar: populatedTeam.scoutId.avatar,
      },
      memberIds: [],
      members: [],
      createdAt: populatedTeam.createdAt,
      updatedAt: populatedTeam.updatedAt,
    };

    return res.status(201).json({
      message: 'Team created successfully',
      team: teamResponse,
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createApiHandler(handler, [authenticate, requireAuthenticated]);
