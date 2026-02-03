'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Sidebar } from '@/components/layout/sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';

// Mock listing data
const listingsData: Record<string, {
  id: string;
  title: string;
  type: string;
  status: string;
  askingPrice: number;
  revenue: number;
  profit: number;
  views: number;
  saves: number;
  inquiries: number;
  offers: number;
  daysListed: number;
  verified: boolean;
  featured: boolean;
  description: string;
  highlights: string[];
  recentActivity: { type: string; description: string; time: string }[];
}> = {
  'BL-2847': {
    id: 'BL-2847',
    title: 'Marketing Automation SaaS Platform',
    type: 'SaaS',
    status: 'active',
    askingPrice: 2800000,
    revenue: 720000,
    profit: 360000,
    views: 1247,
    saves: 89,
    inquiries: 12,
    offers: 2,
    daysListed: 14,
    verified: true,
    featured: true,
    description: 'A profitable marketing automation platform with 2,500+ paying customers and strong MRR growth. The business has been operating for 5 years with a dedicated team of 8.',
    highlights: [
      '95% gross margins',
      '2,500+ active customers',
      '15% MoM growth',
      'Fully remote team of 8',
      'Strong brand recognition',
    ],
    recentActivity: [
      { type: 'offer', description: 'New offer received for $2.6M', time: '2 hours ago' },
      { type: 'inquiry', description: 'Qualified buyer requested more info', time: '5 hours ago' },
      { type: 'view', description: 'Listing viewed 45 times today', time: '1 day ago' },
      { type: 'save', description: '12 new saves this week', time: '2 days ago' },
    ],
  },
  'BL-2103': {
    id: 'BL-2103',
    title: 'E-Commerce Fashion Brand',
    type: 'E-commerce',
    status: 'active',
    askingPrice: 1500000,
    revenue: 850000,
    profit: 280000,
    views: 856,
    saves: 45,
    inquiries: 8,
    offers: 1,
    daysListed: 21,
    verified: true,
    featured: false,
    description: 'Established fashion e-commerce brand with a loyal customer base and strong social media presence. Operates primarily through Shopify with wholesale partnerships.',
    highlights: [
      '35% profit margins',
      '150K+ email subscribers',
      'Strong Instagram presence (200K followers)',
      'Wholesale partnerships',
      'Repeat customer rate of 40%',
    ],
    recentActivity: [
      { type: 'inquiry', description: 'PE firm expressed interest', time: '1 day ago' },
      { type: 'view', description: 'Listing viewed 28 times today', time: '1 day ago' },
      { type: 'offer', description: 'Offer received for $1.35M', time: '3 days ago' },
    ],
  },
};

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = params.id as string;
  const listing = listingsData[listingId] || listingsData['BL-2847'];

  const [isPaused, setIsPaused] = useState(listing.status === 'paused');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <StatusBadge status="success">Active</StatusBadge>;
      case 'paused':
        return <StatusBadge status="warning">Paused</StatusBadge>;
      case 'pending':
        return <StatusBadge status="warning">Pending Review</StatusBadge>;
      case 'draft':
        return <StatusBadge status="default">Draft</StatusBadge>;
      default:
        return <StatusBadge status="default">{status}</StatusBadge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'offer':
        return 'solar:dollar-minimalistic-bold';
      case 'inquiry':
        return 'solar:chat-round-dots-bold';
      case 'view':
        return 'solar:eye-bold';
      case 'save':
        return 'solar:heart-bold';
      default:
        return 'solar:bell-bold';
    }
  };

  const currentStatus = isPaused ? 'paused' : listing.status;

  return (
    <div className="min-h-screen bg-dark-50">
      <Sidebar />

      <div className="lg:ml-72">
        {/* Header */}
        <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/listings" className="text-dark-500 hover:text-dark-700">
              <Icon icon="solar:arrow-left-linear" width={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-dark-900 tracking-tight">Listing Details</h1>
              <p className="text-sm text-dark-500">#{listing.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/listing/${listing.id}`}>
              <Button variant="ghost">
                <Icon icon="solar:eye-linear" width={18} />
                Preview
              </Button>
            </Link>
            <Link href={`/dashboard/listings/${listing.id}/edit`}>
              <Button variant="outline">
                <Icon icon="solar:pen-linear" width={18} />
                Edit Listing
              </Button>
            </Link>
            <Button
              variant={isPaused ? 'primary' : 'secondary'}
              onClick={() => setIsPaused(!isPaused)}
            >
              <Icon icon={isPaused ? 'solar:play-circle-linear' : 'solar:pause-circle-linear'} width={18} />
              {isPaused ? 'Resume Listing' : 'Pause Listing'}
            </Button>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-[1400px] mx-auto">
          {/* Status Banner */}
          <div className="flex items-center gap-4 mb-6">
            {getStatusBadge(currentStatus)}
            {listing.verified && (
              <Badge variant="success" size="sm">
                <Icon icon="solar:verified-check-linear" width={14} />
                Verified
              </Badge>
            )}
            {listing.featured && (
              <Badge variant="purple" size="sm">
                <Icon icon="solar:star-bold" width={14} />
                Featured
              </Badge>
            )}
            <span className="text-sm text-dark-500 ml-auto">Listed {listing.daysListed} days ago</span>
          </div>

          {/* Title & Price */}
          <Card className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-dark-900 mb-2">{listing.title}</h2>
                <div className="flex items-center gap-3 text-dark-500">
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:tag-linear" width={16} />
                    {listing.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-dark-500 mb-1">Asking Price</p>
                <p className="text-3xl font-bold text-dark-900">{formatCurrency(listing.askingPrice)}</p>
              </div>
            </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Stats & Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Stats */}
              <Card>
                <h3 className="font-bold text-dark-900 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-dark-50 rounded-xl p-4 text-center">
                    <Icon icon="solar:eye-bold" className="text-blue-500 mx-auto mb-2" width={24} />
                    <p className="text-2xl font-bold text-dark-900">{listing.views.toLocaleString()}</p>
                    <p className="text-sm text-dark-500">Total Views</p>
                  </div>
                  <div className="bg-dark-50 rounded-xl p-4 text-center">
                    <Icon icon="solar:heart-bold" className="text-red-500 mx-auto mb-2" width={24} />
                    <p className="text-2xl font-bold text-dark-900">{listing.saves}</p>
                    <p className="text-sm text-dark-500">Saves</p>
                  </div>
                  <div className="bg-dark-50 rounded-xl p-4 text-center">
                    <Icon icon="solar:chat-round-dots-bold" className="text-primary mx-auto mb-2" width={24} />
                    <p className="text-2xl font-bold text-dark-900">{listing.inquiries}</p>
                    <p className="text-sm text-dark-500">Inquiries</p>
                  </div>
                  <div className="bg-dark-50 rounded-xl p-4 text-center">
                    <Icon icon="solar:dollar-minimalistic-bold" className="text-emerald-500 mx-auto mb-2" width={24} />
                    <p className="text-2xl font-bold text-dark-900">{listing.offers}</p>
                    <p className="text-sm text-dark-500">Offers</p>
                  </div>
                </div>
              </Card>

              {/* Financial Summary */}
              <Card>
                <h3 className="font-bold text-dark-900 mb-4">Financial Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-dark-50 rounded-xl p-4">
                    <p className="text-sm text-dark-500 mb-1">Annual Revenue</p>
                    <p className="text-xl font-bold text-dark-900">{formatCurrency(listing.revenue)}</p>
                  </div>
                  <div className="bg-dark-50 rounded-xl p-4">
                    <p className="text-sm text-dark-500 mb-1">Annual Profit</p>
                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(listing.profit)}</p>
                  </div>
                  <div className="bg-dark-50 rounded-xl p-4">
                    <p className="text-sm text-dark-500 mb-1">Profit Margin</p>
                    <p className="text-xl font-bold text-dark-900">{((listing.profit / listing.revenue) * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </Card>

              {/* Description */}
              <Card>
                <h3 className="font-bold text-dark-900 mb-4">Business Description</h3>
                <p className="text-dark-600 leading-relaxed">{listing.description}</p>
              </Card>

              {/* Highlights */}
              <Card>
                <h3 className="font-bold text-dark-900 mb-4">Key Highlights</h3>
                <ul className="space-y-3">
                  {listing.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={14} />
                      </div>
                      <span className="text-dark-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Right Column - Activity & Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <h3 className="font-bold text-dark-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href={`/dashboard/listings/${listing.id}/edit`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Icon icon="solar:pen-linear" width={18} />
                      Edit Listing
                    </Button>
                  </Link>
                  <Link href="/dashboard/inquiries" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Icon icon="solar:chat-round-dots-linear" width={18} />
                      View Inquiries ({listing.inquiries})
                    </Button>
                  </Link>
                  <Link href="/dashboard/offers" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Icon icon="solar:dollar-minimalistic-linear" width={18} />
                      View Offers ({listing.offers})
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start text-amber-600 hover:bg-amber-50">
                    <Icon icon="solar:star-linear" width={18} />
                    Boost Listing
                  </Button>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card>
                <h3 className="font-bold text-dark-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {listing.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        activity.type === 'offer' && 'bg-emerald-100 text-emerald-600',
                        activity.type === 'inquiry' && 'bg-primary/10 text-primary',
                        activity.type === 'view' && 'bg-blue-100 text-blue-600',
                        activity.type === 'save' && 'bg-red-100 text-red-500',
                      )}>
                        <Icon icon={getActivityIcon(activity.type)} width={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-dark-700">{activity.description}</p>
                        <p className="text-xs text-dark-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Need Help? */}
              <Card className="bg-primary/5 border-primary/20">
                <div className="text-center">
                  <Icon icon="solar:question-circle-bold" className="text-primary mx-auto mb-3" width={32} />
                  <h3 className="font-bold text-dark-900 mb-2">Need Help?</h3>
                  <p className="text-sm text-dark-600 mb-4">
                    Our advisors can help you optimize your listing and connect with qualified buyers.
                  </p>
                  <Link href="/contact">
                    <Button variant="primary" className="w-full">
                      Contact an Advisor
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
