import { NextApiResponse } from 'next';
import Team from '../../../src/models/Team';
import User from '../../../src/models/User';
import dbConnect from '../../../src/lib/dbConnect';
import { sendEmail } from '../../../src/lib/resend';
import { 
  AuthenticatedRequest, 
  authenticate, 
  requireAuthenticated, 
  createApiHandler 
} from '../../../src/lib/auth-middleware';
import { UserRole } from '../../../src/types/auth';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { emails, teamId } = req.body;
    const scoutId = req.user!.id;

    // Validate input
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'Emails array is required' });
    }

    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required' });
    }

    // Check if user is scout
    if (req.user!.role !== UserRole.SCOUT) {
      return res.status(403).json({ message: 'Only scouts can send invites' });
    }

    // Verify team belongs to scout
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.scoutId.toString() !== scoutId) {
      return res.status(403).json({ message: 'You can only send invites for your own teams' });
    }

    // Get scout data for email
    const scout = await User.findById(scoutId);
    if (!scout) {
      return res.status(404).json({ message: 'Scout not found' });
    }

    // Validate emails and filter out existing users
    const validEmails = emails.filter(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    });

    if (validEmails.length === 0) {
      return res.status(400).json({ message: 'No valid email addresses provided' });
    }

    // Send emails
    const emailResults = await sendInviteEmails(validEmails, scout, team);

    return res.status(200).json({
      message: `Invites sent successfully`,
      sent: emailResults.sent,
      failed: emailResults.failed,
      totalSent: emailResults.sent.length,
      totalFailed: emailResults.failed.length
    });

  } catch (error) {
    console.error('Error sending invites:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

async function sendInviteEmails(emails: string[], scout: any, team: any) {
  const results = {
    sent: [] as string[],
    failed: [] as string[]
  };

  // Using Resend for email delivery

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  for (const email of emails) {
    try {
      const inviteLink = `${baseUrl}/register?ref=${scout.affiliateCode}&team=${team._id}`;
      
      const emailResult = await sendEmail({
        to: email,
        subject: `${scout.name} invited you to join team "${team.name}" on Nity`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #3182ce; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
              .footer { margin-top: 20px; font-size: 0.9rem; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>You're Invited to Join Nity!</h1>
              </div>
              <div class="content">
                <h2>Hello!</h2>
                <p><strong>${scout.name}</strong> has invited you to join their team "<strong>${team.name}</strong>" on Nity.</p>
                
                <p>Nity is a sports platform that connects athletes with coaches and sports facilities. By joining this team, you'll be part of an amazing sports community!</p>
                
                <p>Click the button below to create your account and join the team:</p>
                
                <a href="${inviteLink}" class="button">Join Team "${team.name}"</a>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px;">${inviteLink}</p>
                
                <div class="footer">
                  <p>This invitation was sent by ${scout.name} (${scout.email}).</p>
                  <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      });

      if (emailResult.success) {
        results.sent.push(email);
      } else {
        console.error(`Failed to send email to ${email}:`, emailResult.error);
        results.failed.push(email);
      }
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
      results.failed.push(email);
    }
  }

  return results;
}

export default createApiHandler(handler, [
  authenticate,
  requireAuthenticated
]);