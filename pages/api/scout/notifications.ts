import { NextApiResponse } from 'next';
import User from '../../../src/models/User';
import Team from '../../../src/models/Team';
import dbConnect from '../../../src/lib/dbConnect';
import {
  AuthenticatedRequest,
  authenticate,
  requireAuthenticated,
  createApiHandler,
} from '../../../src/lib/auth-middleware';
import { UserRole } from '../../../src/types/auth';

interface Notification {
  id: string;
  type: 'new_member' | 'team_update';
  message: string;
  teamId?: string;
  teamName?: string;
  memberName?: string;
  memberEmail?: string;
  timestamp: Date;
  read: boolean;
}

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const scoutId = req.user!.id;

    // Check if user is scout
    if (req.user!.role !== UserRole.SCOUT) {
      return res
        .status(403)
        .json({ message: 'Only scouts can access notifications' });
    }

    const notifications = await getScoutNotifications(scoutId);

    return res.status(200).json({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
    });
  } catch (error) {
    console.error('Error fetching scout notifications:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

async function getScoutNotifications(scoutId: string): Promise<Notification[]> {
  const notifications: Notification[] = [];

  try {
    // Get all teams for this scout
    const scoutTeams = await Team.find({ scoutId })
      .populate('memberIds', 'name email createdAt')
      .sort({ updatedAt: -1 });

    // Generate notifications for new members in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const team of scoutTeams) {
      if (team.memberIds && team.memberIds.length > 0) {
        for (const memberId of team.memberIds) {
          // Type guard to check if member is populated
          if (
            typeof memberId === 'object' &&
            memberId !== null &&
            'createdAt' in memberId
          ) {
            const member = memberId as any; // Cast to any to access populated fields
            // Check if member joined recently
            if (member.createdAt > thirtyDaysAgo) {
              notifications.push({
                id: `new_member_${team._id}_${member._id}`,
                type: 'new_member',
                message: `${member.name} joined your team "${team.name}"`,
                teamId: team._id.toString(),
                teamName: team.name,
                memberName: member.name,
                memberEmail: member.email,
                timestamp: member.createdAt,
                read: false, // In a real app, you'd track this in a separate collection
              });
            }
          }
        }
      }
    }

    // Sort notifications by timestamp (newest first)
    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return notifications;
  } catch (error) {
    console.error('Error generating notifications:', error);
    return [];
  }
}

export default createApiHandler(handler, [authenticate, requireAuthenticated]);
