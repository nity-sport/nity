import { NextApiResponse } from 'next';
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
      return handleSearchUsers(req, res);
    } else {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[API /users/search] Handler error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error:
        process.env.NODE_ENV === 'development' ? error.message : 'Server error',
    });
  }
};

const handleSearchUsers = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  try {
    const { email, name, limit = 10 } = req.query;
    const scoutId = req.user!.id;

    if (!email && !name) {
      return res
        .status(400)
        .json({ message: 'Email or name query parameter is required' });
    }

    const searchFilter: any = {};

    if (email) {
      searchFilter.email = { $regex: email, $options: 'i' };
    }

    if (name) {
      if (searchFilter.$or) {
        searchFilter.$or.push({ name: { $regex: name, $options: 'i' } });
      } else {
        searchFilter.$or = [{ name: { $regex: name, $options: 'i' } }];
      }
    }

    // Don't include the scout himself in the search results
    searchFilter._id = { $ne: scoutId };

    const users = await User.find(searchFilter)
      .select('name email avatar role')
      .limit(Number(limit))
      .sort({ name: 1 });

    const userResults = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    }));

    return res.status(200).json({
      users: userResults,
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createApiHandler(handler, [authenticate, requireAuthenticated]);
