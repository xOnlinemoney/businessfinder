'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NDAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signature: string) => Promise<void>;
  userName: string;
  userEmail: string;
  listingTitle: string;
}

export function NDAModal({ isOpen, onClose, onSign, userName, userEmail, listingTitle }: NDAModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSign = async () => {
    if (!agreed || !signature.trim()) return;

    setIsSubmitting(true);
    try {
      await onSign(signature);
    } catch (error) {
      console.error('Error signing NDA:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl transform transition-transform duration-300 flex flex-col h-full",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-dark-200 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-lg font-bold text-dark-900">Non-Disclosure Agreement</h2>
          <button
            onClick={onClose}
            className="text-dark-500 hover:text-dark-900 p-2 hover:bg-dark-100 rounded-full transition-colors"
          >
            <Icon icon="solar:close-circle-linear" width={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-dark-50">
          {/* Listing Reference */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
            <div className="text-xs font-medium text-primary mb-1">NDA for Listing:</div>
            <div className="text-sm font-semibold text-dark-900">{listingTitle}</div>
          </div>

          {/* NDA Text */}
          <div className="bg-white border border-dark-200 rounded-lg p-6 shadow-sm mb-6">
            <div className="prose prose-sm text-dark-600 max-w-none">
              <h3 className="text-dark-900 font-bold text-base mb-4">NON-DISCLOSURE AGREEMENT</h3>

              <p className="text-xs leading-relaxed mb-4">
                This Non-Disclosure Agreement ("Agreement") is entered into as of the date of electronic acceptance by and between the Seller of the business listing referenced above ("Disclosing Party") and the undersigned prospective buyer ("Receiving Party" or "Undersigned").
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">1. CONFIDENTIALITY OBLIGATIONS</h4>
              <p className="text-xs leading-relaxed mb-4">
                The Undersigned acknowledges that the Seller will provide confidential information regarding the Business ("Confidential Information"). The Undersigned agrees to keep all such information strictly confidential and not to disclose it to any third party, except to professional advisors (attorneys, accountants, financial advisors) who also agree to maintain confidentiality and are bound by professional duties of confidentiality.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">2. DEFINITION OF CONFIDENTIAL INFORMATION</h4>
              <p className="text-xs leading-relaxed mb-4">
                Confidential Information includes, but is not limited to: (a) financial statements, tax returns, and accounting records; (b) customer lists, vendor relationships, and supplier agreements; (c) proprietary technology, trade secrets, and intellectual property; (d) business plans, marketing strategies, and pricing information; (e) employee information and compensation details; (f) any other information designated as confidential by the Disclosing Party.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">3. USE OF INFORMATION</h4>
              <p className="text-xs leading-relaxed mb-4">
                The Confidential Information shall be used solely for the purpose of evaluating the potential acquisition of the Business. It shall not be used for any other purpose, including but not limited to: (a) competitive advantage in any market; (b) solicitation of the Business's customers, employees, or vendors; (c) development of competing products or services; (d) any purpose that could harm the Business or the Disclosing Party.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">4. NON-SOLICITATION</h4>
              <p className="text-xs leading-relaxed mb-4">
                The Undersigned agrees not to directly or indirectly solicit, recruit, or hire any employees, contractors, customers, or vendors of the Business for a period of two (2) years from the date of this Agreement, regardless of whether a transaction is completed.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">5. NO CONTACT WITHOUT CONSENT</h4>
              <p className="text-xs leading-relaxed mb-4">
                The Undersigned agrees not to contact any employees, customers, vendors, or other business relationships of the Business without the prior written consent of the Seller. All communications shall be directed through the designated intermediary or platform.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">6. RETURN OF INFORMATION</h4>
              <p className="text-xs leading-relaxed mb-4">
                Upon request by the Disclosing Party, or upon termination of discussions, the Undersigned shall promptly return or destroy all Confidential Information and any copies thereof, and shall certify such return or destruction in writing.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">7. NO LICENSE GRANTED</h4>
              <p className="text-xs leading-relaxed mb-4">
                Nothing in this Agreement grants the Undersigned any license or rights in or to the Confidential Information or any intellectual property of the Business.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">8. NO OBLIGATION TO PROCEED</h4>
              <p className="text-xs leading-relaxed mb-4">
                This Agreement does not obligate either party to proceed with any transaction or relationship. Either party may terminate discussions at any time without liability, subject to the continuing obligations of confidentiality.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">9. TERM</h4>
              <p className="text-xs leading-relaxed mb-4">
                The confidentiality obligations under this Agreement shall remain in effect for a period of two (2) years from the date of electronic acceptance, regardless of whether any transaction is completed.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">10. REMEDIES</h4>
              <p className="text-xs leading-relaxed mb-4">
                The Undersigned acknowledges that any breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages may be inadequate. Therefore, the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or in equity.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">11. GOVERNING LAW</h4>
              <p className="text-xs leading-relaxed mb-4">
                This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflicts of law principles.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">12. ENTIRE AGREEMENT</h4>
              <p className="text-xs leading-relaxed mb-4">
                This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, and agreements relating to this subject matter.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">13. SEVERABILITY</h4>
              <p className="text-xs leading-relaxed mb-4">
                If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">14. WAIVER</h4>
              <p className="text-xs leading-relaxed mb-4">
                No waiver of any provision of this Agreement shall be effective unless in writing and signed by the waiving party. No failure or delay in exercising any right shall constitute a waiver thereof.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">15. ASSIGNMENT</h4>
              <p className="text-xs leading-relaxed mb-4">
                This Agreement may not be assigned by the Undersigned without the prior written consent of the Disclosing Party.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">16. COUNTERPARTS</h4>
              <p className="text-xs leading-relaxed mb-4">
                This Agreement may be executed electronically and in counterparts, each of which shall be deemed an original and all of which together shall constitute one and the same instrument.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">17. NOTICES</h4>
              <p className="text-xs leading-relaxed mb-4">
                All notices required or permitted under this Agreement shall be in writing and shall be delivered through the platform's messaging system or to the email addresses provided by the parties.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">18. THIRD PARTY BENEFICIARIES</h4>
              <p className="text-xs leading-relaxed mb-4">
                This Agreement is for the sole benefit of the parties hereto and their respective successors and permitted assigns. Nothing herein shall be construed as giving any third party any right, remedy, or claim under or in respect of this Agreement.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">19. INDEPENDENT CONTRACTORS</h4>
              <p className="text-xs leading-relaxed mb-4">
                The parties are independent contractors and nothing in this Agreement shall be construed to create a partnership, joint venture, or agency relationship between the parties.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">20. SURVIVAL</h4>
              <p className="text-xs leading-relaxed mb-4">
                The obligations of confidentiality, non-solicitation, and non-contact shall survive any termination or expiration of this Agreement.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">21. ATTORNEY'S FEES</h4>
              <p className="text-xs leading-relaxed mb-4">
                In any action to enforce this Agreement, the prevailing party shall be entitled to recover its reasonable attorney's fees and costs from the non-prevailing party.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">22. ELECTRONIC SIGNATURE</h4>
              <p className="text-xs leading-relaxed mb-4">
                The parties agree that electronic signatures shall have the same legal effect as original signatures and that this Agreement may be executed and delivered electronically.
              </p>

              <h4 className="text-dark-900 font-semibold text-sm mb-2">23. ACKNOWLEDGMENT</h4>
              <p className="text-xs leading-relaxed mb-4">
                By signing below, the Undersigned acknowledges that they have read, understand, and agree to be bound by all terms and conditions of this Non-Disclosure Agreement, and that they are signing this Agreement voluntarily and of their own free will.
              </p>
            </div>
          </div>

          {/* Agreement Section */}
          <div className="space-y-4">
            {/* Signed in as */}
            <div className="p-4 bg-white border border-dark-200 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="text-xs text-dark-500">Signed in as</div>
                <div className="text-sm font-medium text-dark-900">{userName}</div>
                <div className="text-xs text-dark-500">{userEmail}</div>
              </div>
            </div>

            {/* Checkbox */}
            <label className="flex items-start gap-3 p-4 border border-dark-200 rounded-lg bg-white cursor-pointer hover:border-primary transition-colors">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary border-dark-300 rounded focus:ring-primary"
              />
              <div className="text-sm">
                <span className="font-medium text-dark-900">I agree to the Non-Disclosure Agreement</span>
                <p className="text-xs text-dark-500 mt-0.5">I understand this is a legally binding contract that governs my use of the confidential information.</p>
              </div>
            </label>

            {/* Signature */}
            <div>
              <label className="text-xs font-semibold text-dark-900 mb-1.5 block">
                Type your full legal name to sign *
              </label>
              <input
                type="text"
                placeholder="e.g. John Smith"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="w-full h-11 px-4 border border-dark-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-dark-900"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-dark-200 bg-white shrink-0">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSign}
            disabled={!agreed || !signature.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Icon icon="solar:spinner-line-duotone" width={20} className="animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Icon icon="solar:pen-bold" width={18} />
                Digitally Sign & Access Listing
              </>
            )}
          </Button>
          <p className="text-center text-[10px] text-dark-500 mt-3 flex items-center justify-center gap-1">
            <Icon icon="solar:shield-check-bold" width={12} />
            Your signature and IP address are recorded for security verification.
          </p>
        </div>
      </div>
    </div>
  );
}

export default NDAModal;
