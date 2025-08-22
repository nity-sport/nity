import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';
import { UserRole } from '../../src/types/auth';
import { Team } from '../../src/types/team';
import styles from './ScoutDashboard.module.css';

interface CreateTeamFormData {
  name: string;
}

interface InviteFormData {
  emails: string;
  teamId: string;
}

export default function ScoutDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Create team form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createTeamData, setCreateTeamData] = useState<CreateTeamFormData>({
    name: '',
  });
  const [creatingTeam, setCreatingTeam] = useState(false);

  // Invite form
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState<InviteFormData>({
    emails: '',
    teamId: '',
  });
  const [sendingInvites, setSendingInvites] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.SCOUT)) {
      router.push('/');
      return;
    }

    if (user && user.role === UserRole.SCOUT) {
      fetchTeams();
      fetchNotifications();
    }
  }, [user, isLoading, router]);

  // Only generate affiliate code when user manually requests it
  // useEffect removed to prevent infinite loops

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teams?asScout=true', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to load teams:', response.status, errorData);
        setTeams([]);
      }
    } catch (_) {
      console.error('Error loading teams:', _);
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/scout/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (_) {
      console.error('Error loading notifications');
      // Don't show error for notifications - just set empty arrays
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const generateAffiliateCode = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/scout/update-affiliate-code', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update localStorage without causing infinite loop
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        currentUser.affiliateCode = data.affiliateCode;
        localStorage.setItem('user', JSON.stringify(currentUser));

        // Just refresh the page once
        window.location.reload();
      }
    } catch (_) {
      console.error('Error generating affiliate code:', _);
      setError('Failed to generate affiliate code');
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createTeamData.name.trim()) {
      setError('Team name is required');
      return;
    }

    setCreatingTeam(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: createTeamData.name }),
      });

      const data = await response.json();

      if (response.ok) {
        setTeams(prev => [data.team, ...prev]);
        setCreateTeamData({ name: '' });
        setShowCreateForm(false);
      } else {
        setError(data.message || 'Failed to create team');
      }
    } catch (_) {
      setError('Error creating team');
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleSendInvites = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteData.emails.trim() || !inviteData.teamId) {
      setError('Please enter emails and select a team');
      return;
    }

    setSendingInvites(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const emails = inviteData.emails
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

      const response = await fetch('/api/scout/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emails,
          teamId: inviteData.teamId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setInviteData({ emails: '', teamId: '' });
        setShowInviteForm(false);
        alert(`Invites sent successfully to ${emails.length} email(s)`);
      } else {
        setError(data.message || 'Failed to send invites');
      }
    } catch (_) {
      setError('Error sending invites');
    } finally {
      setSendingInvites(false);
    }
  };

  if (isLoading || loadingTeams) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!user || user.role !== UserRole.SCOUT) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Scout Dashboard</h1>
        <div className={styles.userInfo}>
          <span>Welcome, {user.name}</span>
          {user.affiliateCode && (
            <span className={styles.affiliateCode}>
              Affiliate Code: <strong>{user.affiliateCode}</strong>
            </span>
          )}
          {!user.affiliateCode && (
            <button
              className={styles.generateCodeButton}
              onClick={generateAffiliateCode}
            >
              Generate Affiliate Code
            </button>
          )}
          {unreadCount > 0 && (
            <span className={styles.notificationBadge}>
              {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button
          className={styles.primaryButton}
          onClick={() => router.push('/scout/teams')}
        >
          Manage Teams
        </button>
        <button
          className={styles.primaryButton}
          onClick={() => setShowCreateForm(true)}
        >
          Create New Team
        </button>
        <button
          className={styles.secondaryButton}
          onClick={() => setShowInviteForm(true)}
        >
          Send Invites
        </button>
      </div>

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <div className={styles.notificationsSection}>
          <h2>Recent Activity</h2>
          <div className={styles.notificationsList}>
            {notifications.slice(0, 5).map(notification => (
              <div key={notification.id} className={styles.notificationItem}>
                <div className={styles.notificationContent}>
                  <p>{notification.message}</p>
                  <small>
                    {new Date(notification.timestamp).toLocaleDateString()}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.teamsSection}>
        <h2>Your Teams ({teams.length})</h2>

        {teams.length === 0 ? (
          <div className={styles.emptyState}>
            <p>You haven't created any teams yet.</p>
            <button
              className={styles.primaryButton}
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Team
            </button>
          </div>
        ) : (
          <div className={styles.teamsGrid}>
            {teams.map(team => (
              <div key={team.id} className={styles.teamCard}>
                <h3>{team.name}</h3>
                <p>{team.members?.length || 0} members</p>
                <div className={styles.teamActions}>
                  <button
                    className={styles.primaryButton}
                    onClick={() => router.push('/scout/teams')}
                  >
                    Manage
                  </button>
                  <button
                    className={styles.secondaryButton}
                    onClick={() => {
                      setInviteData(prev => ({ ...prev, teamId: team.id }));
                      setShowInviteForm(true);
                    }}
                  >
                    Invite Members
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Create New Team</h3>
            <form onSubmit={handleCreateTeam} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor='teamName'>Team Name</label>
                <input
                  type='text'
                  id='teamName'
                  value={createTeamData.name}
                  onChange={e => setCreateTeamData({ name: e.target.value })}
                  placeholder='Enter team name'
                  required
                />
              </div>
              <div className={styles.formButtons}>
                <button
                  type='button'
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateTeamData({ name: '' });
                    setError('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className={styles.primaryButton}
                  disabled={creatingTeam}
                >
                  {creatingTeam ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Members Modal */}
      {showInviteForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Send Team Invites</h3>
            <form onSubmit={handleSendInvites} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor='teamSelect'>Select Team</label>
                <select
                  id='teamSelect'
                  value={inviteData.teamId}
                  onChange={e =>
                    setInviteData(prev => ({ ...prev, teamId: e.target.value }))
                  }
                  required
                >
                  <option value=''>Choose a team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor='emails'>Email Addresses</label>
                <textarea
                  id='emails'
                  value={inviteData.emails}
                  onChange={e =>
                    setInviteData(prev => ({ ...prev, emails: e.target.value }))
                  }
                  placeholder='Enter email addresses separated by commas'
                  rows={4}
                  required
                />
                <small>Separate multiple emails with commas</small>
              </div>
              <div className={styles.formButtons}>
                <button
                  type='button'
                  className={styles.cancelButton}
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteData({ emails: '', teamId: '' });
                    setError('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className={styles.primaryButton}
                  disabled={sendingInvites}
                >
                  {sendingInvites ? 'Sending...' : 'Send Invites'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
