'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { cn, formatCurrency } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

// Business type options
const businessTypeOptions = [
  { value: '', label: 'Select a business type' },
  { value: 'saas', label: 'SaaS (Software as a Service)' },
  { value: 'ecommerce', label: 'E-commerce / D2C' },
  { value: 'content', label: 'Content / Media / Blog' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'agency', label: 'Agency / Service' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'newsletter', label: 'Newsletter / Community' },
  { value: 'affiliate', label: 'Affiliate Marketing' },
  { value: 'info-product', label: 'Info Products / Courses' },
  { value: 'other', label: 'Other' },
];

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'active', label: 'Active (Published)' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'sold', label: 'Sold' },
];

const tabs = [
  { id: 'basics', label: 'Basic Info', icon: 'solar:document-text-linear' },
  { id: 'financials', label: 'Financials', icon: 'solar:chart-linear' },
  { id: 'details', label: 'Details', icon: 'solar:info-circle-linear' },
  { id: 'admin', label: 'Admin Settings', icon: 'solar:settings-linear' },
];

export default function AdminNewListingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('basics');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sellers, setSellers] = useState<Array<{ id: string; name: string; email: string }>>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    askingPrice: '',
    revenue: '',
    profit: '',
    description: '',
    highlights: '',
    employees: '',
    established: '',
    location: '',
    reason: '',
    website: '',
    // New fields
    customers: '',
    churnRate: '',
    annualGrowth: '',
    techStack: '',
    competitors: '',
    businessModel: '',
    askingPriceReasoning: '',
    // Admin specific
    sellerId: '',
    status: 'active',
    isFeatured: false,
    requiresNda: true,
    isVerified: false,
    sourceUrl: '', // Admin-only field
  });

  // Check admin auth and load sellers
  useEffect(() => {
    const init = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        router.push('/auth/bf-admin-x9k4m');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/bf-admin-x9k4m');
        return;
      }

      // Check if admin
      const { data: profile } = await (supabase.from('profiles') as any)
        .select('is_admin, role')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin && profile?.role !== 'super_admin') {
        router.push('/auth/bf-admin-x9k4m');
        return;
      }

      setAdminUserId(user.id);

      // Load sellers for dropdown
      const { data: sellersData } = await (supabase.from('profiles') as any)
        .select('id, first_name, last_name, email')
        .eq('is_seller', true)
        .order('email');

      if (sellersData) {
        setSellers(sellersData.map((s: any) => ({
          id: s.id,
          name: `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.email.split('@')[0],
          email: s.email,
        })));
      }
    };

    init();
  }, [router]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Business title is required';
    if (!formData.type) newErrors.type = 'Business type is required';
    if (!formData.askingPrice || parseInt(formData.askingPrice) <= 0) newErrors.askingPrice = 'Asking price is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      if (errors.title || errors.type || errors.description) {
        setActiveTab('basics');
      } else if (errors.askingPrice) {
        setActiveTab('financials');
      }
      return;
    }

    setIsSaving(true);
    const supabase = getSupabaseClient();

    if (!supabase) {
      setIsSaving(false);
      return;
    }

    try {
      const listingData = {
        seller_id: formData.sellerId || adminUserId, // Use selected seller or admin as fallback
        title: formData.title,
        business_type: formData.type,
        asking_price: parseInt(formData.askingPrice) || 0,
        annual_revenue: parseInt(formData.revenue) || 0,
        annual_profit: parseInt(formData.profit) || 0,
        description: formData.description,
        highlights: formData.highlights ? formData.highlights.split('\n').filter(h => h.trim()) : [],
        employee_count: parseInt(formData.employees) || 0,
        year_established: formData.established || null,
        location: formData.location || null,
        reason_for_selling: formData.reason || null,
        website_url: formData.website || null,
        // New fields
        customers: formData.customers || null,
        churn_rate: formData.churnRate || null,
        annual_growth: formData.annualGrowth || null,
        tech_stack: formData.techStack || null,
        competitors: formData.competitors || null,
        business_model: formData.businessModel || null,
        asking_price_reasoning: formData.askingPriceReasoning || null,
        source_url: formData.sourceUrl || null, // Admin-only
        // Admin flags
        status: formData.status,
        is_featured: formData.isFeatured,
        requires_nda: formData.requiresNda,
        is_verified: formData.isVerified,
        published_at: formData.status === 'active' ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase.from('listings') as any).insert(listingData);

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => {
        router.push('/admin/listings');
      }, 1500);
    } catch (error) {
      console.error('Error saving listing:', error);
      alert('Failed to save listing. Please try again.');
    }

    setIsSaving(false);
  };

  const isFormValid = formData.title && formData.type && formData.askingPrice && formData.description;

  return (
    <>
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/listings" className="text-dark-500 hover:text-dark-700">
            <Icon icon="solar:arrow-left-linear" width={20} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-dark-900 tracking-tight">Add New Listing</h1>
            <p className="text-sm text-dark-500">Create a listing as admin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {showSuccess && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
              <Icon icon="solar:check-circle-bold" width={18} />
              <span className="text-sm font-medium">Listing created!</span>
            </div>
          )}
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving || !isFormValid}
          >
            {isSaving ? (
              <>
                <Icon icon="mdi:loading" className="animate-spin" width={18} />
                Saving...
              </>
            ) : (
              <>
                <Icon icon="solar:add-circle-bold" width={18} />
                Create Listing
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-[1200px] mx-auto">
        {/* Admin Notice */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <Icon icon="solar:shield-warning-bold" className="text-amber-600 shrink-0 mt-0.5" width={20} />
          <div>
            <p className="font-medium text-amber-800">Admin Mode</p>
            <p className="text-sm text-amber-700 mt-1">
              You are creating a listing as an admin. You can set the status directly to &quot;Active&quot; to publish immediately,
              or assign it to a seller. The listing will bypass the normal review process.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-dark-100 rounded-xl mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'bg-white text-dark-900 shadow-sm'
                  : 'text-dark-600 hover:text-dark-900'
              )}
            >
              <Icon icon={tab.icon} width={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Basic Info Tab */}
        {activeTab === 'basics' && (
          <div className="space-y-6">
            <Card>
              <h3 className="font-bold text-dark-900 mb-6">Basic Information</h3>
              <div className="space-y-6">
                <Input
                  label="Business Title *"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Profitable SaaS Platform with 1000+ Customers"
                  hint="This is the first thing buyers will see"
                  error={errors.title}
                />
                <Select
                  label="Business Type *"
                  options={businessTypeOptions}
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  error={errors.type}
                />
                <Textarea
                  label="Business Description *"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={6}
                  placeholder="Describe the business, its history, operations, and what makes it unique..."
                  error={errors.description}
                />
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-dark-900 mb-6">Key Highlights</h3>
              <Textarea
                label="Business Highlights"
                value={formData.highlights}
                onChange={(e) => handleChange('highlights', e.target.value)}
                rows={5}
                placeholder="Enter each highlight on a new line, e.g.:
• 95% gross margins
• 2,500+ active customers
• Fully remote team"
                hint="List the key selling points (one per line)"
              />
            </Card>
          </div>
        )}

        {/* Financials Tab */}
        {activeTab === 'financials' && (
          <div className="space-y-6">
            <Card>
              <h3 className="font-bold text-dark-900 mb-6">Financial Information</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Input
                  label="Asking Price *"
                  type="text"
                  value={formData.askingPrice}
                  onChange={(e) => handleChange('askingPrice', e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  icon={<span className="text-dark-400">$</span>}
                  error={errors.askingPrice}
                />
                <Input
                  label="Annual Revenue"
                  type="text"
                  value={formData.revenue}
                  onChange={(e) => handleChange('revenue', e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  icon={<span className="text-dark-400">$</span>}
                />
                <Input
                  label="Annual Profit"
                  type="text"
                  value={formData.profit}
                  onChange={(e) => handleChange('profit', e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  icon={<span className="text-dark-400">$</span>}
                />
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-dark-900 mb-4">Financial Preview</h3>
              <div className="bg-dark-50 rounded-xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-dark-500 mb-1">Asking Price</p>
                    <p className="text-xl font-bold text-dark-900">
                      {formData.askingPrice ? formatCurrency(parseInt(formData.askingPrice)) : '$0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-500 mb-1">Annual Revenue</p>
                    <p className="text-xl font-bold text-dark-900">
                      {formData.revenue ? formatCurrency(parseInt(formData.revenue)) : '$0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-500 mb-1">Annual Profit</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {formData.profit ? formatCurrency(parseInt(formData.profit)) : '$0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-dark-500 mb-1">Multiple</p>
                    <p className="text-xl font-bold text-primary">
                      {parseInt(formData.profit) > 0
                        ? (parseInt(formData.askingPrice) / parseInt(formData.profit)).toFixed(1)
                        : '0'}x
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <Card>
              <h3 className="font-bold text-dark-900 mb-6">Business Details</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Number of Employees"
                  type="number"
                  value={formData.employees}
                  onChange={(e) => handleChange('employees', e.target.value)}
                  placeholder="0"
                />
                <Input
                  label="Year Established"
                  type="text"
                  value={formData.established}
                  onChange={(e) => handleChange('established', e.target.value)}
                  placeholder="e.g., 2020"
                />
                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g., United States"
                />
                <Input
                  label="Website URL"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-dark-900 mb-6">Growth & Metrics</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Input
                  label="Customer Count"
                  value={formData.customers}
                  onChange={(e) => handleChange('customers', e.target.value)}
                  placeholder="e.g., 500+ or 100-500"
                />
                <Input
                  label="Annual Growth Rate"
                  value={formData.annualGrowth}
                  onChange={(e) => handleChange('annualGrowth', e.target.value)}
                  placeholder="e.g., 25%"
                />
                <Input
                  label="Churn Rate"
                  value={formData.churnRate}
                  onChange={(e) => handleChange('churnRate', e.target.value)}
                  placeholder="e.g., 3-5%"
                />
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-dark-900 mb-6">Business Model & Technology</h3>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Business Model"
                    value={formData.businessModel}
                    onChange={(e) => handleChange('businessModel', e.target.value)}
                    placeholder="e.g., B2B SaaS, D2C Subscription"
                  />
                  <Input
                    label="Tech Stack"
                    value={formData.techStack}
                    onChange={(e) => handleChange('techStack', e.target.value)}
                    placeholder="e.g., React, Node.js, AWS"
                  />
                </div>
                <Input
                  label="Competitors"
                  value={formData.competitors}
                  onChange={(e) => handleChange('competitors', e.target.value)}
                  placeholder="e.g., Company A, Company B"
                />
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-dark-900 mb-6">Valuation & Selling</h3>
              <div className="space-y-6">
                <Textarea
                  label="Asking Price Reasoning"
                  value={formData.askingPriceReasoning}
                  onChange={(e) => handleChange('askingPriceReasoning', e.target.value)}
                  rows={4}
                  placeholder="Explain valuation reasoning..."
                />
                <Textarea
                  label="Reason for Selling"
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  rows={3}
                  placeholder="e.g., Focusing on new ventures, retirement, partnership opportunity..."
                />
              </div>
            </Card>
          </div>
        )}

        {/* Admin Settings Tab */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <Card>
              <h3 className="font-bold text-dark-900 mb-6">Admin Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1">Assign to Seller</label>
                  <select
                    value={formData.sellerId}
                    onChange={(e) => handleChange('sellerId', e.target.value)}
                    className="w-full px-4 py-2.5 border border-dark-200 rounded-xl text-dark-900 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">-- Use Admin Account --</option>
                    {sellers.map(seller => (
                      <option key={seller.id} value={seller.id}>
                        {seller.name} ({seller.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-dark-500 mt-1">Leave blank to assign to your admin account</p>
                </div>

                <Select
                  label="Listing Status"
                  options={statusOptions}
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                />
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-6">
                <Icon icon="solar:link-bold" className="text-primary" width={20} />
                <h3 className="font-bold text-dark-900">Source Tracking</h3>
              </div>
              <Input
                label="Source URL"
                value={formData.sourceUrl}
                onChange={(e) => handleChange('sourceUrl', e.target.value)}
                placeholder="https://bizbuysell.com/listing/..."
                hint="Original source of the listing (e.g., from scraped or imported data). Only visible to admins."
              />
            </Card>

            <Card>
              <h3 className="font-bold text-dark-900 mb-6">Listing Flags</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border border-dark-200 rounded-xl cursor-pointer hover:bg-dark-50">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => handleChange('isFeatured', e.target.checked)}
                    className="w-5 h-5 rounded border-dark-300 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:star-bold" className="text-amber-500" width={18} />
                      <span className="font-medium text-dark-900">Featured Listing</span>
                    </div>
                    <p className="text-sm text-dark-500 mt-1">Show this listing prominently on the marketplace</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-dark-200 rounded-xl cursor-pointer hover:bg-dark-50">
                  <input
                    type="checkbox"
                    checked={formData.requiresNda}
                    onChange={(e) => handleChange('requiresNda', e.target.checked)}
                    className="w-5 h-5 rounded border-dark-300 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:lock-bold" className="text-purple-500" width={18} />
                      <span className="font-medium text-dark-900">Requires NDA</span>
                    </div>
                    <p className="text-sm text-dark-500 mt-1">Buyers must sign an NDA to see full details</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-dark-200 rounded-xl cursor-pointer hover:bg-dark-50">
                  <input
                    type="checkbox"
                    checked={formData.isVerified}
                    onChange={(e) => handleChange('isVerified', e.target.checked)}
                    className="w-5 h-5 rounded border-dark-300 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:verified-check-bold" className="text-blue-500" width={18} />
                      <span className="font-medium text-dark-900">Verified Listing</span>
                    </div>
                    <p className="text-sm text-dark-500 mt-1">Mark this listing as verified by BusinessFinder</p>
                  </div>
                </label>
              </div>
            </Card>
          </div>
        )}

        {/* Mobile Save Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-dark-200 p-4">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving || !isFormValid}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Create Listing'}
          </Button>
        </div>
      </main>
    </>
  );
}
