'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { NDAModal } from '@/components/listing/nda-modal';
import { cn, formatCurrency } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

interface ListingData {
  id: string;
  title: string;
  category: string;
  location: string;
  established: number;
  listedDays: number;
  website?: string;
  askingPrice: number;
  annualRevenue: number;
  annualProfit: number;
  multiple: number;
  revenueGrowth: number;
  profitMargin: number;
  requiresNda: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  description: string;
  sellerName: string;
  sellerEmail: string;
  viewCount: number;
  // New fields
  customers?: string;
  churnRate?: string;
  annualGrowth?: string;
  techStack?: string;
  competitors?: string;
  businessModel?: string;
  askingPriceReasoning?: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

// Fallback mock data
const mockListingData: ListingData = {
  id: 'BL-2847',
  title: 'Marketing Automation SaaS Platform for Small Businesses',
  category: 'SaaS',
  location: 'United States (100% Remote)',
  established: 2019,
  listedDays: 14,
  website: 'example-saas.com',
  askingPrice: 2800000,
  annualRevenue: 875000,
  annualProfit: 306250,
  multiple: 3.2,
  revenueGrowth: 42,
  profitMargin: 35,
  requiresNda: true,
  isVerified: true,
  isFeatured: true,
  description: `This is a profitable B2B SaaS platform that provides marketing automation tools for small businesses and agencies. Founded in 2019, the company has built a strong reputation in the digital marketing space with a focus on email marketing, social media scheduling, and customer relationship management.

The platform serves over 2,547 active paying subscribers across various industries including e-commerce, professional services, and B2B companies. The business has demonstrated consistent growth with 42% year-over-year revenue growth and maintains healthy unit economics with low customer acquisition costs and high retention rates.

Key differentiators include an intuitive user interface, seamless integrations with major platforms (Shopify, WordPress, Salesforce), and exceptional customer support. The platform has received consistently positive reviews with a 4.7/5 rating across review platforms.

The business operates fully remotely with a lean team of 8 employees (5 full-time, 3 contractors). The owner's role has been successfully reduced to approximately 10-15 hours per week focused on strategic oversight and key customer relationships, making this an ideal acquisition for someone looking for a cash-flowing business with strong fundamentals and growth potential.`,
  sellerName: 'Business Owner',
  sellerEmail: 'seller@example.com',
  viewCount: 1247,
  customers: '2,547+',
  churnRate: '2.1%',
  annualGrowth: '42%',
  techStack: 'React, Node.js, PostgreSQL, AWS',
  businessModel: 'B2B SaaS Subscription',
};

const categoryLabels: Record<string, string> = {
  saas: 'SaaS / B2B',
  ecommerce: 'E-commerce',
  content: 'Content / Media',
  agency: 'Agency',
  marketplace: 'Marketplace',
  mobile_app: 'Mobile App',
  'mobile-app': 'Mobile App',
  other: 'Other',
};

// Locked/Blurred card component for NDA-protected content
function LockedCard({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <Card className="bg-dark-50/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
        <span className="bg-white/90 border border-dark-200 text-[10px] font-bold px-2 py-1 rounded-md text-dark-500 flex items-center gap-1 shadow-sm">
          <Icon icon="solar:lock-bold" width={10} />
          {label || 'NDA'}
        </span>
      </div>
      <div className="blur-[6px] select-none pointer-events-none">
        {children}
      </div>
    </Card>
  );
}

export function ListingDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [listing, setListing] = useState<ListingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasSignedNDA, setHasSignedNDA] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [ndaSigningSuccess, setNdaSigningSuccess] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [sidebarCounts, setSidebarCounts] = useState({
    listings: 0,
    inquiriesReceived: 0,
    offersReceived: 0,
    savedListings: 0,
    myOffers: 0,
    ndasSigned: 0,
    unreadMessages: 0,
    unreadNotifications: 0,
  });

  useEffect(() => {
    const fetchListing = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // Demo mode
        setListing(mockListingData);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);

        // Fetch user profile if logged in
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', user.id)
            .single() as { data: { first_name: string | null; last_name: string | null; email: string | null } | null };

          if (profileData) {
            setUserProfile({
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              email: profileData.email || user.email || '',
            });
          }

          // Fetch sidebar counts
          const [listingsResult, savedResult, ndasResult] = await Promise.all([
            supabase.from('listings').select('id', { count: 'exact', head: true }).eq('seller_id', user.id),
            supabase.from('saved_listings').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('nda_signatures').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          ]);

          setSidebarCounts({
            listings: listingsResult.count || 0,
            inquiriesReceived: 0,
            offersReceived: 0,
            savedListings: savedResult.count || 0,
            myOffers: 0,
            ndasSigned: ndasResult.count || 0,
            unreadMessages: 0,
            unreadNotifications: 0,
          });
        }

        // Fetch listing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('listings')
          .select(`
            *,
            seller:profiles!listings_seller_id_fkey(first_name, last_name, email)
          `)
          .eq('id', id)
          .single();

        if (error || !data) {
          console.error('Listing not found:', error);
          setListing(mockListingData);
          setIsLoading(false);
          return;
        }

        // Calculate days since listing
        const createdDate = new Date(data.created_at);
        const now = new Date();
        const listedDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

        // Calculate multiple
        const multiple = data.annual_profit > 0 ? data.asking_price / data.annual_profit : 0;

        // Calculate profit margin
        const profitMargin = data.annual_revenue > 0 ? Math.round((data.annual_profit / data.annual_revenue) * 100) : 0;

        setListing({
          id: data.id,
          title: data.title,
          category: data.category || data.business_type || 'other',
          location: data.location || 'Remote',
          established: data.year_established ? parseInt(data.year_established) : new Date().getFullYear(),
          listedDays,
          website: data.website_url,
          askingPrice: data.asking_price || 0,
          annualRevenue: data.annual_revenue || 0,
          annualProfit: data.annual_profit || 0,
          multiple: Math.round(multiple * 10) / 10,
          revenueGrowth: data.revenue_growth || 0,
          profitMargin,
          requiresNda: data.requires_nda || false,
          isVerified: data.is_verified || false,
          isFeatured: data.is_featured || false,
          description: data.description || '',
          sellerName: data.seller ? `${data.seller.first_name} ${data.seller.last_name}` : 'Business Owner',
          sellerEmail: data.seller?.email || '',
          viewCount: data.view_count || 0,
          customers: data.customers,
          churnRate: data.churn_rate,
          annualGrowth: data.annual_growth,
          techStack: data.tech_stack,
          competitors: data.competitors,
          businessModel: data.business_model,
          askingPriceReasoning: data.asking_price_reasoning,
        });

        // Check if user has signed NDA for this listing
        if (user && data.requires_nda) {
          const { data: ndaData } = await supabase
            .from('nda_signatures')
            .select('id')
            .eq('user_id', user.id)
            .eq('listing_id', id)
            .single();

          setHasSignedNDA(!!ndaData);
        }

        // Increment view count
        await (supabase.from('listings') as any)
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id);

        // Check if user has saved this listing
        if (user) {
          const { data: savedData } = await supabase
            .from('saved_listings')
            .select('id')
            .eq('user_id', user.id)
            .eq('listing_id', id)
            .single();

          setIsSaved(!!savedData);
        }

      } catch (error) {
        console.error('Error fetching listing:', error);
        setListing(mockListingData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleSave = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('No Supabase client');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        return;
      }

      console.log('Saving listing for user:', user.id, 'listing:', id);

      if (isSaved) {
        // Remove from saved
        const { error: deleteError } = await supabase
          .from('saved_listings')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', id);

        if (deleteError) {
          console.error('Error removing saved listing:', deleteError);
          throw deleteError;
        }
        console.log('Successfully removed from saved');
      } else {
        // Add to saved
        const { error: insertError } = await (supabase.from('saved_listings') as any).insert({
          user_id: user.id,
          listing_id: id,
        });

        if (insertError) {
          console.error('Error inserting saved listing:', insertError);
          throw insertError;
        }
        console.log('Successfully saved listing');
      }

      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving listing:', error);
      alert('Failed to save listing. Check console for details.');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignNDA = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setShowNDAModal(true);
  };

  const handleNDASign = async (signature: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      // Insert NDA signature
      const { error } = await (supabase.from('nda_signatures') as any).insert({
        user_id: user.id,
        listing_id: id,
        signature_name: signature,
        ip_address: '', // Would be captured server-side in production
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      });

      if (error) throw error;

      // Show success and close modal
      setShowNDAModal(false);
      setNdaSigningSuccess(true);

      // After animation, update state
      setTimeout(() => {
        setHasSignedNDA(true);
        setNdaSigningSuccess(false);
      }, 2500);

    } catch (error) {
      console.error('Error signing NDA:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase || !listing) return;

    setIsSendingMessage(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      // Find the advisor - for now, default to super admin "aquire@businessfinder.co"
      // In the future, this would be listing.advisor_id
      const { data: advisorData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'aquire@businessfinder.co')
        .single() as { data: { id: string } | null };

      if (!advisorData) {
        console.error('Advisor not found');
        alert('Unable to send message. Please try again later.');
        return;
      }

      const advisorId = advisorData.id;

      // Check if conversation already exists for this listing between user and advisor
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', id)
        .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${advisorId}),and(participant_1_id.eq.${advisorId},participant_2_id.eq.${user.id})`)
        .single() as { data: { id: string } | null };

      let conversationId: string;

      if (existingConvo) {
        conversationId = existingConvo.id;
      } else {
        // Create new conversation
        const { data: newConvo, error: convoError } = await (supabase.from('conversations') as any)
          .insert({
            listing_id: id,
            participant_1_id: user.id,
            participant_2_id: advisorId,
            subject: messageSubject || `Inquiry about ${listing.title}`,
          })
          .select('id')
          .single();

        if (convoError) throw convoError;
        conversationId = newConvo.id;
      }

      // Send the message
      const { error: messageError } = await (supabase.from('messages') as any).insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: messageContent,
      });

      if (messageError) throw messageError;

      // Success!
      setMessageSent(true);
      setMessageContent('');
      setMessageSubject('');

      // Close modal after delay
      setTimeout(() => {
        setShowScheduleModal(false);
        setMessageSent(false);
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const shareLinks = typeof window !== 'undefined' ? {
    twitter: `https://twitter.com/intent/tweet?text=Check out this business for sale: ${listing?.title}&url=${encodeURIComponent(window.location.href)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    email: `mailto:?subject=Check out this business for sale&body=I found this interesting business listing: ${listing?.title}%0A%0A${window.location.href}`,
  } : { twitter: '', linkedin: '', facebook: '', email: '' };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-50">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-dark-500">Loading listing...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-dark-50">
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon icon="solar:box-minimalistic-linear" width={64} className="text-dark-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-dark-900 mb-2">Listing Not Found</h2>
            <p className="text-dark-500 mb-6">This listing may have been removed or is no longer available.</p>
            <Link href="/marketplace">
              <Button>Browse Marketplace</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Determine if we should show locked content
  const showLockedContent = listing?.requiresNda && !hasSignedNDA;

  // Get user display name for sidebar
  const getSidebarUserData = () => {
    if (!userProfile) return undefined;
    const fullName = (userProfile.firstName || userProfile.lastName)
      ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
      : userProfile.email?.split('@')[0] || 'User';
    return {
      name: fullName,
      email: userProfile.email,
    };
  };

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Sidebar for logged-in users */}
      {isLoggedIn && (
        <>
          {/* Mobile Overlay */}
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-dark-900/50 z-40 lg:hidden backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={cn(
              'fixed left-0 top-0 bottom-0 bg-dark-900 flex flex-col z-50',
              'transform transition-all duration-300',
              isSidebarCollapsed ? 'w-20' : 'w-64',
              isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
              'shadow-xl lg:shadow-none'
            )}
          >
            <Sidebar
              user={getSidebarUserData()}
              counts={sidebarCounts}
              isCollapsed={isSidebarCollapsed}
              onCollapseChange={setIsSidebarCollapsed}
            />
          </aside>
        </>
      )}

      {/* Main Content Wrapper */}
      <div className={cn(
        'transition-all duration-300',
        isLoggedIn && (isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64')
      )}>
        {/* Header for logged-in users (both mobile and desktop) */}
        {isLoggedIn && (
          <header className="sticky top-0 z-30 bg-white border-b border-dark-200 h-14 px-4 flex items-center justify-between">
            {/* Mobile: hamburger menu */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden text-dark-600 p-1"
            >
              <Icon icon="solar:hamburger-menu-linear" width={24} />
            </button>

            {/* Desktop: Logo and nav */}
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/marketplace" className="text-sm font-medium text-dark-600 hover:text-dark-900 transition-colors">
                Marketplace
              </Link>
              <Link href="/financing" className="text-sm font-medium text-dark-600 hover:text-dark-900 transition-colors">
                Financing
              </Link>
              <Link href="/resources" className="text-sm font-medium text-dark-600 hover:text-dark-900 transition-colors">
                Resources
              </Link>
            </div>

            {/* Mobile: Logo */}
            <Link href="/" className="lg:hidden font-bold text-dark-900 tracking-tight">BusinessFinder</Link>

            {/* Right side: notifications */}
            <Link href="/dashboard/notifications" className="text-dark-500 hover:text-dark-900 p-1 transition-colors">
              <Icon icon="solar:bell-linear" width={24} />
            </Link>
          </header>
        )}

        {/* Regular Header for non-logged-in users */}
        {!isLoggedIn && <Header />}

      {/* Sub-Header / Breadcrumbs */}
      <div className={cn(
        "bg-white border-b border-dark-200 h-12 flex items-center sticky z-20",
        isLoggedIn ? "top-14" : "top-16"
      )}>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-hidden">
            <Link href="/marketplace" className="group flex items-center gap-1.5 text-xs font-medium text-dark-500 hover:text-dark-900 transition-colors shrink-0">
              <Icon icon="solar:arrow-left-linear" width={14} className="group-hover:-translate-x-0.5 transition-transform" />
              Back
            </Link>
            <div className="h-3 w-px bg-dark-200 hidden sm:block shrink-0" />
            <nav className="hidden sm:flex items-center gap-2 text-xs text-dark-500 whitespace-nowrap overflow-hidden">
              <Link href="/marketplace" className="hover:underline">Marketplace</Link>
              <Icon icon="solar:alt-arrow-right-linear" width={10} />
              <Link href={`/marketplace?category=${listing.category}`} className="hover:underline">
                {categoryLabels[listing.category] || listing.category}
              </Link>
              <Icon icon="solar:alt-arrow-right-linear" width={10} />
              <span className="text-dark-900 font-medium truncate">{listing.title.substring(0, 30)}...</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {listing.requiresNda && (
              <StatusBadge status={hasSignedNDA ? "success" : "warning"} className="hidden md:flex">
                <Icon icon={hasSignedNDA ? "solar:shield-check-bold" : "solar:lock-bold"} width={12} />
                {hasSignedNDA ? 'NDA Signed' : 'NDA Required'}
              </StatusBadge>
            )}
            <button onClick={handleShare} className="text-dark-500 hover:text-primary transition-colors">
              <Icon icon="solar:share-bold" width={16} />
            </button>
            <button
              onClick={handleSave}
              className={cn('transition-colors', isSaved ? 'text-red-500' : 'text-dark-500 hover:text-red-500')}
            >
              <Icon icon={isSaved ? 'solar:heart-bold' : 'solar:heart-linear'} width={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 lg:py-10 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
          {/* Left Column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* Hero Info */}
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {listing.requiresNda && !hasSignedNDA && (
                  <Badge variant="warning">
                    <Icon icon="solar:lock-bold" width={12} />
                    NDA REQUIRED
                  </Badge>
                )}
                {listing.isVerified && (
                  <Badge variant="success">
                    <Icon icon="solar:verified-check-bold" width={12} />
                    VERIFIED FINANCIALS
                  </Badge>
                )}
                {listing.isFeatured && (
                  <Badge variant="purple">
                    <Icon icon="solar:fire-bold" width={12} />
                    FEATURED
                  </Badge>
                )}
                {listing.revenueGrowth > 20 && (
                  <Badge variant="primary">
                    <Icon icon="solar:trending-up-bold" width={12} />
                    HIGH GROWTH
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-dark-900 leading-tight tracking-tight">
                {listing.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-dark-500">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:briefcase-linear" width={18} className="text-dark-400" />
                  <span>{categoryLabels[listing.category] || listing.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:map-point-linear" width={18} className="text-dark-400" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="solar:calendar-linear" width={18} className="text-dark-400" />
                  <span>Est. {listing.established}</span>
                </div>
                {listing.listedDays >= 30 && (
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:clock-circle-linear" width={18} className="text-dark-400" />
                    <span>Listed {listing.listedDays} days ago</span>
                  </div>
                )}
                {listing.website && !showLockedContent && (
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:global-linear" width={18} className="text-dark-400" />
                    <a href={`https://${listing.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {listing.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {/* Asking Price - Always visible */}
                <Card className="hover:border-primary/50 transition-colors group">
                  <div className="text-[11px] font-bold text-dark-500 uppercase tracking-wider mb-1">Asking Price</div>
                  <div className="text-2xl font-bold text-dark-900 group-hover:text-primary transition-colors">
                    {formatCurrency(listing.askingPrice)}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">{listing.multiple}× Multiple</div>
                </Card>

                {/* Revenue - Locked if NDA required and not signed */}
                {showLockedContent ? (
                  <LockedCard>
                    <div className="text-[11px] font-bold text-dark-500 uppercase tracking-wider mb-1">Annual Revenue</div>
                    <div className="text-2xl font-bold text-dark-900">
                      {formatCurrency(listing.annualRevenue)}
                    </div>
                    {listing.revenueGrowth > 0 && (
                      <div className="text-[11px] text-emerald-600 font-medium mt-1">+{listing.revenueGrowth}% YoY</div>
                    )}
                  </LockedCard>
                ) : (
                  <Card className="hover:border-primary/50 transition-colors group">
                    <div className="text-[11px] font-bold text-dark-500 uppercase tracking-wider mb-1">Annual Revenue</div>
                    <div className="text-2xl font-bold text-dark-900 group-hover:text-primary transition-colors">
                      {formatCurrency(listing.annualRevenue)}
                    </div>
                    {listing.revenueGrowth > 0 && (
                      <div className="text-[11px] text-emerald-600 font-medium mt-1">+{listing.revenueGrowth}% YoY</div>
                    )}
                  </Card>
                )}

                {/* Profit - Locked if NDA required and not signed */}
                {showLockedContent ? (
                  <LockedCard>
                    <div className="text-[11px] font-bold text-dark-500 uppercase tracking-wider mb-1">Annual Profit</div>
                    <div className="text-2xl font-bold text-dark-900">
                      {formatCurrency(listing.annualProfit)}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1">{listing.profitMargin}% Margin</div>
                  </LockedCard>
                ) : (
                  <Card className="hover:border-primary/50 transition-colors group">
                    <div className="text-[11px] font-bold text-dark-500 uppercase tracking-wider mb-1">Annual Profit</div>
                    <div className="text-2xl font-bold text-dark-900 group-hover:text-primary transition-colors">
                      {formatCurrency(listing.annualProfit)}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1">{listing.profitMargin}% Margin</div>
                  </Card>
                )}

              </div>
            </div>

            <hr className="border-dark-200" />

            {/* Business Overview */}
            <section>
              <h2 className="text-xl font-bold text-dark-900 mb-6 flex items-center gap-2">
                <Icon icon="solar:document-text-bold" width={24} className="text-primary" />
                Business Overview
              </h2>
              {showLockedContent ? (
                <div className="prose prose-sm max-w-none text-dark-600 leading-relaxed relative pb-32">
                  {/* Show first paragraph normally */}
                  <p className="mb-4">{listing.description.split('\n\n')[0]}</p>

                  {/* Blur remaining content */}
                  <div className="blur-[4px] select-none opacity-60">
                    {listing.description.split('\n\n').slice(1).map((paragraph, i) => (
                      <p key={i} className="mb-4">{paragraph}</p>
                    ))}
                  </div>

                  {/* Fade Overlay with CTA */}
                  <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-dark-50 to-transparent flex items-end justify-center pb-6">
                    <Button
                      variant="outline"
                      onClick={handleSignNDA}
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-white shadow-lg"
                    >
                      <Icon icon="solar:lock-bold" width={18} />
                      Sign NDA to Read Full Description
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-dark-600 leading-relaxed space-y-4">
                  {listing.description.split('\n\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              )}
            </section>

            {/* Business Details */}
            <section>
              <h2 className="text-xl font-bold text-dark-900 mb-6 flex items-center gap-2">
                <Icon icon="solar:info-circle-bold" width={24} className="text-primary" />
                Business Details
              </h2>
              <Card padding="none">
                <div className="divide-y divide-dark-100">
                  <div className="grid grid-cols-2 gap-x-6 p-5">
                    <div className="text-sm text-dark-500">Industry</div>
                    <div className="text-sm font-medium text-dark-900">{categoryLabels[listing.category] || listing.category}</div>
                  </div>
                  {listing.businessModel && (
                    <div className="grid grid-cols-2 gap-x-6 p-5">
                      <div className="text-sm text-dark-500">Business Model</div>
                      <div className="text-sm font-medium text-dark-900">{listing.businessModel}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-x-6 p-5">
                    <div className="text-sm text-dark-500">Year Established</div>
                    <div className="text-sm font-medium text-dark-900">{listing.established}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 p-5">
                    <div className="text-sm text-dark-500">Location</div>
                    <div className="text-sm font-medium text-dark-900">{listing.location}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 p-5">
                    <div className="text-sm text-dark-500">Asking Price</div>
                    <div className="text-sm font-medium text-dark-900">{formatCurrency(listing.askingPrice)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 p-5">
                    <div className="text-sm text-dark-500">Valuation Multiple</div>
                    <div className="text-sm font-medium text-dark-900">{listing.multiple}× Annual Profit</div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Key Metrics - Locked if NDA required */}
            {(listing.customers || listing.churnRate || listing.annualGrowth) && (
              <section>
                <h2 className="text-xl font-bold text-dark-900 mb-6 flex items-center gap-2">
                  <Icon icon="solar:chart-2-bold" width={24} className="text-primary" />
                  Key Metrics
                </h2>
                {showLockedContent ? (
                  <div className="bg-white border border-dark-200 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                      <Icon icon="solar:lock-bold" width={32} className="text-primary mb-3" />
                      <p className="text-sm font-medium text-dark-900 mb-1">Detailed Metrics Available</p>
                      <p className="text-xs text-dark-500 mb-4">Sign NDA to view customer data, churn rate, and growth metrics</p>
                      <button onClick={handleSignNDA} className="text-xs font-semibold text-primary hover:underline">
                        Unlock Metrics
                      </button>
                    </div>
                    <div className="blur-sm opacity-40 grid grid-cols-3 gap-6">
                      <div>
                        <div className="text-sm text-dark-500 mb-1">Customers</div>
                        <div className="text-2xl font-bold text-dark-900">{listing.customers || '2,500+'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-dark-500 mb-1">Churn Rate</div>
                        <div className="text-2xl font-bold text-dark-900">{listing.churnRate || '2.1%'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-dark-500 mb-1">Annual Growth</div>
                        <div className="text-2xl font-bold text-dark-900">{listing.annualGrowth || '42%'}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {listing.customers && (
                      <Card>
                        <div className="text-xs font-semibold text-dark-500 uppercase mb-2">Customers</div>
                        <div className="text-2xl font-bold text-dark-900">{listing.customers}</div>
                      </Card>
                    )}
                    {listing.churnRate && (
                      <Card>
                        <div className="text-xs font-semibold text-dark-500 uppercase mb-2">Churn Rate</div>
                        <div className="text-2xl font-bold text-dark-900">{listing.churnRate}</div>
                        <div className="text-xs text-emerald-600 mt-1">Industry avg: 5%</div>
                      </Card>
                    )}
                    {listing.annualGrowth && (
                      <Card>
                        <div className="text-xs font-semibold text-dark-500 uppercase mb-2">Annual Growth</div>
                        <div className="text-2xl font-bold text-dark-900">{listing.annualGrowth}</div>
                      </Card>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Tech Stack */}
            {listing.techStack && (
              <section>
                <h2 className="text-xl font-bold text-dark-900 mb-6 flex items-center gap-2">
                  <Icon icon="solar:code-bold" width={24} className="text-primary" />
                  Technology Stack
                </h2>
                {showLockedContent ? (
                  <div className="bg-white border border-dark-200 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center">
                      <span className="bg-white border border-primary text-[10px] font-bold px-2 py-1 rounded-md text-primary flex items-center gap-1">
                        <Icon icon="solar:lock-bold" width={10} /> NDA Required
                      </span>
                    </div>
                    <div className="blur-sm select-none flex flex-wrap gap-2">
                      {listing.techStack.split(',').map((tech, i) => (
                        <span key={i} className="px-3 py-1.5 bg-dark-100 rounded-full text-sm text-dark-700">{tech.trim()}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {listing.techStack.split(',').map((tech, i) => (
                      <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">{tech.trim()}</span>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Verification */}
            <section>
              <h2 className="text-xl font-bold text-dark-900 mb-6 flex items-center gap-2">
                <Icon icon="solar:shield-check-bold" width={24} className="text-primary" />
                Verification & Trust
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="text-center hover:border-primary/30 transition-colors">
                  <Icon icon={listing.isVerified ? "solar:shield-check-bold" : "solar:shield-linear"} width={32} className={listing.isVerified ? "text-emerald-500 mx-auto mb-3" : "text-dark-300 mx-auto mb-3"} />
                  <div className="font-semibold text-sm text-dark-900">{listing.isVerified ? 'Financials Verified' : 'Pending Verification'}</div>
                  <div className="text-xs text-dark-500 mt-1">{listing.isVerified ? 'Third-party CPA audit' : 'Under review'}</div>
                </Card>
                <Card className="text-center hover:border-primary/30 transition-colors">
                  <Icon icon="solar:user-check-bold" width={32} className="text-primary mx-auto mb-3" />
                  <div className="font-semibold text-sm text-dark-900">Identity Verified</div>
                  <div className="text-xs text-dark-500 mt-1">Seller ID confirmed</div>
                </Card>
                <Card className="text-center hover:border-primary/30 transition-colors">
                  <Icon icon="solar:document-text-bold" width={32} className="text-amber-500 mx-auto mb-3" />
                  <div className="font-semibold text-sm text-dark-900">Legal Ready</div>
                  <div className="text-xs text-dark-500 mt-1">APA template prepared</div>
                </Card>
              </div>
            </section>
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 relative">
            <div className="sticky top-32 space-y-6">
              {/* NDA Card - Show when NDA required and not signed */}
              {listing.requiresNda && !hasSignedNDA ? (
                <Card variant="highlight" padding="none" className="overflow-hidden border-2 border-primary/30 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary to-blue-700" />
                  <div className="p-6 md:p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-dark-900 leading-tight mb-2">Sign NDA to View Full Details</h2>
                        <p className="text-sm text-dark-500 leading-relaxed">Unlock financials, business URL, and seller contact instantly.</p>
                      </div>
                      <div className="shrink-0 bg-primary/10 p-2 rounded-lg text-primary">
                        <Icon icon="solar:lock-bold" width={24} />
                      </div>
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-3 mb-8">
                      {[
                        'Complete P&L and Tax Returns',
                        'Business URL & Assets List',
                        'Direct Seller Communication',
                        'Customer & Traffic Analytics',
                      ].map((benefit, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Icon icon="solar:check-circle-bold" width={16} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-dark-900">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* User Info or Login Prompt */}
                    {isLoggedIn && userProfile ? (
                      <div className="p-3 bg-dark-50 border border-dark-200 rounded-lg flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {(userProfile.firstName && userProfile.lastName)
                            ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase()
                            : userProfile.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-dark-500">Signed in as</div>
                          <div className="text-sm font-medium text-dark-900">
                            {(userProfile.firstName || userProfile.lastName)
                              ? `${userProfile.firstName} ${userProfile.lastName}`.trim()
                              : userProfile.email?.split('@')[0] || 'User'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3 mb-4">
                        <Icon icon="solar:info-circle-bold" width={20} className="text-amber-600 shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm text-amber-800">Sign in required to sign the NDA</div>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full shadow-lg shadow-blue-500/20"
                      onClick={handleSignNDA}
                    >
                      <Icon icon="solar:lock-bold" width={18} />
                      Sign NDA & Unlock
                      <Icon icon="solar:arrow-right-linear" width={16} />
                    </Button>

                    <p className="text-center text-[11px] text-dark-400 mt-3 flex items-center justify-center gap-1.5">
                      <Icon icon="solar:shield-bold" width={12} />
                      Your information is secure and encrypted
                    </p>
                  </div>
                </Card>
              ) : (
                /* Connect Card - Show when NDA signed or not required */
                <Card variant="highlight" padding="none" className="overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-primary to-blue-700" />
                  <div className="p-6 md:p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-dark-900 leading-tight mb-2">Interested in this business?</h2>
                        <p className="text-sm text-dark-500 leading-relaxed">Send a message to the BusinessFinder team to learn more.</p>
                      </div>
                      <div className="shrink-0 bg-primary/10 p-2 rounded-lg text-primary">
                        <Icon icon="solar:chat-round-dots-bold" width={24} />
                      </div>
                    </div>

                    {listing.requiresNda && hasSignedNDA && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 mb-6">
                        <Icon icon="solar:check-circle-bold" width={20} className="text-emerald-600 shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-emerald-800">NDA Signed Successfully</div>
                          <div className="text-xs text-emerald-600">You have full access to this listing</div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full shadow-lg shadow-blue-500/20"
                        onClick={() => setShowScheduleModal(true)}
                      >
                        <Icon icon="solar:chat-round-dots-bold" width={18} />
                        Send Message
                        <Icon icon="solar:arrow-right-linear" width={16} />
                      </Button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-dark-200">
                      <div className="text-xs font-semibold text-dark-900 mb-3">What Happens Next:</div>
                      <div className="space-y-2">
                        {['Our team reviews your inquiry', 'We connect you with the right advisor', 'Get personalized guidance on this opportunity'].map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-dark-500">
                            <Icon icon="solar:check-circle-bold" width={12} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div className={cn(
        "fixed bottom-0 right-0 bg-white border-t border-dark-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] z-40 px-4 py-3 md:py-4 transition-all duration-300",
        isLoggedIn ? (isSidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64') : 'left-0'
      )}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div className="hidden md:block">
            <div className="text-xs text-dark-500 uppercase font-semibold">Asking Price</div>
            <div className="text-xl font-bold text-dark-900">{formatCurrency(listing.askingPrice)}</div>
          </div>
          <div className="md:hidden">
            <div className="text-lg font-bold text-dark-900">{formatCurrency(listing.askingPrice)}</div>
            <div className="text-[10px] text-dark-500">
              {listing.requiresNda && !hasSignedNDA ? 'NDA Required' : 'Contact Seller'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hidden md:flex" onClick={handleSave}>
              <Icon icon={isSaved ? "solar:heart-bold" : "solar:heart-linear"} width={18} className={isSaved ? 'text-red-500' : ''} />
              {isSaved ? 'Saved' : 'Save'}
            </Button>
            {listing.requiresNda && !hasSignedNDA ? (
              <Button variant="primary" className="flex-1 md:flex-none md:w-[200px]" onClick={handleSignNDA}>
                <Icon icon="solar:lock-bold" width={18} />
                Sign NDA to View
              </Button>
            ) : (
              <Button variant="primary" className="flex-1 md:flex-none md:w-[200px]" onClick={() => setShowScheduleModal(true)}>
                <Icon icon="solar:chat-round-dots-bold" width={18} />
                Send Message
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* NDA Modal */}
      <NDAModal
        isOpen={showNDAModal}
        onClose={() => setShowNDAModal(false)}
        onSign={handleNDASign}
        userName={userProfile ? `${userProfile.firstName} ${userProfile.lastName}`.trim() : ''}
        userEmail={userProfile?.email || ''}
        listingTitle={listing.title}
      />

      {/* NDA Success Overlay */}
      {ndaSigningSuccess && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-white/95 backdrop-blur-sm">
          <div className="text-center p-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon icon="solar:check-bold" width={40} />
            </div>
            <h2 className="text-3xl font-bold text-dark-900 mb-2">Access Granted!</h2>
            <p className="text-dark-500 mb-8 max-w-sm mx-auto">
              The NDA has been successfully signed. You now have full access to the financial details and seller information.
            </p>
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-dark-400 mt-4">Unlocking full listing...</p>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share this Listing"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 p-3 bg-dark-50 rounded-lg">
            <input
              type="text"
              readOnly
              value={typeof window !== 'undefined' ? window.location.href : ''}
              className="flex-1 bg-transparent text-sm text-dark-700 outline-none"
            />
            <Button size="sm" onClick={copyToClipboard}>
              <Icon icon={copied ? "solar:check-circle-bold" : "solar:copy-linear"} width={16} />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-4 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors">
              <Icon icon="mdi:twitter" width={24} className="text-[#1DA1F2]" />
              <span className="text-xs text-dark-600">Twitter</span>
            </a>
            <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-4 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors">
              <Icon icon="mdi:linkedin" width={24} className="text-[#0A66C2]" />
              <span className="text-xs text-dark-600">LinkedIn</span>
            </a>
            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-4 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors">
              <Icon icon="mdi:facebook" width={24} className="text-[#1877F2]" />
              <span className="text-xs text-dark-600">Facebook</span>
            </a>
            <a href={shareLinks.email} className="flex flex-col items-center gap-2 p-4 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors">
              <Icon icon="solar:letter-bold" width={24} className="text-dark-600" />
              <span className="text-xs text-dark-600">Email</span>
            </a>
          </div>
        </div>
      </Modal>

      {/* Login Modal for non-logged in users */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Sign in Required"
        size="sm"
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="solar:lock-bold" width={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900 mb-2">Sign in to Continue</h3>
          <p className="text-sm text-dark-500 mb-6">You need to be signed in to sign the NDA and access full listing details.</p>
          <div className="space-y-3">
            <Link href="/auth/signin">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" className="w-full">Create Account</Button>
            </Link>
          </div>
        </div>
      </Modal>

      {/* Message Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setMessageSent(false);
        }}
        title="Contact Our Team"
        size="lg"
      >
        <div className="p-6">
          {messageSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="solar:check-bold" className="text-emerald-600" width={32} />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-2">Message Sent!</h3>
              <p className="text-dark-500">Our team will review your inquiry and get back to you shortly.</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Icon icon="solar:info-circle-bold" width={20} className="text-primary shrink-0 mt-0.5" />
                  <div className="text-sm text-dark-600">
                    <p className="font-medium text-dark-900 mb-1">Regarding: {listing.title}</p>
                    <p className="text-xs text-dark-500">Your message will be reviewed by our team and we'll connect you with the right advisor.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g., Inquiry about this business"
                    className="w-full px-4 py-3 border border-dark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={messageSubject || `Inquiry about ${listing.title}`}
                    onChange={(e) => setMessageSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-2">Message</label>
                  <textarea
                    rows={5}
                    placeholder="Tell us about yourself and what you'd like to know about this business opportunity..."
                    className="w-full px-4 py-3 border border-dark-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleSendMessage}
                  disabled={isSendingMessage || !messageContent.trim()}
                  isLoading={isSendingMessage}
                >
                  <Icon icon="solar:plain-bold" width={18} />
                  Send Message
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <div className="pb-20" />
        <Footer />
      </div>
    </div>
  );
}

export default ListingDetailContent;
