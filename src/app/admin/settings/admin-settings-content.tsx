'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

export function AdminSettingsContent() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    siteName: 'BusinessFinder',
    siteEmail: 'contact@businessfinder.com',
    supportEmail: 'support@businessfinder.com',
    timezone: 'America/New_York',
    currency: 'USD',
    commissionRate: '5',
    minListingPrice: '10000',
    maxListingPrice: '50000000',
    requireVerification: true,
    allowGuestBrowsing: true,
    enableNotifications: true,
    maintenanceMode: false,
  });

  const tabs = [
    { id: 'general', label: 'General', icon: 'mdi:cog' },
    { id: 'listings', label: 'Listings', icon: 'mdi:clipboard-list' },
    { id: 'payments', label: 'Payments', icon: 'mdi:credit-card' },
    { id: 'email', label: 'Email', icon: 'mdi:email' },
    { id: 'security', label: 'Security', icon: 'mdi:shield' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleConfigure2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleEditTemplates = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const resetModal = () => {
    setIsSubmitted(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-dark">Platform Settings</h1>
              <p className="text-gray-600 mt-1">Configure your marketplace settings</p>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Icon icon="mdi:loading" className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Icon icon="mdi:content-save" className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Tabs */}
            <div className="w-48 flex-shrink-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon icon={tab.icon} className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Settings Content */}
            <div className="flex-1">
              {activeTab === 'general' && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-dark mb-6">General Settings</h2>
                  <div className="space-y-6">
                    <Input
                      label="Site Name"
                      value={settings.siteName}
                      onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    />
                    <Input
                      label="Contact Email"
                      type="email"
                      value={settings.siteEmail}
                      onChange={(e) => setSettings(prev => ({ ...prev, siteEmail: e.target.value }))}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between py-3 border-t">
                      <div>
                        <p className="font-medium text-dark">Maintenance Mode</p>
                        <p className="text-sm text-gray-500">Temporarily disable the site for maintenance</p>
                      </div>
                      <button
                        onClick={() => handleToggle('maintenanceMode')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.maintenanceMode ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.maintenanceMode ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'listings' && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-dark mb-6">Listing Settings</h2>
                  <div className="space-y-6">
                    <Input
                      label="Minimum Listing Price ($)"
                      type="number"
                      value={settings.minListingPrice}
                      onChange={(e) => setSettings(prev => ({ ...prev, minListingPrice: e.target.value }))}
                    />
                    <Input
                      label="Maximum Listing Price ($)"
                      type="number"
                      value={settings.maxListingPrice}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxListingPrice: e.target.value }))}
                    />
                    <div className="flex items-center justify-between py-3 border-t">
                      <div>
                        <p className="font-medium text-dark">Require Seller Verification</p>
                        <p className="text-sm text-gray-500">Sellers must verify identity before listing</p>
                      </div>
                      <button
                        onClick={() => handleToggle('requireVerification')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.requireVerification ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.requireVerification ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-3 border-t">
                      <div>
                        <p className="font-medium text-dark">Allow Guest Browsing</p>
                        <p className="text-sm text-gray-500">Let visitors browse listings without signing up</p>
                      </div>
                      <button
                        onClick={() => handleToggle('allowGuestBrowsing')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.allowGuestBrowsing ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.allowGuestBrowsing ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'payments' && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-dark mb-6">Payment Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select
                        value={settings.currency}
                        onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                      </select>
                    </div>
                    <Input
                      label="Commission Rate (%)"
                      type="number"
                      value={settings.commissionRate}
                      onChange={(e) => setSettings(prev => ({ ...prev, commissionRate: e.target.value }))}
                    />
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-dark mb-2">Payment Gateway</h3>
                      <p className="text-sm text-gray-500 mb-4">Connect your payment processor</p>
                      <div className="flex gap-3">
                        <Button variant="secondary" size="sm">
                          <Icon icon="mdi:credit-card" className="w-4 h-4 mr-2" />
                          Stripe
                        </Button>
                        <Button variant="secondary" size="sm">
                          <Icon icon="mdi:paypal" className="w-4 h-4 mr-2" />
                          PayPal
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'email' && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-dark mb-6">Email Settings</h2>
                  <div className="space-y-6">
                    <Input
                      label="Support Email"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                    />
                    <div className="flex items-center justify-between py-3 border-t">
                      <div>
                        <p className="font-medium text-dark">Email Notifications</p>
                        <p className="text-sm text-gray-500">Send email notifications for important events</p>
                      </div>
                      <button
                        onClick={() => handleToggle('enableNotifications')}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.enableNotifications ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            settings.enableNotifications ? 'left-7' : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-dark mb-2">Email Templates</h3>
                      <p className="text-sm text-gray-500 mb-4">Customize email templates</p>
                      <Button variant="secondary" size="sm" onClick={() => { setShowTemplatesModal(true); resetModal(); }}>
                        <Icon icon="mdi:pencil" className="w-4 h-4 mr-2" />
                        Edit Templates
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'security' && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-dark mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon icon="mdi:shield-check" className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">SSL Certificate Active</p>
                          <p className="text-sm text-green-600">Your site is secured with HTTPS</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-t">
                      <div>
                        <p className="font-medium text-dark">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => { setShow2FAModal(true); resetModal(); }}>Configure</Button>
                    </div>
                    <div className="flex items-center justify-between py-3 border-t">
                      <div>
                        <p className="font-medium text-dark">Session Timeout</p>
                        <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                      </div>
                      <select className="px-3 py-1 border border-gray-200 rounded-lg text-sm">
                        <option>15 minutes</option>
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>4 hours</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between py-3 border-t">
                      <div>
                        <p className="font-medium text-dark">Login Attempts</p>
                        <p className="text-sm text-gray-500">Max failed attempts before lockout</p>
                      </div>
                      <select className="px-3 py-1 border border-gray-200 rounded-lg text-sm">
                        <option>3 attempts</option>
                        <option>5 attempts</option>
                        <option>10 attempts</option>
                      </select>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 2FA Configuration Modal */}
      <Modal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        title="Configure Two-Factor Authentication"
      >
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="mdi:shield-check" className="text-emerald-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-2">2FA Configured!</h3>
            <p className="text-gray-600 mb-6">Two-factor authentication has been successfully configured for admin accounts.</p>
            <Button onClick={() => setShow2FAModal(false)}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleConfigure2FA} className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-dark mb-2">Authentication Methods</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-primary" defaultChecked />
                  <span className="text-sm text-gray-700">Authenticator App (TOTP)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-primary" />
                  <span className="text-sm text-gray-700">SMS Verification</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-primary" />
                  <span className="text-sm text-gray-700">Email Verification</span>
                </label>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-dark mb-2">Enforcement</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="enforcement" className="w-4 h-4 text-primary" defaultChecked />
                  <span className="text-sm text-gray-700">Required for all admins</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="enforcement" className="w-4 h-4 text-primary" />
                  <span className="text-sm text-gray-700">Optional (recommended)</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setShow2FAModal(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Email Templates Modal */}
      <Modal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        title="Email Templates"
      >
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="mdi:email-check" className="text-emerald-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-2">Templates Updated!</h3>
            <p className="text-gray-600 mb-6">Your email templates have been successfully saved.</p>
            <Button onClick={() => setShowTemplatesModal(false)}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleEditTemplates} className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark">Welcome Email</p>
                    <p className="text-sm text-gray-500">Sent when a new user signs up</p>
                  </div>
                  <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark">Listing Approved</p>
                    <p className="text-sm text-gray-500">Sent when a listing is approved</p>
                  </div>
                  <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark">New Offer Received</p>
                    <p className="text-sm text-gray-500">Sent when a seller receives an offer</p>
                  </div>
                  <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-dark">Transaction Complete</p>
                    <p className="text-sm text-gray-500">Sent when a deal closes</p>
                  </div>
                  <Icon icon="mdi:chevron-right" className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowTemplatesModal(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
