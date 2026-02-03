'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, Textarea } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { cn, formatCurrency } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Transaction {
  id: string;
  listing: string;
  buyer: string;
  seller: string;
  amount: number;
  status: string;
  stage: string;
  date: string;
  listingId?: string;
  buyerId?: string;
  sellerId?: string;
}

interface Stats {
  activeDeals: number;
  totalVolume: number;
  closingThisMonth: number;
  completedYTD: number;
}

const stages = ['Offer Made', 'Counter Offer', 'LOI Signed', 'Due Diligence', 'Final Review', 'Closed'];

const stageOptions = [
  { value: '', label: 'Select stage' },
  { value: 'Offer Made', label: 'Offer Made' },
  { value: 'Counter Offer', label: 'Counter Offer' },
  { value: 'LOI Signed', label: 'LOI Signed' },
  { value: 'Due Diligence', label: 'Due Diligence' },
  { value: 'Final Review', label: 'Final Review' },
  { value: 'Closed', label: 'Closed' },
];

export function AdminTransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats>({
    activeDeals: 0,
    totalVolume: 0,
    closingThisMonth: 0,
    completedYTD: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [newStage, setNewStage] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // No database connection - show empty state
        setTransactions([]);
        setStats({
          activeDeals: 0,
          totalVolume: 0,
          closingThisMonth: 0,
          completedYTD: 0,
        });
        setIsLoading(false);
        return;
      }

      try {
        // Fetch transactions with related data
        const { data: transactionsData, error } = await (supabase.from('transactions') as any)
          .select(`
            id,
            amount,
            status,
            stage,
            created_at,
            listing:listings(id, title),
            buyer:profiles!transactions_buyer_id_fkey(id, first_name, last_name),
            seller:profiles!transactions_seller_id_fkey(id, first_name, last_name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedTransactions = (transactionsData || []).map((t: any) => ({
          id: t.id.substring(0, 8).toUpperCase(),
          listing: t.listing?.title || 'Unknown Listing',
          buyer: t.buyer ? `${t.buyer.first_name || ''} ${t.buyer.last_name || ''}`.trim() : 'Unknown',
          seller: t.seller ? `${t.seller.first_name || ''} ${t.seller.last_name || ''}`.trim() : 'Unknown',
          amount: t.amount || 0,
          status: t.status || 'negotiation',
          stage: t.stage || 'Offer Made',
          date: t.created_at,
          listingId: t.listing?.id,
          buyerId: t.buyer?.id,
          sellerId: t.seller?.id,
        }));

        setTransactions(formattedTransactions);

        // Calculate stats
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const activeDeals = formattedTransactions.filter((t: Transaction) =>
          t.status !== 'completed' && t.stage !== 'Closed'
        ).length;

        const totalVolume = formattedTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        const closingThisMonth = formattedTransactions.filter((t: Transaction) => {
          const txDate = new Date(t.date);
          return t.stage === 'Final Review' || (t.stage === 'Closed' && txDate >= startOfMonth);
        }).length;

        const completedYTD = formattedTransactions.filter((t: Transaction) => {
          const txDate = new Date(t.date);
          return t.stage === 'Closed' && txDate >= startOfYear;
        }).length;

        setStats({
          activeDeals,
          totalVolume,
          closingThisMonth,
          completedYTD,
        });

      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleViewDeal = (txn: Transaction) => {
    setSelectedTransaction(txn);
    setShowViewModal(true);
  };

  const handleManage = (txn: Transaction) => {
    setSelectedTransaction(txn);
    setNewStage(txn.stage);
    setNotes('');
    setShowManageModal(true);
    setIsSubmitted(false);
  };

  const handleUpdateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransaction) return;

    setIsSubmitting(true);

    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        // Update transaction stage in database
        await (supabase.from('transactions') as any)
          .update({
            stage: newStage,
            status: newStage === 'Closed' ? 'completed' :
                    newStage === 'Due Diligence' || newStage === 'Final Review' ? 'closing' :
                    newStage === 'LOI Signed' ? 'loi' : 'negotiation',
            notes: notes || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedTransaction.id.length === 8 ? selectedTransaction.id : selectedTransaction.id);

        // Update local state
        setTransactions(prev => prev.map(t =>
          t.id === selectedTransaction.id
            ? { ...t, stage: newStage, status: newStage === 'Closed' ? 'completed' : t.status }
            : t
        ));

      } catch (error) {
        console.error('Error updating transaction:', error);
      }
    } else {
      // Demo mode - simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTransactions(prev => prev.map(t =>
        t.id === selectedTransaction.id
          ? { ...t, stage: newStage, status: newStage === 'Closed' ? 'completed' : t.status }
          : t
      ));
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'closing': return <StatusBadge status="info">In Closing</StatusBadge>;
      case 'loi': return <StatusBadge status="warning">LOI Phase</StatusBadge>;
      case 'completed': return <StatusBadge status="success">Completed</StatusBadge>;
      case 'negotiation': return <StatusBadge status="default">Negotiating</StatusBadge>;
      default: return <StatusBadge status="default">{status}</StatusBadge>;
    }
  };

  const statsConfig = [
    { label: 'Active Deals', value: stats.activeDeals, icon: 'solar:hand-shake-bold', color: 'primary' },
    { label: 'Total Volume', value: formatCurrency(stats.totalVolume, true), icon: 'solar:dollar-bold', color: 'emerald' },
    { label: 'Closing This Month', value: stats.closingThisMonth, icon: 'solar:calendar-bold', color: 'purple' },
    { label: 'Completed (YTD)', value: stats.completedYTD, icon: 'solar:check-circle-bold', color: 'amber' },
  ];

  return (
    <>
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <h1 className="text-lg font-bold text-dark-900">Transactions Management</h1>
        <Button variant="ghost" size="sm">
          <Icon icon="solar:export-linear" width={18} />
          Export
        </Button>
      </header>

      <main className="p-4 md:p-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsConfig.map((stat) => (
            <Card key={stat.label} className="flex items-center gap-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                stat.color === 'primary' && 'bg-primary/10 text-primary',
                stat.color === 'emerald' && 'bg-emerald-100 text-emerald-600',
                stat.color === 'purple' && 'bg-purple-100 text-purple-600',
                stat.color === 'amber' && 'bg-amber-100 text-amber-600'
              )}>
                <Icon icon={stat.icon} width={24} />
              </div>
              <div>
                {isLoading ? (
                  <div className="h-8 w-16 bg-dark-100 rounded animate-pulse" />
                ) : (
                  <p className="text-2xl font-bold text-dark-900">{stat.value}</p>
                )}
                <p className="text-sm text-dark-500">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Transaction Cards */}
        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-dark-100 rounded mb-2" />
                    <div className="h-6 w-48 bg-dark-100 rounded mb-2" />
                    <div className="h-4 w-32 bg-dark-100 rounded" />
                  </div>
                  <div className="text-right">
                    <div className="h-8 w-24 bg-dark-100 rounded mb-2" />
                    <div className="h-4 w-20 bg-dark-100 rounded" />
                  </div>
                </div>
              </Card>
            ))
          ) : transactions.length > 0 ? (
            transactions.map((txn) => (
              <Card key={txn.id} className="hover:border-primary/30 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-dark-500">#{txn.id}</span>
                      {getStatusBadge(txn.status)}
                    </div>
                    <h3 className="font-bold text-dark-900 mb-2">{txn.listing}</h3>
                    <div className="flex items-center gap-4 text-sm text-dark-500">
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:user-linear" width={14} />
                        Buyer: {txn.buyer}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon icon="solar:user-bold" width={14} />
                        Seller: {txn.seller}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-dark-900">{formatCurrency(txn.amount)}</p>
                    <p className="text-sm text-dark-500">{txn.stage}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDeal(txn)}>View Deal</Button>
                    <Button variant="primary" size="sm" onClick={() => handleManage(txn)}>Manage</Button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4 pt-4 border-t border-dark-100">
                  <div className="flex items-center justify-between">
                    {stages.map((stage, i) => {
                      const currentIndex = stages.indexOf(txn.stage);
                      const isCompleted = i <= currentIndex;
                      const isCurrent = stage === txn.stage;
                      return (
                        <React.Fragment key={stage}>
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                              isCompleted ? 'bg-primary text-white' : 'bg-dark-100 text-dark-400',
                              isCurrent && 'ring-4 ring-primary/20'
                            )}>
                              {isCompleted ? <Icon icon="solar:check-linear" width={16} /> : i + 1}
                            </div>
                            <span className={cn(
                              'text-[10px] mt-1 hidden lg:block',
                              isCompleted ? 'text-primary font-medium' : 'text-dark-400'
                            )}>{stage}</span>
                          </div>
                          {i < stages.length - 1 && (
                            <div className={cn(
                              'flex-1 h-0.5 mx-1',
                              i < currentIndex ? 'bg-primary' : 'bg-dark-100'
                            )} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="text-center py-12">
              <Icon icon="solar:bill-list-linear" width={48} className="text-dark-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dark-900 mb-2">No transactions yet</h3>
              <p className="text-dark-500">Transactions will appear here when offers are accepted.</p>
            </Card>
          )}
        </div>
      </main>

      {/* View Deal Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={`Deal Details - ${selectedTransaction?.id}`}
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="bg-dark-50 rounded-lg p-4">
              <h4 className="font-bold text-dark-900 mb-2">{selectedTransaction.listing}</h4>
              <p className="text-2xl font-bold text-primary">{formatCurrency(selectedTransaction.amount)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-dark-500">Buyer</p>
                <p className="font-medium text-dark-900">{selectedTransaction.buyer}</p>
              </div>
              <div>
                <p className="text-sm text-dark-500">Seller</p>
                <p className="font-medium text-dark-900">{selectedTransaction.seller}</p>
              </div>
              <div>
                <p className="text-sm text-dark-500">Current Stage</p>
                <p className="font-medium text-dark-900">{selectedTransaction.stage}</p>
              </div>
              <div>
                <p className="text-sm text-dark-500">Date Started</p>
                <p className="font-medium text-dark-900">
                  {new Date(selectedTransaction.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Button variant="primary" className="w-full" onClick={() => setShowViewModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Manage Modal */}
      <Modal
        isOpen={showManageModal}
        onClose={() => { setShowManageModal(false); setIsSubmitted(false); }}
        title="Manage Transaction"
      >
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={32} />
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-2">Stage Updated!</h3>
            <p className="text-dark-600 mb-6">The transaction has been moved to {newStage}.</p>
            <Button variant="primary" onClick={() => { setShowManageModal(false); setIsSubmitted(false); }}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleUpdateStage} className="space-y-4">
            <div className="bg-dark-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-dark-600"><span className="font-medium">Deal:</span> {selectedTransaction?.listing}</p>
              <p className="text-sm text-dark-600"><span className="font-medium">Amount:</span> {selectedTransaction ? formatCurrency(selectedTransaction.amount) : ''}</p>
            </div>
            <Select
              label="Update Stage"
              options={stageOptions}
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
            />
            <Textarea
              label="Notes (Optional)"
              placeholder="Add notes about this stage update..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowManageModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Stage'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}

export default AdminTransactionsContent;
