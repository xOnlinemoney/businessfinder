'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { cn, formatCurrency } from '@/lib/utils';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Listing, ListingCategory } from '@/types';

interface ListingCardProps {
  listing: Partial<Listing> & {
    id: string;
    title: string;
    askingPrice: number;
    revenue: number;
    profit: number;
    category: ListingCategory;
  };
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
  onSaveToggle?: (id: string, saved: boolean) => void;
}

const categoryConfig: Record<ListingCategory, { icon: string; color: string; label: string }> = {
  saas: { icon: 'solar:cloud-linear', color: 'text-blue-600 bg-blue-100', label: 'SaaS' },
  ecommerce: { icon: 'solar:cart-large-minimalistic-linear', color: 'text-emerald-600 bg-emerald-100', label: 'E-commerce' },
  content: { icon: 'solar:document-text-linear', color: 'text-purple-600 bg-purple-100', label: 'Content' },
  agency: { icon: 'solar:buildings-2-linear', color: 'text-amber-600 bg-amber-100', label: 'Agency' },
  marketplace: { icon: 'solar:shop-2-linear', color: 'text-pink-600 bg-pink-100', label: 'Marketplace' },
  'mobile-app': { icon: 'solar:smartphone-linear', color: 'text-cyan-600 bg-cyan-100', label: 'Mobile App' },
  newsletter: { icon: 'solar:letter-linear', color: 'text-orange-600 bg-orange-100', label: 'Newsletter' },
  other: { icon: 'solar:widget-5-linear', color: 'text-dark-600 bg-dark-100', label: 'Other' },
};

export function ListingCard({ listing, variant = 'default', showActions = true, onSaveToggle }: ListingCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const category = categoryConfig[listing.category] || categoryConfig.other;
  const margin = listing.revenue > 0 ? ((listing.profit / listing.revenue) * 100).toFixed(0) : 0;
  const multiple = listing.profit > 0 ? (listing.askingPrice / (listing.profit * 12)).toFixed(1) : 0;

  // Check if listing is saved on mount
  useEffect(() => {
    const checkIfSaved = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('saved_listings')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', listing.id)
          .single();

        setIsSaved(!!data);
      } catch (error) {
        // Not saved or error - that's fine
      }
    };

    checkIfSaved();
  }, [listing.id]);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Not logged in - could show login modal here
        console.log('User not logged in');
        setIsLoading(false);
        return;
      }

      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_listings')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listing.id);

        if (error) {
          console.error('Error removing saved listing:', error);
        } else {
          setIsSaved(false);
          onSaveToggle?.(listing.id, false);
        }
      } else {
        // Add to saved
        const { error } = await (supabase.from('saved_listings') as any).insert({
          user_id: user.id,
          listing_id: listing.id,
        });

        if (error) {
          console.error('Error saving listing:', error);
        } else {
          setIsSaved(true);
          onSaveToggle?.(listing.id, true);
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <Link
        href={`/listing/${listing.id}`}
        className="block bg-white rounded-xl border border-dark-200 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
      >
        <div className="flex items-start gap-4">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', category.color)}>
            <Icon icon={category.icon} width={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-dark-900 truncate group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
            <p className="text-sm text-dark-500">{category.label}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-dark-900">{formatCurrency(listing.askingPrice, true)}</p>
            <p className="text-xs text-dark-500">{formatCurrency(listing.profit, true)}/yr profit</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-dark-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', category.color)}>
            <Icon icon={category.icon} width={22} />
          </div>
          <div className="flex items-center gap-2">
            {listing.isVerified && (
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center" title="Verified">
                <Icon icon="solar:verified-check-bold" className="text-emerald-600" width={16} />
              </div>
            )}
            {listing.isConfidential && (
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center" title="Confidential">
                <Icon icon="solar:lock-linear" className="text-amber-600" width={16} />
              </div>
            )}
            {showActions && (
              <button
                onClick={handleSaveClick}
                disabled={isLoading}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  isSaved
                    ? "text-red-500 bg-red-50"
                    : "text-dark-400 hover:text-red-500 hover:bg-red-50",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                <Icon icon={isSaved ? "solar:heart-bold" : "solar:heart-linear"} width={18} />
              </button>
            )}
          </div>
        </div>

        <Link href={`/listing/${listing.id}`}>
          <h3 className="font-bold text-dark-900 text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {listing.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 text-sm text-dark-500">
          <Badge variant="outline" size="sm">{category.label}</Badge>
          {listing.location && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Icon icon="solar:map-point-linear" width={14} />
                {listing.location}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-5 gap-2 text-center">
          <div className="py-2">
            <p className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Revenue</p>
            <p className="text-sm font-bold text-dark-900">{formatCurrency(listing.revenue, true)}</p>
          </div>
          <div className="py-2">
            <p className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Profit</p>
            <p className="text-sm font-bold text-emerald-600">{formatCurrency(listing.profit, true)}</p>
          </div>
          <div className="py-2">
            <p className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Asking</p>
            <p className="text-sm font-bold text-dark-900">{formatCurrency(listing.askingPrice, true)}</p>
          </div>
          <div className="py-2">
            <p className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Multiple</p>
            <p className="text-sm font-bold text-primary">{multiple}x</p>
          </div>
          <div className="py-2">
            <p className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider mb-1">Margin</p>
            <p className="text-sm font-bold text-dark-900">{margin}%</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-dark-50 border-t border-dark-100 flex items-center justify-between">
        {listing.status && (
          <StatusBadge status={listing.status === 'active' ? 'active' : 'pending'} />
        )}
        <Link
          href={`/listing/${listing.id}`}
          className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
        >
          View Details
          <Icon icon="solar:arrow-right-linear" width={14} />
        </Link>
      </div>
    </div>
  );
}

export default ListingCard;
