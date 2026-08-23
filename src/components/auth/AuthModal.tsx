import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Building, 
  Phone, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { procurementStore } from '../../services/procurementStore';
import { RoleType, User } from '../../types/procurement';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onSuccess?: (user: User) => void;
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  
  // Sign In fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpRole, setSignUpRole] = useState<RoleType>('EMPLOYEE');
  const [signUpDepartment, setSignUpDepartment] = useState('Engineering & IT');
  const [signUpPassword, setSignUpPassword] = useState('');

  // UI status
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const demoAccounts: { role: RoleType; name: string; email: string; label: string; badge: string; password: string }[] = [
    { role: 'EMPLOYEE', name: 'Rahul Deshmukh', email: 'rahul.dev@smartprocure.io', label: 'Employee Requester', badge: 'Requisitions & Appliances', password: 'Employee@2026' },
    { role: 'ADMIN', name: 'Vikram Sharma', email: 'admin@smartprocure.io', label: 'Executive Admin', badge: 'Tier 3 & System Governance', password: 'Admin@2026' },
    { role: 'CUSTOMER', name: 'Neha Kapoor', email: 'neha.partner@clientcorp.in', label: 'Enterprise Customer', badge: 'Luxury Fleet & Materials', password: 'Customer@2026' },
    { role: 'MANAGER', name: 'Ananya Iyer', email: 'manager.ananya@smartprocure.io', label: 'Dept Manager', badge: 'Approvals < $50K', password: 'Manager@2026' },
    { role: 'PROCUREMENT_MANAGER', name: 'Kavita Sundaram', email: 'procurement.kavita@smartprocure.io', label: 'Procurement Officer', badge: 'PO & Vendor Bids', password: 'Procurement@2026' },
    { role: 'SUPPLIER', name: 'Titan Industrial Systems', email: 'orders@titanindustries.com', label: 'Titan Supplier', badge: 'Supplier Portal', password: 'Supplier@2026' },
    { role: 'DELIVERY_AGENT', name: 'SwiftExpress Freight Ltd', email: 'dispatch@swiftexpress.com', label: 'Logistics Courier', badge: 'Dispatch & Fleet GPS', password: 'Delivery@2026' },
  ];

  const handleQuickLogin = async (email: string, pwd?: string) => {
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const result = await procurementStore.loginWithPassword(email, pwd);
      setIsSubmitting(false);
      if (result.success && result.user) {
        setSuccessMsg(`Welcome back, ${result.user.name}! Authenticated as ${result.user.role}.`);
        setTimeout(() => {
          if (onSuccess) onSuccess(result.user!);
          onClose();
        }, 500);
      } else {
        setError(result.error || 'Authentication failed.');
      }
    } catch {
      setIsSubmitting(false);
      setError('An error occurred during authentication.');
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!signInEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await procurementStore.loginWithPassword(signInEmail.trim(), signInPassword);
      setIsSubmitting(false);
      if (result.success && result.user) {
        setSuccessMsg(`Authenticated successfully! Welcome, ${result.user.name}.`);
        setTimeout(() => {
          if (onSuccess) onSuccess(result.user!);
          onClose();
        }, 500);
      } else {
        setError(result.error || 'Invalid credentials or user not found.');
      }
    } catch {
      setIsSubmitting(false);
      setError('Authentication failed.');
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!signUpName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await procurementStore.registerUser({
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        phone: signUpPhone.trim() || undefined,
        role: signUpRole,
        department: signUpDepartment.trim() || undefined,
        password: signUpPassword || undefined
      });
      setIsSubmitting(false);

      if (result.success && result.user) {
        setSuccessMsg(`Account created successfully! Logged in as ${result.user.name} (${result.user.role}).`);
        setTimeout(() => {
          if (onSuccess) onSuccess(result.user!);
          onClose();
        }, 600);
      } else {
        setError(result.error || 'Could not create account.');
      }
    } catch {
      setIsSubmitting(false);
      setError('Registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121212]/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#F9F7F2] border border-[#121212] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#121212] text-[#F9F7F2] px-6 py-4 flex items-center justify-between border-b border-[#121212]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none border border-[#F9F7F2]/40 bg-[#F9F7F2]/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#F9F7F2]" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-[#F9F7F2] leading-tight">
                {mode === 'signin' ? 'Sign In to SmartProcure' : 'Create Enterprise Account'}
              </h2>
              <p className="text-[11px] font-sans text-[#F9F7F2]/60">
                PostgreSQL RBAC & Role-Authorized Workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#F9F7F2]/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#121212]/15 bg-[#F2EDE4]">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-3 text-xs font-sans uppercase tracking-[0.15em] font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'signin'
                ? 'bg-[#F9F7F2] text-[#121212] border-b-2 border-[#121212]'
                : 'text-[#121212]/60 hover:text-[#121212]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-3 text-xs font-sans uppercase tracking-[0.15em] font-semibold transition cursor-pointer flex items-center justify-center gap-2 ${
              mode === 'signup'
                ? 'bg-[#F9F7F2] text-[#121212] border-b-2 border-[#121212]'
                : 'text-[#121212]/60 hover:text-[#121212]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Feedback Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#121212]/40">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    placeholder="e.g. john.doe@company.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#121212]/30 focus:border-[#121212] focus:ring-1 focus:ring-[#121212] text-sm text-[#121212] outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setSignInPassword('DemoPassword123!')}
                    className="text-[11px] text-[#121212]/60 hover:text-[#121212] underline cursor-pointer"
                  >
                    Use default demo password
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#121212]/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#121212]/30 focus:border-[#121212] focus:ring-1 focus:ring-[#121212] text-sm text-[#121212] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#121212]/50 hover:text-[#121212] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#121212]/70 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="accent-[#121212]"
                  />
                  <span>Remember this device</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link has been dispatched to your email (simulated).')}
                  className="hover:text-[#121212] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-xs font-sans uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In to Workspace'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Quick Demo Sign In presets */}
              <div className="pt-3 border-t border-[#121212]/15">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-[#121212]/60 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#121212]" /> One-Click Role Simulator
                  </span>
                  <span className="text-[10px] text-[#121212]/50">Pre-configured Personas</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {demoAccounts.map(account => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => handleQuickLogin(account.email)}
                      className="p-2 text-left bg-white hover:bg-[#F2EDE4] border border-[#121212]/15 hover:border-[#121212] transition cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium text-[#121212] group-hover:text-black truncate">
                          {account.name}
                        </span>
                        <span className="text-[9px] px-1 py-0.2 bg-[#121212]/5 border border-[#121212]/20 text-[#121212]/75 uppercase font-mono shrink-0">
                          {account.role.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#121212]/60 truncate">{account.badge}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#121212]/40">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={signUpName}
                      onChange={e => setSignUpName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#121212]/30 focus:border-[#121212] text-xs text-[#121212] outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1.5">
                    Work Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#121212]/40">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={e => setSignUpEmail(e.target.value)}
                      placeholder="alex.morgan@company.com"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#121212]/30 focus:border-[#121212] text-xs text-[#121212] outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1.5">
                    Assigned Role
                  </label>
                  <select
                    value={signUpRole}
                    onChange={e => setSignUpRole(e.target.value as RoleType)}
                    className="w-full px-3 py-2 bg-white border border-[#121212]/30 focus:border-[#121212] text-xs text-[#121212] outline-none"
                  >
                    <option value="EMPLOYEE">Employee (Requester)</option>
                    <option value="MANAGER">Department Manager (Approver)</option>
                    <option value="PROCUREMENT_OFFICER">Procurement Officer (Buyer)</option>
                    <option value="SUPPLIER">Supplier / Vendor Partner</option>
                    <option value="DELIVERY_PERSONNEL">Logistics / Courier</option>
                    <option value="CUSTOMER">Client / Enterprise Customer</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1.5">
                    Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#121212]/40">
                      <Building className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={signUpDepartment}
                      onChange={e => setSignUpDepartment(e.target.value)}
                      placeholder="e.g. Operations, IT, Finance"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#121212]/30 focus:border-[#121212] text-xs text-[#121212] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1.5">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#121212]/40">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={signUpPhone}
                      onChange={e => setSignUpPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#121212]/30 focus:border-[#121212] text-xs text-[#121212] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1.5">
                    Create Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#121212]/40">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={signUpPassword}
                      onChange={e => setSignUpPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#121212]/30 focus:border-[#121212] text-xs text-[#121212] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white border border-[#121212]/15 text-[11px] text-[#121212]/70 leading-relaxed">
                By registering, your account will be granted role permissions according to PostgreSQL RBAC security policies. All actions are tracked in the immutable audit ledger.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-xs font-sans uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? 'Registering Account...' : 'Complete Registration & Sign In'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F2EDE4] px-6 py-3 border-t border-[#121212]/15 flex items-center justify-between text-xs text-[#121212]/70">
          <span className="font-serif italic">Enterprise Smart Procurement Security Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white hover:bg-[#EBE5DB] border border-[#121212]/20 text-[11px] font-sans uppercase tracking-[0.1em] text-[#121212] transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
