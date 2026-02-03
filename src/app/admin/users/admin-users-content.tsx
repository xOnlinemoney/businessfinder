'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { cn, formatDate } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  verified: boolean;
  status: string;
  listings: number;
  joined: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

interface Stats {
  totalUsers: number;
  sellers: number;
  buyers: number;
  pendingVerification: number;
  admins: number;
}

const mockUsers: User[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', avatar: 'https://i.pravatar.cc/150?img=11', role: 'seller', verified: true, status: 'active', listings: 4, joined: '2023-06-15', isAdmin: false, isSuperAdmin: false },
  { id: '2', name: 'Michael Chen', email: 'michael@example.com', avatar: 'https://i.pravatar.cc/150?img=33', role: 'buyer', verified: true, status: 'active', listings: 0, joined: '2023-09-20', isAdmin: false, isSuperAdmin: false },
  { id: '3', name: 'Sarah Williams', email: 'sarah@example.com', avatar: 'https://i.pravatar.cc/150?img=5', role: 'both', verified: true, status: 'active', listings: 2, joined: '2023-07-10', isAdmin: true, isSuperAdmin: false },
];

const roleOptions = [
  { value: 'all', label: 'All Roles' },
  { value: 'buyer', label: 'Buyers' },
  { value: 'seller', label: 'Sellers' },
  { value: 'both', label: 'Both' },
  { value: 'admin', label: 'Admins' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
];

export function AdminUsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, sellers: 0, buyers: 0, pendingVerification: 0, admins: 0 });
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'super_admin'>('admin');
  const [isSending, setIsSending] = useState(false);
  const [currentUserIsSuperAdmin, setCurrentUserIsSuperAdmin] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setUsers(mockUsers);
        setStats({ totalUsers: 2847, sellers: 892, buyers: 1955, pendingVerification: 43, admins: 5 });
        setCurrentUserIsSuperAdmin(true);
        setIsLoading(false);
        return;
      }

      try {
        // Check if current user is super admin
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('is_super_admin')
            .eq('id', user.id)
            .single() as { data: { is_super_admin: boolean | null } | null };

          setCurrentUserIsSuperAdmin(currentProfile?.is_super_admin || false);
        }

        // Fetch all users
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profilesData } = await (supabase as any)
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesData && profilesData.length > 0) {
          // Get listing counts for each user
          const usersWithListings = await Promise.all(
            profilesData.map(async (profile: any) => {
              const { count } = await supabase
                .from('listings')
                .select('id', { count: 'exact', head: true })
                .eq('seller_id', profile.id);

              return {
                id: profile.id,
                name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
                email: profile.email || '',
                avatar: profile.avatar_url || '',
                role: (count || 0) > 0 ? 'seller' : 'buyer',
                verified: true,
                status: profile.status || 'active',
                listings: count || 0,
                joined: profile.created_at,
                isAdmin: profile.is_admin || false,
                isSuperAdmin: profile.is_super_admin || false,
              };
            })
          );

          setUsers(usersWithListings);

          // Calculate stats
          setStats({
            totalUsers: usersWithListings.length,
            sellers: usersWithListings.filter(u => u.listings > 0).length,
            buyers: usersWithListings.filter(u => u.listings === 0).length,
            pendingVerification: usersWithListings.filter(u => u.status === 'pending').length,
            admins: usersWithListings.filter(u => u.isAdmin).length,
          });
        } else {
          setUsers([]);
          setStats({ totalUsers: 0, sellers: 0, buyers: 0, pendingVerification: 0, admins: 0 });
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers(mockUsers);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    if (roleFilter === 'admin' && !user.isAdmin) return false;
    if (roleFilter !== 'all' && roleFilter !== 'admin' && user.role !== roleFilter) return false;
    if (statusFilter !== 'all' && user.status !== statusFilter) return false;
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) && !user.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSuspendUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await (supabase.from('profiles') as any)
          .update({ status: newStatus })
          .eq('id', userId);

        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, status: newStatus } : u
        ));
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    } else {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, status: newStatus } : u
      ));
    }
  };

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    if (!currentUserIsSuperAdmin) return;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await (supabase.from('profiles') as any)
          .update({ is_admin: !isCurrentlyAdmin })
          .eq('id', userId);

        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, isAdmin: !isCurrentlyAdmin } : u
        ));
      } catch (error) {
        console.error('Error updating admin status:', error);
      }
    } else {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, isAdmin: !isCurrentlyAdmin } : u
      ));
    }
  };

  const handleInviteAdmin = async () => {
    if (!inviteEmail.trim() || isSending) return;

    setIsSending(true);

    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        // Create an admin invite record
        await (supabase.from('admin_invites') as any).insert({
          email: inviteEmail.trim(),
          role: inviteRole,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        });

        // In a real app, you would send an email here
        alert(`Admin invite sent to ${inviteEmail}!`);

        setShowInviteModal(false);
        setInviteEmail('');
      } catch (error) {
        console.error('Error sending invite:', error);
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Admin invite sent to ${inviteEmail}!`);
      setShowInviteModal(false);
      setInviteEmail('');
    }

    setIsSending(false);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <StatusBadge status="success">Active</StatusBadge>;
      case 'pending': return <StatusBadge status="warning">Pending</StatusBadge>;
      case 'suspended': return <StatusBadge status="danger">Suspended</StatusBadge>;
      default: return <StatusBadge status="default">{status}</StatusBadge>;
    }
  };

  const getRoleBadge = (user: User) => {
    if (user.isSuperAdmin) return <Badge variant="danger">Super Admin</Badge>;
    if (user.isAdmin) return <Badge variant="purple">Admin</Badge>;
    if (user.role === 'buyer') return <Badge variant="primary">Buyer</Badge>;
    if (user.role === 'seller') return <Badge variant="success">Seller</Badge>;
    if (user.role === 'both') return <Badge variant="purple">Buyer & Seller</Badge>;
    return <Badge variant="default">{user.role}</Badge>;
  };

  const statsConfig = [
    { label: 'Total Users', value: stats.totalUsers, icon: 'solar:users-group-rounded-bold', color: 'primary' },
    { label: 'Sellers', value: stats.sellers, icon: 'solar:tag-price-bold', color: 'emerald' },
    { label: 'Buyers', value: stats.buyers, icon: 'solar:cart-large-2-bold', color: 'purple' },
    { label: 'Admins', value: stats.admins, icon: 'solar:shield-user-bold', color: 'pink' },
    { label: 'Pending', value: stats.pendingVerification, icon: 'solar:clock-circle-bold', color: 'amber' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-500">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <h1 className="text-lg font-bold text-dark-900">Users Management</h1>
        <div className="flex items-center gap-3">
          {currentUserIsSuperAdmin && (
            <Button variant="primary" size="sm" onClick={() => setShowInviteModal(true)}>
              <Icon icon="solar:user-plus-linear" width={18} />
              Invite Admin
            </Button>
          )}
          <Button variant="ghost" size="sm">
            <Icon icon="solar:export-linear" width={18} />
            Export
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-8">
        {/* Super Admin Badge */}
        {currentUserIsSuperAdmin && (
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl p-4 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon icon="solar:crown-bold" width={28} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Super Admin Access</h3>
              <p className="text-sm text-white/80">You have full control over admin roles and user management.</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statsConfig.map((stat) => (
            <Card key={stat.label} className="flex items-center gap-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                stat.color === 'primary' && 'bg-primary/10 text-primary',
                stat.color === 'emerald' && 'bg-emerald-100 text-emerald-600',
                stat.color === 'purple' && 'bg-purple-100 text-purple-600',
                stat.color === 'pink' && 'bg-pink-100 text-pink-600',
                stat.color === 'amber' && 'bg-amber-100 text-amber-600'
              )}>
                <Icon icon={stat.icon} width={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-900">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-dark-500">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Icon icon="solar:magnifer-linear" width={18} />}
              />
            </div>
            <Select options={roleOptions} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-36" />
            <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36" />
          </div>
        </Card>

        {/* Users Table */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 border-b border-dark-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-dark-500 uppercase">User</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Role</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Status</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Verified</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Listings</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Joined</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-dark-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-dark-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon icon="solar:user-bold" width={20} className="text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-dark-900">{user.name}</p>
                          <p className="text-xs text-dark-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{getRoleBadge(user)}</td>
                    <td className="py-4 px-4 text-center">{getStatusBadge(user.status)}</td>
                    <td className="py-4 px-4 text-center">
                      {user.verified ? (
                        <Icon icon="solar:verified-check-bold" width={20} className="text-primary mx-auto" />
                      ) : (
                        <Icon icon="solar:close-circle-linear" width={20} className="text-dark-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-right text-dark-600">{user.listings}</td>
                    <td className="py-4 px-4 text-right text-dark-500 text-sm">{formatDate(user.joined)}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}>
                          <Icon icon="solar:eye-linear" width={16} />
                        </Button>
                        {currentUserIsSuperAdmin && !user.isSuperAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                            className={user.isAdmin ? 'text-purple-600' : ''}
                          >
                            <Icon icon={user.isAdmin ? 'solar:shield-check-bold' : 'solar:shield-linear'} width={16} />
                          </Button>
                        )}
                        {!user.isSuperAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuspendUser(user.id, user.status)}
                            className={user.status === 'suspended' ? 'text-emerald-600' : 'text-red-600'}
                          >
                            <Icon icon={user.status === 'suspended' ? 'solar:unlock-linear' : 'solar:lock-linear'} width={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="p-12 text-center">
              <Icon icon="solar:users-group-rounded-linear" width={48} className="text-dark-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dark-900 mb-2">No users found</h3>
              <p className="text-dark-500">Try adjusting your filters.</p>
            </div>
          )}
        </Card>
      </main>

      {/* Invite Admin Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Admin"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 flex items-start gap-3">
            <Icon icon="solar:shield-user-bold" width={24} className="text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-dark-900 mb-1">Invite a New Admin</h4>
              <p className="text-sm text-dark-600">
                Send an invitation to join as an admin. They'll receive an email with instructions to set up their account.
              </p>
            </div>
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="admin@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            leftIcon="solar:letter-linear"
          />

          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">Admin Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setInviteRole('admin')}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-colors',
                  inviteRole === 'admin'
                    ? 'border-primary bg-primary/5'
                    : 'border-dark-200 hover:border-dark-300'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="solar:shield-check-bold" width={20} className="text-purple-600" />
                  <span className="font-semibold text-dark-900">Admin</span>
                </div>
                <p className="text-xs text-dark-500">Can manage listings, users, and content</p>
              </button>
              <button
                onClick={() => setInviteRole('super_admin')}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-colors',
                  inviteRole === 'super_admin'
                    ? 'border-primary bg-primary/5'
                    : 'border-dark-200 hover:border-dark-300'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="solar:crown-bold" width={20} className="text-pink-600" />
                  <span className="font-semibold text-dark-900">Super Admin</span>
                </div>
                <p className="text-xs text-dark-500">Full access including admin management</p>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-dark-200">
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleInviteAdmin}
              isLoading={isSending}
              disabled={!inviteEmail.trim()}
            >
              <Icon icon="solar:plain-bold" width={18} />
              Send Invitation
            </Button>
            <Button variant="ghost" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* View User Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-dark-50 rounded-xl">
              {selectedUser.avatar ? (
                <img src={selectedUser.avatar} alt={selectedUser.name} className="w-16 h-16 rounded-full" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon icon="solar:user-bold" width={32} className="text-primary" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-dark-900">{selectedUser.name}</h3>
                <p className="text-dark-500">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  {getRoleBadge(selectedUser)}
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-xs text-dark-500 font-semibold mb-1">Listings</p>
                <p className="text-2xl font-bold text-dark-900">{selectedUser.listings}</p>
              </div>
              <div className="p-4 bg-dark-50 rounded-xl">
                <p className="text-xs text-dark-500 font-semibold mb-1">Joined</p>
                <p className="text-lg font-bold text-dark-900">{formatDate(selectedUser.joined)}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-dark-200">
              <Button variant="secondary" className="flex-1" onClick={() => setShowViewModal(false)}>
                <Icon icon="solar:chat-round-dots-linear" width={18} />
                Send Message
              </Button>
              {!selectedUser.isSuperAdmin && (
                <Button
                  variant={selectedUser.status === 'suspended' ? 'success' : 'danger'}
                  onClick={() => {
                    handleSuspendUser(selectedUser.id, selectedUser.status);
                    setShowViewModal(false);
                  }}
                >
                  <Icon icon={selectedUser.status === 'suspended' ? 'solar:unlock-linear' : 'solar:lock-linear'} width={18} />
                  {selectedUser.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default AdminUsersContent;
