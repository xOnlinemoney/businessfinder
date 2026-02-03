'use client';

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSupabaseClient } from '@/lib/supabase/client';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  action: string;
  user: string;
  details: string;
  ip: string;
}

const mockLogs: LogEntry[] = [
  {
    id: 'LOG-001',
    timestamp: '2024-01-28T14:32:15',
    level: 'success',
    action: 'User Login',
    user: 'admin@businessfinder.com',
    details: 'Successful admin login',
    ip: '192.168.1.100',
  },
  {
    id: 'LOG-002',
    timestamp: '2024-01-28T14:28:42',
    level: 'info',
    action: 'Listing Created',
    user: 'john@techflow.io',
    details: 'New listing: TechFlow SaaS Platform',
    ip: '192.168.1.105',
  },
  {
    id: 'LOG-003',
    timestamp: '2024-01-28T14:15:33',
    level: 'warning',
    action: 'Failed Login Attempt',
    user: 'unknown@email.com',
    details: 'Invalid credentials - attempt 2 of 5',
    ip: '203.45.67.89',
  },
  {
    id: 'LOG-004',
    timestamp: '2024-01-28T13:58:21',
    level: 'info',
    action: 'NDA Signed',
    user: 'buyer@example.com',
    details: 'NDA signed for listing #LST-2451',
    ip: '192.168.1.110',
  },
  {
    id: 'LOG-005',
    timestamp: '2024-01-28T13:45:08',
    level: 'error',
    action: 'Payment Failed',
    user: 'system',
    details: 'Stripe webhook error: Invalid signature',
    ip: 'N/A',
  },
  {
    id: 'LOG-006',
    timestamp: '2024-01-28T13:30:55',
    level: 'success',
    action: 'Verification Approved',
    user: 'admin@businessfinder.com',
    details: 'Business verification approved for TechFlow',
    ip: '192.168.1.100',
  },
  {
    id: 'LOG-007',
    timestamp: '2024-01-28T12:22:17',
    level: 'info',
    action: 'Offer Submitted',
    user: 'robert@acquisitions.com',
    details: 'Offer of $8.5M submitted for listing #LST-2451',
    ip: '192.168.1.115',
  },
  {
    id: 'LOG-008',
    timestamp: '2024-01-28T11:55:44',
    level: 'warning',
    action: 'Rate Limit Exceeded',
    user: 'api-client-123',
    details: 'API rate limit exceeded - 1000 requests/hour',
    ip: '45.67.89.123',
  },
  {
    id: 'LOG-009',
    timestamp: '2024-01-28T11:30:22',
    level: 'success',
    action: 'User Registration',
    user: 'newuser@example.com',
    details: 'New buyer account created',
    ip: '192.168.1.120',
  },
  {
    id: 'LOG-010',
    timestamp: '2024-01-28T10:45:11',
    level: 'error',
    action: 'Email Delivery Failed',
    user: 'system',
    details: 'Failed to send verification email to invalid@email',
    ip: 'N/A',
  },
];

export function LogsContent() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const logsPerPage = 20;

  useEffect(() => {
    const fetchLogs = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // Demo mode - use mock data
        setLogs(mockLogs);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await (supabase.from('system_logs') as any)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        const formattedLogs: LogEntry[] = (data || []).map((log: any) => ({
          id: log.id,
          timestamp: log.created_at,
          level: log.level || 'info',
          action: log.action || 'Unknown',
          user: log.user_email || 'system',
          details: log.details || '',
          ip: log.ip_address || 'N/A',
        }));

        setLogs(formattedLogs.length > 0 ? formattedLogs : mockLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setLogs(mockLogs);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error } = await (supabase.from('system_logs') as any)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        const formattedLogs: LogEntry[] = (data || []).map((log: any) => ({
          id: log.id,
          timestamp: log.created_at,
          level: log.level || 'info',
          action: log.action || 'Unknown',
          user: log.user_email || 'system',
          details: log.details || '',
          ip: log.ip_address || 'N/A',
        }));

        setLogs(formattedLogs.length > 0 ? formattedLogs : mockLogs);
      } catch (error) {
        console.error('Error refreshing logs:', error);
      }
    }

    setIsLoading(false);
  };

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Action', 'User', 'Details', 'IP Address'],
      ...logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.level,
        log.action,
        log.user,
        log.details,
        log.ip,
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesAction = filterAction === 'all' || log.action.includes(filterAction);
    return matchesSearch && matchesLevel && matchesAction;
  });

  const paginatedLogs = filteredLogs.slice((page - 1) * logsPerPage, page * logsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return 'solar:check-circle-bold';
      case 'info': return 'solar:info-circle-bold';
      case 'warning': return 'solar:danger-triangle-bold';
      case 'error': return 'solar:close-circle-bold';
      default: return 'solar:info-circle-bold';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-dark-600 bg-dark-100';
    }
  };

  const stats = {
    total: logs.length,
    errors: logs.filter(l => l.level === 'error').length,
    warnings: logs.filter(l => l.level === 'warning').length,
    today: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length,
  };

  return (
    <>
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-dark-900">System Logs</h1>
          <p className="text-sm text-dark-500">Monitor system activity and events</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={handleRefresh}>
            <Icon icon="solar:refresh-linear" width={18} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleExport}>
            <Icon icon="solar:download-linear" width={18} />
            Export
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icon icon="solar:document-text-linear" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-dark-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stats.total}</p>
                )}
                <p className="text-sm text-dark-500">Total Entries</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Icon icon="solar:close-circle-linear" className="w-5 h-5 text-red-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-dark-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stats.errors}</p>
                )}
                <p className="text-sm text-dark-500">Errors</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Icon icon="solar:danger-triangle-linear" className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-dark-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stats.warnings}</p>
                )}
                <p className="text-sm text-dark-500">Warnings</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Icon icon="solar:calendar-linear" className="w-5 h-5 text-green-600" />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-12 bg-dark-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stats.today}</p>
                )}
                <p className="text-sm text-dark-500">Today</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                icon={<Icon icon="solar:magnifer-linear" className="w-5 h-5 text-dark-400" />}
              />
            </div>
            <select
              value={filterLevel}
              onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-dark-200 rounded-lg"
            >
              <option value="all">All Levels</option>
              <option value="success">Success</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <select
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-dark-200 rounded-lg"
            >
              <option value="all">All Actions</option>
              <option value="Login">Login</option>
              <option value="Listing">Listings</option>
              <option value="User">Users</option>
              <option value="Payment">Payments</option>
            </select>
          </div>
        </Card>

        {/* Logs Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-50 border-b border-dark-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Timestamp</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Level</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-dark-500 uppercase">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-16 bg-dark-100 rounded-full" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-28 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-40 bg-dark-100 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-dark-100 rounded" /></td>
                    </tr>
                  ))
                ) : paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-dark-50">
                      <td className="px-6 py-4 text-sm text-dark-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                          <Icon icon={getLevelIcon(log.level)} className="w-3 h-3" />
                          {log.level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-dark-900">{log.action}</td>
                      <td className="px-6 py-4 text-sm text-dark-600">{log.user}</td>
                      <td className="px-6 py-4 text-sm text-dark-600 max-w-xs truncate">{log.details}</td>
                      <td className="px-6 py-4 text-sm text-dark-500 font-mono">{log.ip}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-dark-500">
                      <Icon icon="solar:document-text-linear" width={32} className="mx-auto mb-2 opacity-50" />
                      <p>No logs found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-dark-200 flex items-center justify-between">
            <p className="text-sm text-dark-500">
              Showing {paginatedLogs.length} of {filteredLogs.length} entries
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="px-3 py-2 text-sm text-dark-600">
                Page {page} of {totalPages || 1}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </>
  );
}
