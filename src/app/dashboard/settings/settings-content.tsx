'use client';

import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select, PhoneInput } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase/client';

const tabs = [
  { id: 'profile', label: 'Profile', icon: 'solar:user-linear' },
  { id: 'security', label: 'Security', icon: 'solar:shield-check-linear' },
  { id: 'notifications', label: 'Notifications', icon: 'solar:bell-linear' },
  { id: 'billing', label: 'Billing', icon: 'solar:card-linear' },
  { id: 'privacy', label: 'Privacy', icon: 'solar:lock-linear' },
];

const planOptions = [
  { value: '', label: 'Select a plan' },
  { value: 'free', label: 'Free - Basic features' },
  { value: 'pro', label: 'Pro - $99/month' },
  { value: 'enterprise', label: 'Enterprise - Contact us' },
];

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
  bio: string;
  avatarUrl: string;
}

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phoneCountryCode: '+1',
    bio: '',
    avatarUrl: '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    'New inquiries on your listings': true,
    'New offers received': true,
    'Messages from buyers/sellers': true,
    'Listing status updates': false,
    'Weekly summary reports': true,
    'Marketing and promotions': false,
  });
  const [privacySettings, setPrivacySettings] = useState({
    'Show my profile to other users': true,
    'Allow sellers to contact me': true,
    'Show my saved listings to advisors': false,
  });

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form states
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [paymentData, setPaymentData] = useState({ cardNumber: '', expiry: '', cvv: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        // Demo mode - show empty form
        return;
      }

      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await (supabase.from('profiles') as any)
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('Settings profile data:', { profile, error });

        if (error) throw error;

        if (profile) {
          // Parse first/last name from full_name if not available
          let firstName = profile.first_name || '';
          let lastName = profile.last_name || '';
          if (!firstName && !lastName && profile.full_name) {
            const nameParts = profile.full_name.split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
          }

          setProfileData({
            firstName,
            lastName,
            email: profile.email || user.email || '',
            phone: profile.phone || '',
            phoneCountryCode: profile.phone_country_code || '+1',
            bio: profile.bio || '',
            avatarUrl: profile.avatar_url || '',
          });

          // Load notification and privacy settings if stored
          if (profile.notification_settings) {
            setNotificationSettings(profile.notification_settings);
          }
          if (profile.privacy_settings) {
            setPrivacySettings(profile.privacy_settings);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
        await (supabase.from('profiles') as any)
          .update({
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            full_name: fullName,
            phone: profileData.phone,
            phone_country_code: profileData.phoneCountryCode,
            bio: profileData.bio,
            email_notifications: notificationSettings['New inquiries on your listings'] || notificationSettings['New offers received'],
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    } else {
      // Demo mode - simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }

    setIsSaving(false);
  };

  const toggleNotification = (label: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [label]: !prev[label as keyof typeof prev],
    }));
  };

  const togglePrivacy = (label: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [label]: !prev[label as keyof typeof prev],
    }));
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // In a real implementation, you would upload to storage
        console.log('File selected:', file.name);
        alert('Profile picture uploaded: ' + file.name);
      }
    };
    input.click();
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      alert('Passwords do not match');
      return;
    }
    setIsSubmitting(true);

    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: passwordData.new
        });

        if (error) throw error;
      } catch (error) {
        console.error('Error updating password:', error);
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleEnable2FA = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setPaymentData({ cardNumber: '', expiry: '', cvv: '' });
  };

  const resetModals = () => {
    setIsSubmitted(false);
    setPasswordData({ current: '', new: '', confirm: '' });
    setPaymentData({ cardNumber: '', expiry: '', cvv: '' });
  };

  const avatarUrl = profileData.avatarUrl ||
    `https://ui-avatars.com/api/?name=${profileData.firstName}+${profileData.lastName}&background=0066FF&color=fff&size=128`;

  return (
    <>
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <h1 className="text-lg font-bold text-dark-900 tracking-tight">Settings</h1>
        {saveSuccess && (
          <span className="text-sm text-emerald-600 flex items-center gap-1">
            <Icon icon="solar:check-circle-bold" width={18} />
            Changes saved
          </span>
        )}
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
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

        {isLoading ? (
          <div className="space-y-6">
            <Card className="animate-pulse">
              <div className="h-24 bg-dark-100 rounded-lg" />
            </Card>
            <Card className="animate-pulse">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="h-12 bg-dark-100 rounded" />
                <div className="h-12 bg-dark-100 rounded" />
              </div>
            </Card>
          </div>
        ) : (
          <>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Picture */}
                <Card>
                  <h3 className="font-bold text-dark-900 mb-4">Profile Picture</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-24 h-24 rounded-full"
                      />
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                        <Icon icon="solar:camera-linear" width={16} />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm text-dark-600 mb-2">Upload a new profile picture</p>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={handleImageUpload}>Upload Image</Button>
                        <Button variant="ghost" size="sm" onClick={() => setProfileData({ ...profileData, avatarUrl: '' })}>Remove</Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Personal Information */}
                <Card>
                  <h3 className="font-bold text-dark-900 mb-4">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    />
                    <Input
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={profileData.email}
                      disabled
                      hint="Email cannot be changed"
                    />
                    <PhoneInput
                      label="Phone"
                      value={profileData.phone}
                      countryCode={profileData.phoneCountryCode}
                      onValueChange={(phone) => setProfileData({ ...profileData, phone })}
                      onCountryCodeChange={(code) => setProfileData({ ...profileData, phoneCountryCode: code })}
                    />
                  </div>
                </Card>

                {/* Bio */}
                <Card>
                  <h3 className="font-bold text-dark-900 mb-4">Bio</h3>
                  <Textarea
                    label="About You"
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    hint="Brief description for your public profile"
                  />
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button onClick={handleSave} isLoading={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card>
                  <h3 className="font-bold text-dark-900 mb-4">Change Password</h3>
                  <div className="space-y-4 max-w-md">
                    <Input label="Current Password" type="password" />
                    <Input label="New Password" type="password" />
                    <Input label="Confirm New Password" type="password" />
                    <Button onClick={() => { setShowPasswordModal(true); setIsSubmitted(false); }}>Update Password</Button>
                  </div>
                </Card>

                <Card>
                  <h3 className="font-bold text-dark-900 mb-4">Two-Factor Authentication</h3>
                  <p className="text-sm text-dark-600 mb-4">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <Button variant="secondary" onClick={() => { setShow2FAModal(true); setIsSubmitted(false); }}>
                    <Icon icon="solar:shield-check-linear" width={18} />
                    Enable 2FA
                  </Button>
                </Card>

                <Card>
                  <h3 className="font-bold text-dark-900 mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-dark-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon icon="solar:laptop-linear" className="text-dark-500" width={24} />
                        <div>
                          <p className="text-sm font-medium text-dark-900">Current Session</p>
                          <p className="text-xs text-dark-500">Active now</p>
                        </div>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <Card>
                  <h3 className="font-bold text-dark-900 mb-6">Email Notifications</h3>
                  <div className="space-y-4">
                    {Object.entries(notificationSettings).map(([label, enabled]) => (
                      <div key={label} className="flex items-center justify-between py-2">
                        <span className="text-sm text-dark-700">{label}</span>
                        <button
                          onClick={() => toggleNotification(label)}
                          className={cn(
                            'w-11 h-6 rounded-full transition-colors relative',
                            enabled ? 'bg-primary' : 'bg-dark-300'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                              enabled ? 'right-1' : 'left-1'
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
                <div className="flex justify-end">
                  <Button onClick={handleSave} isLoading={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <Card>
                  <h3 className="font-bold text-dark-900 mb-4">Current Plan</h3>
                  <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <div>
                      <p className="font-bold text-dark-900">Pro Plan</p>
                      <p className="text-sm text-dark-600">$99/month • Unlimited listings</p>
                    </div>
                    <Button variant="secondary" onClick={() => { setShowPlanModal(true); setIsSubmitted(false); }}>Manage Plan</Button>
                  </div>
                </Card>

                <Card>
                  <h3 className="font-bold text-dark-900 mb-4">Payment Method</h3>
                  <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-dark-800 rounded flex items-center justify-center">
                        <Icon icon="logos:visa" width={32} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dark-900">Visa ending in 4242</p>
                        <p className="text-xs text-dark-500">Expires 12/2025</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setShowPaymentModal(true); setIsSubmitted(false); }}>Edit</Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <Card>
                  <h3 className="font-bold text-dark-900 mb-4">Profile Visibility</h3>
                  <div className="space-y-4">
                    {Object.entries(privacySettings).map(([label, enabled]) => (
                      <div key={label} className="flex items-center justify-between py-2">
                        <span className="text-sm text-dark-700">{label}</span>
                        <button
                          onClick={() => togglePrivacy(label)}
                          className={cn(
                            'w-11 h-6 rounded-full transition-colors relative',
                            enabled ? 'bg-primary' : 'bg-dark-300'
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                              enabled ? 'right-1' : 'left-1'
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h3 className="font-bold text-dark-900 mb-4">Data & Account</h3>
                  <div className="space-y-3">
                    <Button variant="secondary">
                      <Icon icon="solar:download-linear" width={18} />
                      Download My Data
                    </Button>
                    <Button variant="ghost" className="text-red-600 hover:bg-red-50">
                      <Icon icon="solar:trash-bin-trash-linear" width={18} />
                      Delete Account
                    </Button>
                  </div>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleSave} isLoading={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => { setShowPasswordModal(false); resetModals(); }}
        title="Update Password"
      >
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={32} />
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-2">Password Updated!</h3>
            <p className="text-dark-600 mb-6">Your password has been successfully changed.</p>
            <Button variant="primary" onClick={() => { setShowPasswordModal(false); resetModals(); }}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwordData.current}
              onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
              required
            />
            <Input
              label="New Password"
              type="password"
              value={passwordData.new}
              onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.confirm}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
              required
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowPasswordModal(false); resetModals(); }}>Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 2FA Modal */}
      <Modal
        isOpen={show2FAModal}
        onClose={() => { setShow2FAModal(false); resetModals(); }}
        title="Enable Two-Factor Authentication"
      >
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:shield-check-bold" className="text-emerald-600" width={32} />
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-2">2FA Enabled!</h3>
            <p className="text-dark-600 mb-6">Your account is now protected with two-factor authentication.</p>
            <Button variant="primary" onClick={() => { setShow2FAModal(false); resetModals(); }}>Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-dark-600">Scan this QR code with your authenticator app:</p>
            <div className="bg-dark-100 rounded-lg p-8 flex items-center justify-center">
              <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center">
                <Icon icon="mdi:qrcode" className="text-dark-800" width={100} />
              </div>
            </div>
            <Input label="Enter verification code" placeholder="000000" />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShow2FAModal(false); resetModals(); }}>Cancel</Button>
              <Button variant="primary" className="flex-1" onClick={handleEnable2FA} isLoading={isSubmitting}>
                {isSubmitting ? 'Enabling...' : 'Enable 2FA'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Plan Modal */}
      <Modal
        isOpen={showPlanModal}
        onClose={() => { setShowPlanModal(false); resetModals(); }}
        title="Manage Your Plan"
      >
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={32} />
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-2">Plan Updated!</h3>
            <p className="text-dark-600 mb-6">Your subscription has been updated successfully.</p>
            <Button variant="primary" onClick={() => { setShowPlanModal(false); resetModals(); }}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleUpdatePlan} className="space-y-4">
            <Select
              label="Select Plan"
              options={planOptions}
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
            />
            <div className="bg-dark-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-dark-600">Current plan:</span>
                <span className="font-medium">Pro - $99/month</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-600">Next billing:</span>
                <span className="font-medium">Feb 1, 2026</span>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowPlanModal(false); resetModals(); }}>Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Plan'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); resetModals(); }}
        title="Update Payment Method"
      >
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={32} />
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-2">Payment Updated!</h3>
            <p className="text-dark-600 mb-6">Your payment method has been updated successfully.</p>
            <Button variant="primary" onClick={() => { setShowPaymentModal(false); resetModals(); }}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleUpdatePayment} className="space-y-4">
            <Input
              label="Card Number"
              placeholder="4242 4242 4242 4242"
              value={paymentData.cardNumber}
              onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                placeholder="MM/YY"
                value={paymentData.expiry}
                onChange={(e) => setPaymentData(prev => ({ ...prev, expiry: e.target.value }))}
                required
              />
              <Input
                label="CVV"
                placeholder="123"
                value={paymentData.cvv}
                onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowPaymentModal(false); resetModals(); }}>Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Card'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}

export default SettingsContent;
