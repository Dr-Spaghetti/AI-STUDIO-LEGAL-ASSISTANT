// ============================================
// Team Management - User Access Control
// ============================================
// Manage team members and their permissions

import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Mail,
  Shield,
  User,
  Crown,
  Eye,
  Check,
  X,
  MoreVertical,
  Send,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'user' | 'viewer';
  status: 'active' | 'pending' | 'disabled';
  last_active?: string;
  created_at: string;
  avatar_url?: string;
}

interface Props {
  tenantId: string;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@smithlaw.com',
    role: 'owner',
    status: 'active',
    last_active: '2024-06-15T10:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@smithlaw.com',
    role: 'admin',
    status: 'active',
    last_active: '2024-06-15T09:30:00Z',
    created_at: '2024-02-15T00:00:00Z',
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike@smithlaw.com',
    role: 'user',
    status: 'active',
    last_active: '2024-06-14T16:00:00Z',
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Lisa Brown',
    email: 'lisa@smithlaw.com',
    role: 'viewer',
    status: 'pending',
    created_at: '2024-06-10T00:00:00Z',
  },
];

const ROLES = [
  {
    value: 'owner',
    label: 'Owner',
    description: 'Full access including billing and team management',
    icon: Crown,
    color: 'text-yellow-400',
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full access except billing',
    icon: Shield,
    color: 'text-purple-400',
  },
  {
    value: 'user',
    label: 'User',
    description: 'Can manage leads and conversations',
    icon: User,
    color: 'text-cyan-400',
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Read-only access to leads and analytics',
    icon: Eye,
    color: 'text-gray-400',
  },
];

// ============================================
// COMPONENT
// ============================================

export function TeamManagement({ tenantId }: Props) {
  const [team, setTeam] = useState<TeamMember[]>(MOCK_TEAM);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const handleInvite = (email: string, role: string) => {
    const newMember: TeamMember = {
      id: `${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: role as TeamMember['role'],
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    setTeam((prev) => [...prev, newMember]);
    setShowInviteModal(false);
  };

  const handleUpdateRole = (id: string, role: TeamMember['role']) => {
    setTeam((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role } : m))
    );
  };

  const handleRemove = (id: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      setTeam((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleResendInvite = (id: string) => {
    // In production, resend invite email
    alert('Invite resent!');
  };

  const roleIcons: Record<string, React.ReactNode> = {
    owner: <Crown className="w-4 h-4 text-yellow-400" />,
    admin: <Shield className="w-4 h-4 text-purple-400" />,
    user: <User className="w-4 h-4 text-cyan-400" />,
    viewer: <Eye className="w-4 h-4 text-gray-400" />,
  };

  const statusColors = {
    active: 'bg-green-500',
    pending: 'bg-yellow-500',
    disabled: 'bg-gray-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Team</h2>
          <p className="text-gray-400 mt-1">Manage who has access to your account</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Role Legend */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES.map((role) => (
          <div key={role.value} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <role.icon className={`w-4 h-4 ${role.color}`} />
              <span className="text-white font-medium">{role.label}</span>
            </div>
            <p className="text-gray-500 text-sm">{role.description}</p>
          </div>
        ))}
      </div>

      {/* Team List */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Member</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Role</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Status</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-3">Last Active</th>
              <th className="w-20 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {team.map((member) => (
              <tr key={member.id} className="hover:bg-gray-800/50">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{member.name}</div>
                      <div className="text-gray-500 text-sm">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {roleIcons[member.role]}
                    <span className="text-white capitalize">{member.role}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[member.status]}`} />
                    <span className="text-gray-300 capitalize">{member.status}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-400 text-sm">
                  {member.last_active
                    ? new Date(member.last_active).toLocaleDateString()
                    : 'Never'}
                </td>
                <td className="px-4 py-4">
                  {member.role !== 'owner' && (
                    <div className="flex items-center gap-1">
                      {member.status === 'pending' && (
                        <button
                          onClick={() => handleResendInvite(member.id)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                          title="Resend invite"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingMember(member)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          onInvite={handleInvite}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {/* Edit Modal */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onSave={(role) => {
            handleUpdateRole(editingMember.id, role);
            setEditingMember(null);
          }}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}

// ============================================
// MODALS
// ============================================

function InviteModal({
  onInvite,
  onClose,
}: {
  onInvite: (email: string, role: string) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onInvite(email, role);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Invite Team Member</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@firm.com"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Role</label>
            <div className="space-y-2">
              {ROLES.filter((r) => r.value !== 'owner').map((roleOption) => (
                <label
                  key={roleOption.value}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                    role === roleOption.value
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={roleOption.value}
                    checked={role === roleOption.value}
                    onChange={(e) => setRole(e.target.value)}
                    className="hidden"
                  />
                  <roleOption.icon className={`w-5 h-5 ${roleOption.color}`} />
                  <div className="flex-1">
                    <div className="text-white font-medium">{roleOption.label}</div>
                    <div className="text-gray-500 text-sm">{roleOption.description}</div>
                  </div>
                  {role === roleOption.value && (
                    <Check className="w-5 h-5 text-cyan-400" />
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400"
            >
              <Mail className="w-4 h-4" />
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditMemberModal({
  member,
  onSave,
  onClose,
}: {
  member: TeamMember;
  onSave: (role: TeamMember['role']) => void;
  onClose: () => void;
}) {
  const [role, setRole] = useState(member.role);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Edit Member</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-medium">
              {member.name.charAt(0)}
            </div>
            <div>
              <div className="text-white font-medium">{member.name}</div>
              <div className="text-gray-500 text-sm">{member.email}</div>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as TeamMember['role'])}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              {ROLES.filter((r) => r.value !== 'owner').map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(role)}
              className="px-4 py-2 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamManagement;
