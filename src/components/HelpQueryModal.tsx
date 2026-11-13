import React, { useState, useEffect } from 'react';
import {
  X,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Copy,
  Check,
  Send,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../types';

export interface SupportQueryItem {
  id: string;
  ticketId: string;
  userId?: string;
  role?: string;
  name: string;
  phone: string;
  email?: string;
  category: string;
  orderId?: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  assignedDesk?: string;
  createdAt: string;
}

export interface HelpQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
}

const HELPDESK_PHONE = '8125235267';
const HELPDESK_EMAIL = 'kisansetu@gmail.com';
const HELPDESK_ADDRESS = 'Hyderabad, Nachupally, 500090';

const QUERY_CATEGORIES = [
  'Razorpay Payment & Settlement',
  'Crop Selling & Mandi Prices',
  'Transport & VegaRath Dispatch',
  'AI Crop Doctor & Remedies',
  'Soil Analysis & 1-Yr Crop Roadmap',
  'Account, KYC & Login Support',
  'Other Agricultural Query',
];

export const HelpQueryModal: React.FC<HelpQueryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeView, setActiveView] = useState<'raise' | 'history'>('raise');
  const [copiedField, setCopiedField] = useState<'phone' | 'email' | 'address' | 'ticket' | null>(
    null
  );

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [category, setCategory] = useState(QUERY_CATEGORIES[0]);
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<SupportQueryItem | null>(null);

  const [queries, setQueries] = useState<SupportQueryItem[]>([]);
  const [isLoadingQueries, setIsLoadingQueries] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName((prev) => prev || currentUser?.name || '');
      setPhone((prev) => prev || currentUser?.phone || '');
      setEmail((prev) => prev || currentUser?.email || '');
      setErrorMsg(null);
      fetchQueries();
    }
  }, [isOpen, currentUser]);

  const fetchQueries = async () => {
    setIsLoadingQueries(true);
    try {
      const res = await fetch('/api/support/queries');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setQueries(data);
        }
      }
    } catch {
      // Keep local list if offline
    } finally {
      setIsLoadingQueries(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = async (value: string, key: 'phone' | 'email' | 'address' | 'ticket') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(key);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setErrorMsg('Please enter your name, mobile number, and query details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/support/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || '',
          role: currentUser?.role || 'farmer',
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          category,
          orderId: orderId.trim(),
          subject: subject.trim() || `${category} Support Request`,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Could not raise support query. Please try again.');
      }

      setCreatedTicket(data);
      setQueries((prev) => [data, ...prev]);
      setSubject('');
      setMessage('');
      setOrderId('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit support query.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="AgriVerse Help & Raise Query Desk"
      id="agriverse-help-query-modal"
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto text-left">
        {/* Top Header */}
        <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-white">
                Help &amp; Raise a Query
              </h2>
              <p className="text-xs text-slate-400">
                Official AgriVerse Farmer, Buyer &amp; Transport Support Desk
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Help Desk"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Official Contact Cards */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Direct Helpdesk Contact Details
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                6:00 AM – 10:00 PM IST
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Phone */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    Helpline
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(HELPDESK_PHONE, 'phone')}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500 cursor-pointer"
                    title="Copy phone number"
                  >
                    {copiedField === 'phone' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <a
                  href={`tel:${HELPDESK_PHONE}`}
                  className="font-mono font-extrabold text-sm tabular-nums text-slate-950 hover:text-emerald-700 no-underline"
                >
                  {HELPDESK_PHONE}
                </a>
              </div>

              {/* Email */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    Email
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(HELPDESK_EMAIL, 'email')}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500 cursor-pointer"
                    title="Copy support email"
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <a
                  href={`mailto:${HELPDESK_EMAIL}`}
                  className="font-mono font-bold text-xs text-slate-950 hover:text-emerald-700 break-all no-underline"
                >
                  {HELPDESK_EMAIL}
                </a>
              </div>

              {/* Address */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Location
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(HELPDESK_ADDRESS, 'address')}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500 cursor-pointer"
                    title="Copy office address"
                  >
                    {copiedField === 'address' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <p className="font-semibold text-xs text-slate-900 leading-snug">
                  {HELPDESK_ADDRESS}
                </p>
              </div>
            </div>
          </div>

          {/* View Switcher: Raise Query vs My Raised Queries */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => {
                setActiveView('raise');
                setCreatedTicket(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeView === 'raise'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Raise New Query
            </button>
            <button
              type="button"
              onClick={() => setActiveView('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeView === 'history'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Raised Queries ({queries.length})</span>
            </button>
          </div>

          {/* VIEW 1: RAISE A QUERY */}
          {activeView === 'raise' && (
            <>
              {createdTicket ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h3 className="font-heading font-bold text-base text-slate-900">
                        Support Query Raised Successfully
                      </h3>
                      <p className="text-xs text-slate-700">
                        Your query has been logged with our Nachupally, Hyderabad support desk. Our team will reach out on{' '}
                        <strong className="font-mono">{createdTicket.phone}</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Ticket Reference ID</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <strong className="font-mono text-sm text-slate-950">
                          {createdTicket.ticketId}
                        </strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(createdTicket.ticketId, 'ticket')}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 cursor-pointer"
                        >
                          {copiedField === 'ticket' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Category</span>
                      <strong className="text-slate-900 block mt-0.5">
                        {createdTicket.category}
                      </strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setCreatedTicket(null)}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold cursor-pointer"
                    >
                      Raise Another Query
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView('history')}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                    >
                      View My Queries
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitQuery} className="space-y-3.5 text-xs">
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-slate-900 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono tabular-nums font-medium focus:bg-white focus:border-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Issue Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:bg-white focus:border-slate-900 focus:outline-hidden"
                      >
                        {QUERY_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Order / Razorpay Ref ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="e.g., ORD-1024 or pay_Rzp..."
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:border-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Short summary of your issue"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-slate-900 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Describe Your Query *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Explain your payment, mandi order, crop scan, or transport question..."
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:bg-white focus:border-slate-900 focus:outline-hidden resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500">
                      Urgent? Call{' '}
                      <a
                        href={`tel:${HELPDESK_PHONE}`}
                        className="font-mono font-bold text-slate-900 underline"
                      >
                        {HELPDESK_PHONE}
                      </a>{' '}
                      or email{' '}
                      <a
                        href={`mailto:${HELPDESK_EMAIL}`}
                        className="font-mono font-bold text-slate-900 underline"
                      >
                        {HELPDESK_EMAIL}
                      </a>
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                      id="submit-support-query-btn"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Submitting Query...' : 'Raise Query'}</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* VIEW 2: RAISED QUERIES HISTORY */}
          {activeView === 'history' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">
                  Recent Support Tickets
                </span>
                <button
                  type="button"
                  onClick={fetchQueries}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingQueries ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {queries.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <p className="font-semibold text-slate-800">No queries raised yet</p>
                  <p className="text-slate-500">
                    Need assistance? Switch to "Raise New Query" or call {HELPDESK_PHONE}.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {queries.map((q) => (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-950 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {q.ticketId}
                          </span>
                          <span className="font-bold text-slate-900">{q.subject}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px] uppercase">
                          {q.status}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{q.message}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 font-mono">
                        <span>{q.category}</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(q.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
