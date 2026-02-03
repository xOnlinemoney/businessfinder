'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select, PhoneInput } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

const accountTypes = [
  {
    value: 'buyer',
    title: "I'm a Buyer",
    description: "I'm looking to acquire a profitable online business.",
    icon: 'solar:bag-3-linear',
    color: 'purple',
  },
  {
    value: 'seller',
    title: "I'm a Seller",
    description: 'I want to sell my online business for the best price.',
    icon: 'solar:shop-linear',
    color: 'emerald',
  },
  {
    value: 'both',
    title: "I'm Both",
    description: 'I want full access to buy and sell businesses.',
    icon: 'solar:refresh-circle-linear',
    color: 'primary',
    popular: true,
  },
];

const niches = [
  { value: 'saas', label: 'SaaS (Software as a Service)', icon: 'solar:code-square-linear' },
  { value: 'ecommerce', label: 'E-commerce / D2C', icon: 'solar:cart-large-2-linear' },
  { value: 'content', label: 'Content / Media / Blog', icon: 'solar:document-text-linear' },
  { value: 'marketplace', label: 'Marketplace', icon: 'solar:shop-2-linear' },
  { value: 'agency', label: 'Agency / Service', icon: 'solar:buildings-linear' },
  { value: 'mobile-app', label: 'Mobile App', icon: 'solar:smartphone-linear' },
  { value: 'newsletter', label: 'Newsletter / Community', icon: 'solar:letter-linear' },
  { value: 'affiliate', label: 'Affiliate Marketing', icon: 'solar:link-linear' },
  { value: 'info-product', label: 'Info Products / Courses', icon: 'solar:graduation-cap-linear' },
  { value: 'other', label: 'Other', icon: 'solar:widget-linear' },
];

const budgetRanges = [
  { value: '0-50000', label: 'Under $50,000', min: 0, max: 50000 },
  { value: '50000-100000', label: '$50,000 - $100,000', min: 50000, max: 100000 },
  { value: '100000-250000', label: '$100,000 - $250,000', min: 100000, max: 250000 },
  { value: '250000-500000', label: '$250,000 - $500,000', min: 250000, max: 500000 },
  { value: '500000-1000000', label: '$500,000 - $1M', min: 500000, max: 1000000 },
  { value: '1000000-5000000', label: '$1M - $5M', min: 1000000, max: 5000000 },
  { value: '5000000+', label: '$5M+', min: 5000000, max: 999999999 },
];

const investorTypes = [
  {
    value: 'individual',
    label: 'Individual Buyer',
    description: 'Purchasing with personal capital',
    icon: 'solar:user-rounded-linear'
  },
  {
    value: 'search_fund',
    label: 'Search Fund',
    description: 'Funded to find and acquire a business',
    icon: 'solar:magnifer-linear'
  },
  {
    value: 'private_equity',
    label: 'Private Equity',
    description: 'PE firm or portfolio company',
    icon: 'solar:chart-linear'
  },
  {
    value: 'hedge_fund',
    label: 'Hedge Fund',
    description: 'Alternative investment fund',
    icon: 'solar:graph-up-linear'
  },
  {
    value: 'family_office',
    label: 'Family Office',
    description: 'Private wealth management firm',
    icon: 'solar:home-2-linear'
  },
  {
    value: 'strategic_buyer',
    label: 'Strategic Buyer',
    description: 'Acquiring for synergy with existing business',
    icon: 'solar:target-linear'
  },
];

const businessModels = [
  { value: 'subscription', label: 'Subscription' },
  { value: 'one-time', label: 'One-time Sales' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'services', label: 'Services' },
  { value: 'hybrid', label: 'Hybrid' },
];

export function OnboardingContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Account type
  const [accountType, setAccountType] = useState<'buyer' | 'seller' | 'both'>('both');

  // Personal info (for all users)
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    phoneCountryCode: '+1',
    bio: '',
    companyName: '',
    linkedinUrl: '',
  });

  // Buyer info
  const [buyerInfo, setBuyerInfo] = useState({
    selectedNiches: [] as string[],
    budgetRange: '',
    investorType: '',
  });

  // Seller info
  const [sellerInfo, setSellerInfo] = useState({
    businessName: '',
    websiteUrl: '',
    category: '',
    businessModel: '',
    description: '',
  });

  // Determine steps based on account type
  const getSteps = () => {
    const steps = [
      { id: 1, title: 'Account Type', description: 'Choose how you want to use the platform' },
      { id: 2, title: 'Your Profile', description: 'Tell us about yourself' },
    ];

    if (accountType === 'buyer' || accountType === 'both') {
      steps.push({ id: steps.length + 1, title: 'Buyer Preferences', description: 'What are you looking for?' });
    }

    if (accountType === 'seller' || accountType === 'both') {
      steps.push({ id: steps.length + 1, title: 'Your Business', description: 'Tell us about your business' });
    }

    steps.push({ id: steps.length + 1, title: 'Review', description: 'Confirm and get started' });

    return steps;
  };

  const steps = getSteps();
  const totalSteps = steps.length;

  // Check for existing user session and load profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          setIsLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/signin?redirect=/onboarding');
          return;
        }

        setUserId(user.id);

        // Load existing profile data
        const { data: profile, error: profileError } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('Onboarding - Loaded profile:', profile);
        if (profileError) {
          console.error('Onboarding - Error loading profile:', profileError);
        }

        if (profile) {
          // Check if onboarding already completed
          if (profile.onboarding_completed) {
            router.push('/dashboard');
            return;
          }

          // First, check sessionStorage for signup data (sticky data from signup form)
          let signupData: any = null;
          try {
            const stored = sessionStorage.getItem('signupData');
            if (stored) {
              signupData = JSON.parse(stored);
              console.log('Onboarding - Found signup data in sessionStorage:', signupData);
            }
          } catch (e) {
            console.error('Error reading signupData from sessionStorage:', e);
          }

          // Pre-fill personal info - prioritize sessionStorage data, then profile data
          let firstName = signupData?.firstName || profile.first_name || '';
          let lastName = signupData?.lastName || profile.last_name || '';
          let phone = signupData?.phone || profile.phone || '';
          let phoneCountryCode = signupData?.phoneCountryCode || profile.phone_country_code || '+1';

          // Fallback: parse from full_name if still empty
          if (!firstName && !lastName && profile.full_name) {
            const nameParts = profile.full_name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }

          console.log('Onboarding - Pre-filling form with:', {
            firstName,
            lastName,
            phone,
            phoneCountryCode,
            source: signupData ? 'sessionStorage' : 'profile'
          });

          setPersonalInfo({
            firstName,
            lastName,
            phone,
            phoneCountryCode,
            bio: profile.bio || '',
            companyName: profile.company_name || '',
            linkedinUrl: profile.linkedin_url || '',
          });

          // Pre-fill account type
          if (profile.is_buyer && profile.is_seller) {
            setAccountType('both');
          } else if (profile.is_buyer) {
            setAccountType('buyer');
          } else if (profile.is_seller) {
            setAccountType('seller');
          }

          // Pre-fill buyer info
          if (profile.interested_categories) {
            setBuyerInfo(prev => ({
              ...prev,
              selectedNiches: profile.interested_categories || [],
              investorType: profile.investor_type || '',
            }));
          }
          if (profile.investment_range_min || profile.investment_range_max) {
            const range = budgetRanges.find(r =>
              r.min === profile.investment_range_min || r.max === profile.investment_range_max
            );
            if (range) {
              setBuyerInfo(prev => ({ ...prev, budgetRange: range.value }));
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [router]);

  const handleSaveAndExit = async () => {
    setIsSaving(true);
    try {
      await saveProgress(false);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveProgress = async (completed: boolean = false) => {
    const supabase = getSupabaseClient();
    if (!supabase || !userId) return;

    // Find budget range values
    const selectedBudget = budgetRanges.find(b => b.value === buyerInfo.budgetRange);

    const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
    const profileData: any = {
      first_name: personalInfo.firstName || null,
      last_name: personalInfo.lastName || null,
      full_name: fullName || null,
      phone: personalInfo.phone || null,
      phone_country_code: personalInfo.phoneCountryCode || null,
      bio: personalInfo.bio || null,
      company_name: personalInfo.companyName || null,
      linkedin_url: personalInfo.linkedinUrl || null,
      is_buyer: accountType === 'buyer' || accountType === 'both',
      is_seller: accountType === 'seller' || accountType === 'both',
      updated_at: new Date().toISOString(),
    };

    // Add buyer-specific fields
    if (accountType === 'buyer' || accountType === 'both') {
      profileData.interested_categories = buyerInfo.selectedNiches.length > 0 ? buyerInfo.selectedNiches : null;
      profileData.investment_range_min = selectedBudget?.min || null;
      profileData.investment_range_max = selectedBudget?.max || null;
      profileData.investor_type = buyerInfo.investorType || null;
    }

    // Mark as completed if finishing onboarding
    if (completed) {
      profileData.onboarding_completed = true;
    }

    console.log('Saving profile data:', profileData);

    const { data, error } = await (supabase.from('profiles') as any)
      .update(profileData)
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Error saving profile:', error);
      throw error;
    }

    console.log('Profile saved successfully:', data);

    // Clear signup data from sessionStorage since it's now saved to DB
    try {
      sessionStorage.removeItem('signupData');
    } catch (e) {
      // Ignore sessionStorage errors
    }

    // If seller, we could also create a draft listing here
    if ((accountType === 'seller' || accountType === 'both') && completed && sellerInfo.businessName) {
      // Create draft listing
      await (supabase.from('listings') as any)
        .insert({
          seller_id: userId,
          title: sellerInfo.businessName,
          business_type: sellerInfo.category || 'other',
          asking_price: 0,
          description: sellerInfo.description || null,
          status: 'draft',
        });
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await saveProgress(true);
      console.log('Onboarding completed successfully, redirecting to dashboard...');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('There was an error saving your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNiche = (value: string) => {
    setBuyerInfo(prev => ({
      ...prev,
      selectedNiches: prev.selectedNiches.includes(value)
        ? prev.selectedNiches.filter(n => n !== value)
        : [...prev.selectedNiches, value]
    }));
  };

  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  // Determine which content to show based on current step
  const getStepContent = () => {
    if (currentStep === 1) return 'account-type';
    if (currentStep === 2) return 'personal-info';

    const isBuyer = accountType === 'buyer' || accountType === 'both';
    const isSeller = accountType === 'seller' || accountType === 'both';

    if (accountType === 'buyer') {
      if (currentStep === 3) return 'buyer-preferences';
      if (currentStep === 4) return 'review';
    } else if (accountType === 'seller') {
      if (currentStep === 3) return 'seller-business';
      if (currentStep === 4) return 'review';
    } else {
      // both
      if (currentStep === 3) return 'buyer-preferences';
      if (currentStep === 4) return 'seller-business';
      if (currentStep === 5) return 'review';
    }

    return 'review';
  };

  const stepContent = getStepContent();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-dark-200 sticky top-0 z-50 flex items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <Icon icon="solar:graph-up-linear" width={18} />
          </div>
          <span className="font-semibold text-dark-900 tracking-tight">BusinessFinder</span>
        </Link>
        <button
          onClick={handleSaveAndExit}
          disabled={isSaving}
          className="text-sm font-medium text-dark-500 hover:text-dark-900 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save & Exit'}
        </button>
      </header>

      {/* Progress Bar */}
      {currentStep > 1 && (
        <div className="bg-white border-b border-dark-200">
          <div className="max-w-3xl mx-auto px-4 md:px-0 py-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
                Step {currentStep} of {totalSteps} · {steps[currentStep - 1]?.title}
              </span>
              <span className="text-xs font-medium text-dark-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-dark-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Step 1: Account Type */}
        {stepContent === 'account-type' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-dark-900 mb-3 tracking-tight">
                Welcome to BusinessFinder
              </h1>
              <p className="text-dark-500 text-lg">How do you plan to use the platform today?</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {accountTypes.map((type) => (
                <label key={type.value} className="relative group cursor-pointer">
                  <input
                    type="radio"
                    name="account_type"
                    value={type.value}
                    checked={accountType === type.value}
                    onChange={(e) => setAccountType(e.target.value as typeof accountType)}
                    className="peer sr-only"
                  />
                  {type.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide z-10">
                      Most Popular
                    </div>
                  )}
                  <div
                    className={cn(
                      'h-full p-6 bg-white border-2 rounded-2xl transition-all flex flex-col items-center text-center',
                      'border-dark-200 hover:border-primary/50',
                      'peer-checked:border-primary peer-checked:bg-primary/5'
                    )}
                  >
                    <div
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center mb-4',
                        type.color === 'purple' && 'bg-purple-100 text-purple-600',
                        type.color === 'emerald' && 'bg-emerald-100 text-emerald-600',
                        type.color === 'primary' && 'bg-primary/10 text-primary'
                      )}
                    >
                      <Icon icon={type.icon} width={28} />
                    </div>
                    <h3 className="font-bold text-dark-900 text-lg mb-2">{type.title}</h3>
                    <p className="text-sm text-dark-500 leading-relaxed">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Button onClick={handleNext} size="lg" rightIcon={<Icon icon="solar:arrow-right-linear" width={16} />}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Personal Info */}
        {stepContent === 'personal-info' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold text-dark-900 mb-1">Your Profile</h2>
            <p className="text-dark-500 text-sm mb-8">Tell us a bit about yourself so sellers and buyers know who they're dealing with.</p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name *"
                  placeholder="John"
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                />
                <Input
                  label="Last Name *"
                  placeholder="Smith"
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                />
              </div>

              <PhoneInput
                label="Phone Number"
                value={personalInfo.phone}
                countryCode={personalInfo.phoneCountryCode}
                onValueChange={(phone) => setPersonalInfo({ ...personalInfo, phone })}
                onCountryCodeChange={(code) => setPersonalInfo({ ...personalInfo, phoneCountryCode: code })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Company Name"
                  placeholder="Acme Capital (if applicable)"
                  value={personalInfo.companyName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, companyName: e.target.value })}
                />
                <Input
                  label="LinkedIn Profile"
                  placeholder="linkedin.com/in/yourprofile"
                  value={personalInfo.linkedinUrl}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, linkedinUrl: e.target.value })}
                />
              </div>

              <Textarea
                label="Short Bio"
                rows={4}
                placeholder="Tell us about your background, experience, and what you're looking for..."
                hint="Optional - This helps build trust with other users"
                value={personalInfo.bio}
                onChange={(e) => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
              />
            </div>

            <div className="mt-10 flex justify-between">
              <Button variant="ghost" onClick={handleBack} leftIcon={<Icon icon="solar:arrow-left-linear" width={16} />}>
                Back
              </Button>
              <Button onClick={handleNext} rightIcon={<Icon icon="solar:arrow-right-linear" width={16} />}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Buyer Preferences */}
        {stepContent === 'buyer-preferences' && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold text-dark-900 mb-1">Buyer Preferences</h2>
            <p className="text-dark-500 text-sm mb-8">Help us understand what you're looking for so we can show you the best opportunities.</p>

            <div className="space-y-8">
              {/* Niches */}
              <div>
                <label className="block text-sm font-semibold text-dark-900 mb-3">
                  What niches interest you? <span className="text-dark-400 font-normal">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {niches.map((niche) => (
                    <button
                      key={niche.value}
                      type="button"
                      onClick={() => toggleNiche(niche.value)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-center',
                        buyerInfo.selectedNiches.includes(niche.value)
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-dark-200 bg-white hover:border-primary/50 text-dark-600'
                      )}
                    >
                      <Icon icon={niche.icon} className="mx-auto mb-2" width={24} />
                      <span className="text-xs font-medium block">{niche.label.split(' / ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-semibold text-dark-900 mb-3">
                  What's your acquisition budget?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {budgetRanges.map((range) => (
                    <button
                      key={range.value}
                      type="button"
                      onClick={() => setBuyerInfo({ ...buyerInfo, budgetRange: range.value })}
                      className={cn(
                        'px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium',
                        buyerInfo.budgetRange === range.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-dark-200 bg-white hover:border-primary/50 text-dark-600'
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Investor Type */}
              <div>
                <label className="block text-sm font-semibold text-dark-900 mb-3">
                  What type of buyer are you?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {investorTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setBuyerInfo({ ...buyerInfo, investorType: type.value })}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all text-left',
                        buyerInfo.investorType === type.value
                          ? 'border-primary bg-primary/5'
                          : 'border-dark-200 bg-white hover:border-primary/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                          buyerInfo.investorType === type.value ? 'bg-primary/10 text-primary' : 'bg-dark-100 text-dark-500'
                        )}>
                          <Icon icon={type.icon} width={20} />
                        </div>
                        <div>
                          <p className={cn(
                            'font-semibold text-sm',
                            buyerInfo.investorType === type.value ? 'text-primary' : 'text-dark-900'
                          )}>{type.label}</p>
                          <p className="text-xs text-dark-500 mt-0.5">{type.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-between">
              <Button variant="ghost" onClick={handleBack} leftIcon={<Icon icon="solar:arrow-left-linear" width={16} />}>
                Back
              </Button>
              <Button onClick={handleNext} rightIcon={<Icon icon="solar:arrow-right-linear" width={16} />}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Seller Business Info */}
        {stepContent === 'seller-business' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold text-dark-900 mb-1">Your Business</h2>
            <p className="text-dark-500 text-sm mb-8">Tell us about the business you want to sell. You can add more details later.</p>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Business/Brand Name *"
                  placeholder="e.g., TechStartup Pro"
                  value={sellerInfo.businessName}
                  onChange={(e) => setSellerInfo({ ...sellerInfo, businessName: e.target.value })}
                />
                <Input
                  label="Website URL"
                  placeholder="www.yourbusiness.com"
                  value={sellerInfo.websiteUrl}
                  onChange={(e) => setSellerInfo({ ...sellerInfo, websiteUrl: e.target.value })}
                />
              </div>

              <Select
                label="Business Category *"
                options={niches.map(n => ({ value: n.value, label: n.label }))}
                placeholder="Select a category..."
                value={sellerInfo.category}
                onChange={(e) => setSellerInfo({ ...sellerInfo, category: e.target.value })}
              />

              <Select
                label="Business Model"
                options={businessModels}
                placeholder="Select a model..."
                value={sellerInfo.businessModel}
                onChange={(e) => setSellerInfo({ ...sellerInfo, businessModel: e.target.value })}
              />

              <Textarea
                label="Brief Description"
                rows={4}
                placeholder="Describe your business, what makes it unique, and why it's a great opportunity..."
                hint="Min 100 characters recommended"
                value={sellerInfo.description}
                onChange={(e) => setSellerInfo({ ...sellerInfo, description: e.target.value })}
              />
            </div>

            <div className="mt-10 flex justify-between">
              <Button variant="ghost" onClick={handleBack} leftIcon={<Icon icon="solar:arrow-left-linear" width={16} />}>
                Back
              </Button>
              <Button onClick={handleNext} rightIcon={<Icon icon="solar:arrow-right-linear" width={16} />}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Review */}
        {stepContent === 'review' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={48} />
              </div>
              <h2 className="text-2xl font-bold text-dark-900 mb-2">You're All Set!</h2>
              <p className="text-dark-500">
                Here's a summary of your profile. You can always update this later.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="space-y-4 mb-8">
              {/* Account Type */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon icon={accountTypes.find(t => t.value === accountType)?.icon || ''} className="text-primary" width={20} />
                    </div>
                    <div>
                      <p className="text-xs text-dark-400 font-medium">Account Type</p>
                      <p className="font-semibold text-dark-900">
                        {accountType === 'both' ? 'Buyer & Seller' : accountType === 'buyer' ? 'Buyer' : 'Seller'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Personal Info */}
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon icon="solar:user-rounded-linear" className="text-blue-600" width={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-dark-400 font-medium">Profile</p>
                    <p className="font-semibold text-dark-900">
                      {personalInfo.firstName || personalInfo.lastName
                        ? `${personalInfo.firstName} ${personalInfo.lastName}`.trim()
                        : 'Not provided'}
                    </p>
                    {personalInfo.phone && (
                      <p className="text-sm text-dark-500">{personalInfo.phoneCountryCode} {personalInfo.phone}</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Buyer Preferences */}
              {(accountType === 'buyer' || accountType === 'both') && (
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Icon icon="solar:bag-3-linear" className="text-purple-600" width={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-dark-400 font-medium">Buyer Preferences</p>
                      <p className="font-semibold text-dark-900">
                        {buyerInfo.selectedNiches.length} {buyerInfo.selectedNiches.length === 1 ? 'niche' : 'niches'} selected
                      </p>
                      {buyerInfo.budgetRange && (
                        <p className="text-sm text-dark-500">
                          Budget: {budgetRanges.find(b => b.value === buyerInfo.budgetRange)?.label}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Seller Business */}
              {(accountType === 'seller' || accountType === 'both') && sellerInfo.businessName && (
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Icon icon="solar:shop-linear" className="text-emerald-600" width={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-dark-400 font-medium">Your Business</p>
                      <p className="font-semibold text-dark-900">{sellerInfo.businessName}</p>
                      {sellerInfo.category && (
                        <p className="text-sm text-dark-500">
                          {niches.find(n => n.value === sellerInfo.category)?.label}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <Card className="mb-8">
              <h3 className="font-bold text-dark-900 mb-4">What happens next?</h3>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <div>
                    <p className="font-medium text-dark-900">Explore the Marketplace</p>
                    <p className="text-sm text-dark-500">Browse verified businesses and connect with buyers/sellers.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <div>
                    <p className="font-medium text-dark-900">Complete Your Profile</p>
                    <p className="text-sm text-dark-500">Add more details to increase your credibility.</p>
                  </div>
                </li>
                {(accountType === 'seller' || accountType === 'both') && (
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                    <div>
                      <p className="font-medium text-dark-900">Create Your Listing</p>
                      <p className="text-sm text-dark-500">Add financials, metrics, and documentation for your business.</p>
                    </div>
                  </li>
                )}
              </ol>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={handleBack}>
                Edit Details
              </Button>
              <Button
                size="lg"
                leftIcon={<Icon icon="solar:check-circle-linear" width={20} />}
                onClick={handleComplete}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Get Started'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default OnboardingContent;
