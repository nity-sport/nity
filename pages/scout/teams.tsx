import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/contexts/AuthContext';
import { UserRole } from '../../src/types/auth';
import { Team } from '../../src/types/team';
import { User } from '../../src/types/auth';
import styles from './teams.module.css';

interface TeamWithMembers extends Team {
  members: User[];
}

export default function TeamsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [error, setError] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<TeamWithMembers | null>(
    null
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  // Form states
  const [teamName, setTeamName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.SCOUT)) {
      router.push('/');
      return;
    }

    if (user && user.role === UserRole.SCOUT) {
      fetchTeams();
    }
  }, [user, isLoading, router]);

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teams?includeMembers=true', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      } else {
        // setError('Failed to load teams');
      }
    } catch (_) {
      // setError('Error loading teams');
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: teamName }),
      });

      const data = await response.json();

      if (response.ok) {
        setTeams(prev => [{ ...data.team, members: [] }, ...prev]);
        setTeamName('');
        setShowCreateForm(false);
      } else {
        setError(data.message || 'Failed to create team');
      }
    } catch (_) {
      // setError('Error creating team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTeam || !teamName.trim()) {
      setError('Team name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: teamName }),
      });

      const data = await response.json();

      if (response.ok) {
        setTeams(prev =>
          prev.map(team =>
            team.id === selectedTeam.id ? { ...team, ...data.team } : team
          )
        );
        setTeamName('');
        setShowEditForm(false);
        setSelectedTeam(null);
      } else {
        setError(data.message || 'Failed to update team');
      }
    } catch (_) {
      // setError('Error updating team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTeams(prev => prev.filter(team => team.id !== teamId));
        if (selectedTeam?.id === teamId) {
          setSelectedTeam(null);
        }
      } else {
        setError('Failed to delete team');
      }
    } catch (_) {
      // setError('Error deleting team');
    }
  };

  const searchUsers = async (email: string) => {
    if (!email.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/users/search?email=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      } else {
        // setSearchResults([]);
      }
    } catch (_) {
      // setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addMemberToTeam = async (userId: string) => {
    if (!selectedTeam) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setTeams(prev =>
          prev.map(team =>
            team.id === selectedTeam.id
              ? { ...team, members: [...team.members, data.member] }
              : team
          )
        );
        setSelectedTeam(prev =>
          prev ? { ...prev, members: [...prev.members, data.member] } : null
        );
        setSearchEmail('');
        setSearchResults([]);
      } else {
        setError(data.message || 'Failed to add member');
      }
    } catch (_) {
      // setError('Error adding member');
    }
  };

  const removeMemberFromTeam = async (userId: string) => {
    if (!selectedTeam) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/teams/${selectedTeam.id}/members/${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setTeams(prev =>
          prev.map(team =>
            team.id === selectedTeam.id
              ? {
                  ...team,
                  members: team.members.filter(member => member.id !== userId),
                }
              : team
          )
        );
        setSelectedTeam(prev =>
          prev
            ? {
                ...prev,
                members: prev.members.filter(member => member.id !== userId),
              }
            : null
        );
      } else {
        setError('Failed to remove member');
      }
    } catch (_) {
      // setError('Error removing member');
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
        <h1>Teams Management</h1>
        <button
          className={styles.backButton}
          onClick={() => router.push('/scout/dashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Your Teams</h2>
            <button
              className={styles.createButton}
              onClick={() => setShowCreateForm(true)}
            >
              + Create Team
            </button>
          </div>

          <div className={styles.teamsList}>
            {teams.map(team => (
              <div
                key={team.id}
                className={`${styles.teamItem} ${selectedTeam?.id === team.id ? styles.active : ''}`}
                onClick={() => setSelectedTeam(team)}
              >
                <h3>{team.name}</h3>
                <p>{team.members.length} members</p>
                <div className={styles.teamItemActions}>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedTeam(team);
                      setTeamName(team.name);
                      setShowEditForm(true);
                    }}
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteTeam(team.id);
                    }}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {teams.length === 0 && (
            <div className={styles.emptyState}>
              <p>No teams created yet</p>
              <button
                className={styles.createButton}
                onClick={() => setShowCreateForm(true)}
              >
                Create Your First Team
              </button>
            </div>
          )}
        </div>

        <div className={styles.main}>
          {selectedTeam ? (
            <div className={styles.teamDetails}>
              <div className={styles.teamHeader}>
                <h2>{selectedTeam.name}</h2>
                <button
                  className={styles.addMemberButton}
                  onClick={() => setShowMemberForm(true)}
                >
                  + Add Member
                </button>
              </div>

              <div className={styles.membersSection}>
                <h3>Members ({selectedTeam.members.length})</h3>
                {selectedTeam.members.length === 0 ? (
                  <div className={styles.emptyMembers}>
                    <p>No members in this team yet</p>
                    <button
                      className={styles.addMemberButton}
                      onClick={() => setShowMemberForm(true)}
                    >
                      Add First Member
                    </button>
                  </div>
                ) : (
                  <div className={styles.membersList}>
                    {selectedTeam.members.map(member => (
                      <div key={member.id} className={styles.memberCard}>
                        <div className={styles.memberInfo}>
                          <h4>{member.name}</h4>
                          <p>{member.email}</p>
                          <span className={styles.memberRole}>
                            {member.role}
                          </span>
                        </div>
                        <button
                          className={styles.removeMemberButton}
                          onClick={() => removeMemberFromTeam(member.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.noTeamSelected}>
              <p>Select a team to view and manage its members</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Create New Team</h3>
            <form onSubmit={handleCreateTeam}>
              <div className={styles.formGroup}>
                <label>Team Name</label>
                <input
                  type='text'
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder='Enter team name'
                  required
                />
              </div>
              <div className={styles.formButtons}>
                <button
                  type='button'
                  onClick={() => {
                    setShowCreateForm(false);
                    setTeamName('');
                    setError('');
                  }}
                >
                  Cancel
                </button>
                <button type='submit' disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Edit Team</h3>
            <form onSubmit={handleEditTeam}>
              <div className={styles.formGroup}>
                <label>Team Name</label>
                <input
                  type='text'
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder='Enter team name'
                  required
                />
              </div>
              <div className={styles.formButtons}>
                <button
                  type='button'
                  onClick={() => {
                    setShowEditForm(false);
                    setTeamName('');
                    setSelectedTeam(null);
                    setError('');
                  }}
                >
                  Cancel
                </button>
                <button type='submit' disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Add Member to {selectedTeam?.name}</h3>
            <div className={styles.memberSearch}>
              <div className={styles.formGroup}>
                <label>Search by Email</label>
                <input
                  type='email'
                  value={searchEmail}
                  onChange={e => {
                    setSearchEmail(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  placeholder='Enter email address'
                />
              </div>

              {searching && <p>Searching...</p>}

              {searchResults.length > 0 && (
                <div className={styles.searchResults}>
                  <h4>Search Results:</h4>
                  {searchResults.map(user => (
                    <div key={user.id} className={styles.searchResultItem}>
                      <div className={styles.userInfo}>
                        <h5>{user.name}</h5>
                        <p>{user.email}</p>
                        <span className={styles.userRole}>{user.role}</span>
                      </div>
                      <button
                        onClick={() => addMemberToTeam(user.id)}
                        disabled={selectedTeam?.members.some(
                          member => member.id === user.id
                        )}
                      >
                        {selectedTeam?.members.some(
                          member => member.id === user.id
                        )
                          ? 'Already Member'
                          : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {searchEmail && !searching && searchResults.length === 0 && (
                <p>No users found with this email</p>
              )}
            </div>

            <div className={styles.formButtons}>
              <button
                type='button'
                onClick={() => {
                  setShowMemberForm(false);
                  setSearchEmail('');
                  setSearchResults([]);
                  setError('');
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
