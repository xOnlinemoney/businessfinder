'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input, Textarea, Select } from '@/components/ui/input';

const benefits = [
  { icon: 'mdi:currency-usd', title: 'Competitive Salary', description: 'Top-of-market compensation packages' },
  { icon: 'mdi:chart-line', title: 'Equity', description: 'Share in our success with stock options' },
  { icon: 'mdi:hospital-building', title: 'Health Insurance', description: '100% covered medical, dental, and vision' },
  { icon: 'mdi:palm-tree', title: 'Unlimited PTO', description: 'Take the time you need to recharge' },
  { icon: 'mdi:home', title: 'Remote First', description: 'Work from anywhere in the world' },
  { icon: 'mdi:school', title: 'Learning Budget', description: '$2,000 annual learning & development budget' },
];

const openings = [
  {
    id: 1,
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build and scale our marketplace platform using React, Node.js, and PostgreSQL.',
  },
  {
    id: 2,
    title: 'Product Manager',
    department: 'Product',
    location: 'Remote',
    type: 'Full-time',
    description: 'Lead product strategy and roadmap for our buyer experience.',
  },
  {
    id: 3,
    title: 'Business Development Representative',
    department: 'Sales',
    location: 'Remote (US)',
    type: 'Full-time',
    description: 'Connect with business owners interested in selling their companies.',
  },
  {
    id: 4,
    title: 'M&A Advisor',
    department: 'Advisory',
    location: 'Remote',
    type: 'Full-time',
    description: 'Guide buyers and sellers through the acquisition process.',
  },
  {
    id: 5,
    title: 'Content Marketing Manager',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    description: 'Create compelling content that educates and attracts our audience.',
  },
  {
    id: 6,
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote',
    type: 'Full-time',
    description: 'Ensure our customers have an amazing experience throughout their journey.',
  },
];

export default function CareersPage() {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<typeof openings[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolio: '',
    coverLetter: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = (job: typeof openings[0]) => {
    setSelectedJob(job);
    setShowApplyModal(true);
    setIsSubmitted(false);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleSendResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const scrollToPositions = () => {
    document.getElementById('positions')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      linkedin: '',
      portfolio: '',
      coverLetter: '',
    });
    setIsSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-dark to-dark/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Join Our Team
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Help us transform how people buy and sell online businesses.
              We&apos;re building something special and looking for exceptional people to join us.
            </p>
            <Button size="lg" onClick={scrollToPositions}>
              View Open Positions
              <Icon icon="mdi:arrow-down" className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-dark text-center mb-4">Why BusinessFinder?</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We offer more than just a job. Join a mission-driven team making a real impact.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon icon={benefit.icon} className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-dark mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-dark mb-6">Our Culture</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  At BusinessFinder, we believe in building a company where people do
                  their best work. We&apos;re remote-first, results-oriented, and deeply
                  committed to our mission.
                </p>
                <p>
                  We value ownership, transparency, and continuous learning. Every team
                  member has a direct impact on our success and the success of the
                  entrepreneurs we serve.
                </p>
                <p>
                  We move fast, ship often, and always put our customers first. If you
                  thrive in a dynamic environment and want to make a real difference,
                  you&apos;ll fit right in.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-200 rounded-lg aspect-square flex items-center justify-center">
                <Icon icon="mdi:image" className="w-12 h-12 text-gray-400" />
              </div>
              <div className="bg-gray-200 rounded-lg aspect-square flex items-center justify-center">
                <Icon icon="mdi:image" className="w-12 h-12 text-gray-400" />
              </div>
              <div className="bg-gray-200 rounded-lg aspect-square flex items-center justify-center">
                <Icon icon="mdi:image" className="w-12 h-12 text-gray-400" />
              </div>
              <div className="bg-gray-200 rounded-lg aspect-square flex items-center justify-center">
                <Icon icon="mdi:image" className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 bg-white" id="positions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-dark text-center mb-4">Open Positions</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Find your next opportunity. All positions are remote-friendly.
          </p>

          <div className="space-y-4">
            {openings.map((job) => (
              <Card key={job.id} className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-dark">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:briefcase" className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:map-marker" className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:clock" className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2">{job.description}</p>
                  </div>
                  <Button onClick={() => handleApply(job)}>
                    Apply Now
                    <Icon icon="mdi:arrow-right" className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Don&apos;t See the Right Role?</h2>
          <p className="text-gray-600 mb-8">
            We&apos;re always looking for talented people. Send us your resume and we&apos;ll
            keep you in mind for future opportunities.
          </p>
          <Button variant="secondary" onClick={() => { setShowResumeModal(true); setIsSubmitted(false); }}>
            <Icon icon="mdi:email" className="w-5 h-5 mr-2" />
            Send Your Resume
          </Button>
        </div>
      </section>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => { setShowApplyModal(false); resetForm(); }}
        title={`Apply for ${selectedJob?.title || 'Position'}`}
      >
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={32} />
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-2">Application Submitted!</h3>
            <p className="text-dark-600 mb-6">
              Thanks for applying to {selectedJob?.title}. We&apos;ll review your application and get back to you soon.
            </p>
            <Button variant="primary" onClick={() => { setShowApplyModal(false); resetForm(); }}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitApplication} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Smith"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="(555) 000-0000"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            <Input
              label="LinkedIn Profile"
              placeholder="https://linkedin.com/in/yourprofile"
              value={formData.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
            />
            <Input
              label="Portfolio/Website (Optional)"
              placeholder="https://yourwebsite.com"
              value={formData.portfolio}
              onChange={(e) => handleChange('portfolio', e.target.value)}
            />
            <Textarea
              label="Cover Letter"
              placeholder="Tell us why you're interested in this role..."
              rows={4}
              value={formData.coverLetter}
              onChange={(e) => handleChange('coverLetter', e.target.value)}
              required
            />
            <div className="bg-dark-50 rounded-lg p-4 text-center">
              <Icon icon="solar:cloud-upload-linear" className="text-dark-400 mx-auto mb-2" width={32} />
              <p className="text-sm text-dark-600">Drag and drop your resume or click to upload</p>
              <p className="text-xs text-dark-400 mt-1">PDF, DOC up to 10MB</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowApplyModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Resume Modal */}
      <Modal
        isOpen={showResumeModal}
        onClose={() => { setShowResumeModal(false); resetForm(); }}
        title="Send Your Resume"
      >
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={32} />
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-2">Resume Received!</h3>
            <p className="text-dark-600 mb-6">
              Thanks for your interest! We&apos;ll keep your resume on file and reach out when a suitable opportunity arises.
            </p>
            <Button variant="primary" onClick={() => { setShowResumeModal(false); resetForm(); }}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSendResume} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Smith"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
            <Input
              label="LinkedIn Profile"
              placeholder="https://linkedin.com/in/yourprofile"
              value={formData.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
            />
            <Textarea
              label="Tell us about yourself"
              placeholder="What type of roles are you interested in? What are your skills?"
              rows={4}
              value={formData.coverLetter}
              onChange={(e) => handleChange('coverLetter', e.target.value)}
            />
            <div className="bg-dark-50 rounded-lg p-4 text-center">
              <Icon icon="solar:cloud-upload-linear" className="text-dark-400 mx-auto mb-2" width={32} />
              <p className="text-sm text-dark-600">Drag and drop your resume or click to upload</p>
              <p className="text-xs text-dark-400 mt-1">PDF, DOC up to 10MB</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowResumeModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Resume'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Footer />
    </div>
  );
}
