import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  UserCheck, 
  Building2, 
  Users, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  Fingerprint, 
  Shield, 
  ShoppingBag, 
  Truck, 
  Layers,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { procurementStore, ProcurementState } from '../../services/procurementStore';
import { RoleType, User } from '../../types/procurement';
import { fastHashSync } from '../../utils/crypto';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onBypassToDemo?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBypassToDemo
}) => {
  const [state, setState] = useState<ProcurementState>(procurementStore.getState());
  const [activePortal, setActivePortal] = useState<'EMPLOYEE' | 'ADMIN' | 'CUSTOMER' | 'OTHER'>('EMPLOYEE');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  // Sign In Form State
  const [email, setEmail] = useState('rahul.dev@smartprocure.io');
  const [password, setPassword] = useState('Employee@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<RoleType>('EMPLOYEE');
  const [regDept, setRegDept] = useState('');

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [liveHash, setLiveHash] = useState('');

  useEffect(() => {
    return procurementStore.subscribe(() => {
      setState(procurementStore.getState());
    });
  }, []);

  // Update live hash when password changes
  useEffect(() => {
    const pwd = authMode === 'signin' ? password : regPassword;
    if (pwd) {
      setLiveHash(fastHashSync(pwd));
    } else {
      setLiveHash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    }
  }, [password, regPassword, authMode]);

  // When switching portals, auto-fill standard credentials for smooth demo
  const handleSelectPortal = (portal: 'EMPLOYEE' | 'ADMIN' | 'CUSTOMER' | 'OTHER') => {
    setActivePortal(portal);
    setErrorMessage('');
    setSuccessMessage('');

    if (portal === 'EMPLOYEE') {
      setEmail('rahul.dev@smartprocure.io');
      setPassword('Employee@2026');
      setRegRole('EMPLOYEE');
      setRegDept('Product Engineering & Design');
    } else if (portal === 'ADMIN') {
      setEmail('admin@smartprocure.io');
      setPassword('Admin@2026');
      setRegRole('ADMIN');
      setRegDept('Executive Administration & Governance');
    } else if (portal === 'CUSTOMER') {
      setEmail('neha.partner@clientcorp.in');
      setPassword('Customer@2026');
      setRegRole('CUSTOMER');
      setRegDept('Strategic Client & Partner Accounts');
    } else {
      setEmail('manager.ananya@smartprocure.io');
      setPassword('Manager@2026');
      setRegRole('MANAGER');
      setRegDept('Engineering Operations');
    }
  };

  const handleQuickRoleLogin = async (userRole: RoleType) => {
    setIsLoading(true);
    setErrorMessage('');
    
    // Find designated user for role
    const targetUser = state.users.find(u => u.role === userRole) || state.users[0];
    const userEmail = targetUser.email;
    const userPwd = targetUser.defaultPassword || 'Secure@2026';

    setEmail(userEmail);
    setPassword(userPwd);

    setTimeout(async () => {
      const res = await procurementStore.loginWithPassword(userEmail, userPwd);
      setIsLoading(false);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Authentication failed');
      }
    }, 350);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Corporate email address is required.');
      return;
    }
    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await procurementStore.loginWithPassword(email, password);
      if (res.success && res.user) {
        setSuccessMessage(`Authenticated as ${res.user.name} (${res.user.role})`);
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(res.user!);
        }, 300);
      } else {
        setIsLoading(false);
        setErrorMessage(res.error || 'Invalid credentials or user not found.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('An unexpected cryptographic handshake error occurred.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await procurementStore.registerUser({
        name: regName,
        email: regEmail,
        role: regRole,
        department: regDept || undefined,
        password: regPassword
      });

      if (res.success && res.user) {
        setSuccessMessage(`Enterprise account created for ${res.user.name}!`);
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(res.user!);
        }, 400);
      } else {
        setIsLoading(false);
        setErrorMessage(res.error || 'Could not register account.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Registration failed.');
    }
  };

  return (
    <div id="login-gateway-screen" className="min-h-screen bg-[#F9F7F2] text-[#121212] flex flex-col justify-between selection:bg-[#121212] selection:text-[#F9F7F2]">
      {/* Top Banner Header */}
      <header className="border-b border-[#121212]/10 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#121212] text-[#F9F7F2] flex items-center justify-center font-serif text-lg font-bold shadow-sm">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-tight text-[#121212]">
                  SmartProcure
                </span>
                <span className="text-[9px] font-sans font-semibold uppercase tracking-[0.2em] bg-[#121212]/5 text-[#121212]/70 px-2 py-0.5 border border-[#121212]/10">
                  Enterprise Gateway
                </span>
              </div>
              <p className="text-[11px] text-[#121212]/60 hidden sm:block">
                Automated Procurement, Requisitions & Supply Chain ERP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-[#121212]/70 bg-[#F9F7F2] px-3 py-1.5 border border-[#121212]/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>SHA-256 Encrypted &bull; TLS 1.3 Active</span>
            </div>

            {onBypassToDemo && (
              <button
                onClick={onBypassToDemo}
                className="px-3.5 py-1.5 bg-[#F9F7F2] hover:bg-[#EBE5DB] text-[#121212] border border-[#121212]/30 text-xs font-sans uppercase tracking-[0.1em] font-semibold cursor-pointer transition-colors"
              >
                Guest Demo Entry &rarr;
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Authentication Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Role Gateway Selector & Feature Overview */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white border border-[#121212]/10 text-[10px] uppercase font-sans tracking-[0.2em] font-semibold text-[#121212]/70 mb-3">
                <Fingerprint className="w-3.5 h-3.5 text-[#121212]" />
                Role-Based Access Control (RBAC)
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#121212] tracking-tight leading-tight">
                Secure Enterprise Portal Login
              </h1>
              <p className="mt-2 text-sm text-[#121212]/70 leading-relaxed">
                Select your designated enterprise role gateway to access department requisitions, purchase orders, catalog procurement, or administrative governance.
              </p>
            </div>

            {/* 3 Primary Gateways as requested: Employee, Admin, Customer */}
            <div className="space-y-3">
              {/* 1. EMPLOYEE PORTAL */}
              <div
                onClick={() => handleSelectPortal('EMPLOYEE')}
                className={`p-4 border transition-all cursor-pointer ${
                  activePortal === 'EMPLOYEE'
                    ? 'bg-white border-[#121212] shadow-sm ring-1 ring-[#121212]'
                    : 'bg-white/60 hover:bg-white border-[#121212]/15'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 flex items-center justify-center ${
                      activePortal === 'EMPLOYEE' ? 'bg-[#121212] text-[#F9F7F2]' : 'bg-[#F9F7F2] text-[#121212]'
                    }`}>
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-[#121212]">
                          Employee Portal
                        </span>
                        <span className="text-[10px] font-sans uppercase tracking-[0.1em] px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200">
                          Requisitions
                        </span>
                      </div>
                      <p className="text-xs text-[#121212]/70 mt-0.5">
                        Submit purchase requests, track item status, browse hardware & appliances.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-[#121212]/40 transition-transform ${activePortal === 'EMPLOYEE' ? 'rotate-90 text-[#121212]' : ''}`} />
                </div>
              </div>

              {/* 2. ADMIN CONTROL GATEWAY */}
              <div
                onClick={() => handleSelectPortal('ADMIN')}
                className={`p-4 border transition-all cursor-pointer ${
                  activePortal === 'ADMIN'
                    ? 'bg-white border-[#121212] shadow-sm ring-1 ring-[#121212]'
                    : 'bg-white/60 hover:bg-white border-[#121212]/15'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 flex items-center justify-center ${
                      activePortal === 'ADMIN' ? 'bg-[#121212] text-[#F9F7F2]' : 'bg-[#F9F7F2] text-[#121212]'
                    }`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-[#121212]">
                          Admin Control Gateway
                        </span>
                        <span className="text-[10px] font-sans uppercase tracking-[0.1em] px-1.5 py-0.5 bg-purple-50 text-purple-800 border border-purple-200">
                          Governance
                        </span>
                      </div>
                      <p className="text-xs text-[#121212]/70 mt-0.5">
                        Tier-3 financial authorizations, user provisioning, system audit trail & scoring.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-[#121212]/40 transition-transform ${activePortal === 'ADMIN' ? 'rotate-90 text-[#121212]' : ''}`} />
                </div>
              </div>

              {/* 3. CUSTOMER / CLIENT PORTAL */}
              <div
                onClick={() => handleSelectPortal('CUSTOMER')}
                className={`p-4 border transition-all cursor-pointer ${
                  activePortal === 'CUSTOMER'
                    ? 'bg-white border-[#121212] shadow-sm ring-1 ring-[#121212]'
                    : 'bg-white/60 hover:bg-white border-[#121212]/15'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 flex items-center justify-center ${
                      activePortal === 'CUSTOMER' ? 'bg-[#121212] text-[#F9F7F2]' : 'bg-[#F9F7F2] text-[#121212]'
                    }`}>
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-[#121212]">
                          Customer & Client Hub
                        </span>
                        <span className="text-[10px] font-sans uppercase tracking-[0.1em] px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Purchases
                        </span>
                      </div>
                      <p className="text-xs text-[#121212]/70 mt-0.5">
                        Bulk corporate client ordering, luxury vehicles & machinery requests.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-[#121212]/40 transition-transform ${activePortal === 'CUSTOMER' ? 'rotate-90 text-[#121212]' : ''}`} />
                </div>
              </div>
            </div>

            {/* Quick Persona Launch Buttons */}
            <div className="bg-white border border-[#121212]/15 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-sans uppercase tracking-[0.1em] font-semibold text-[#121212]/70">
                <span>Instant Persona One-Click Logins</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 border border-emerald-200">Verified</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('EMPLOYEE')}
                  className="px-2.5 py-1.5 bg-[#F9F7F2] hover:bg-[#121212] hover:text-[#F9F7F2] border border-[#121212]/20 text-xs font-medium text-left transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5 opacity-70" />
                  <span className="truncate">Employee</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('ADMIN')}
                  className="px-2.5 py-1.5 bg-[#F9F7F2] hover:bg-[#121212] hover:text-[#F9F7F2] border border-[#121212]/20 text-xs font-medium text-left transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 opacity-70" />
                  <span className="truncate">Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('CUSTOMER')}
                  className="px-2.5 py-1.5 bg-[#F9F7F2] hover:bg-[#121212] hover:text-[#F9F7F2] border border-[#121212]/20 text-xs font-medium text-left transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5 opacity-70" />
                  <span className="truncate">Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('MANAGER')}
                  className="px-2.5 py-1.5 bg-[#F9F7F2] hover:bg-[#121212] hover:text-[#F9F7F2] border border-[#121212]/20 text-xs font-medium text-left transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 opacity-70" />
                  <span className="truncate">Manager</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('PROCUREMENT_MANAGER')}
                  className="px-2.5 py-1.5 bg-[#F9F7F2] hover:bg-[#121212] hover:text-[#F9F7F2] border border-[#121212]/20 text-xs font-medium text-left transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5 opacity-70" />
                  <span className="truncate">Procurement</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleLogin('DELIVERY_AGENT')}
                  className="px-2.5 py-1.5 bg-[#F9F7F2] hover:bg-[#121212] hover:text-[#F9F7F2] border border-[#121212]/20 text-xs font-medium text-left transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5 opacity-70" />
                  <span className="truncate">Logistics</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Encrypted Sign In / Sign Up Form Card */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-white border border-[#121212] p-6 sm:p-8 flex-1 flex flex-col justify-between shadow-sm">
              
              {/* Form Navigation Tabs */}
              <div>
                <div className="flex items-center justify-between border-b border-[#121212]/15 pb-4 mb-6">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className={`px-4 py-2 text-xs font-sans uppercase tracking-[0.1em] font-semibold transition-all cursor-pointer ${
                        authMode === 'signin'
                          ? 'bg-[#121212] text-[#F9F7F2]'
                          : 'bg-[#F9F7F2] text-[#121212]/70 hover:text-[#121212] hover:bg-[#EBE5DB]'
                      }`}
                    >
                      Encrypted Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className={`px-4 py-2 text-xs font-sans uppercase tracking-[0.1em] font-semibold transition-all cursor-pointer ${
                        authMode === 'signup'
                          ? 'bg-[#121212] text-[#F9F7F2]'
                          : 'bg-[#F9F7F2] text-[#121212]/70 hover:text-[#121212] hover:bg-[#EBE5DB]'
                      }`}
                    >
                      Register New User
                    </button>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-[#121212]/60 font-mono">
                    <KeyRound className="w-3.5 h-3.5 text-[#121212]" />
                    <span>PBKDF2/SHA-256</span>
                  </div>
                </div>

                {/* Error & Success Feedback Alerts */}
                {errorMessage && (
                  <div className="mb-5 p-3.5 bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Authentication Denied</p>
                      <p className="mt-0.5 text-rose-800">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start gap-2.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Cryptographic Handshake Successful</p>
                      <p className="mt-0.5 text-emerald-800">{successMessage}</p>
                    </div>
                  </div>
                )}

                {/* FORM 1: SIGN IN */}
                {authMode === 'signin' && (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1.5">
                        Corporate Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="e.g. rahul.dev@smartprocure.io"
                          className="w-full px-3.5 py-2.5 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-sm outline-none font-mono"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-[#121212]/40 font-mono">
                          @enterprise
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212]">
                          Password (Encrypted)
                        </label>
                        <span className="text-[11px] text-[#121212]/60 font-mono">
                          Default: <span className="font-bold">{activePortal === 'EMPLOYEE' ? 'Employee@2026' : activePortal === 'ADMIN' ? 'Admin@2026' : 'Customer@2026'}</span>
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3.5 py-2.5 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-sm outline-none font-mono tracking-wider pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-[#121212]/60 hover:text-[#121212]"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs text-[#121212]/80 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          className="w-4 h-4 accent-[#121212]"
                        />
                        <span>Remember encrypted token on this terminal</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-xs font-sans uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 animate-spin" />
                          <span>Computing Cryptographic Hash...</span>
                        </div>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Sign In to {activePortal === 'EMPLOYEE' ? 'Employee Portal' : activePortal === 'ADMIN' ? 'Admin Gateway' : activePortal === 'CUSTOMER' ? 'Customer Hub' : 'Enterprise'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* FORM 2: SIGN UP / REGISTRATION */}
                {authMode === 'signup' && (
                  <form onSubmit={handleSignUp} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1">
                          Full Legal Name
                        </label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={e => setRegName(e.target.value)}
                          placeholder="e.g. Siddharth Menon"
                          className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1">
                          Enterprise Role
                        </label>
                        <select
                          value={regRole}
                          onChange={e => setRegRole(e.target.value as RoleType)}
                          className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-sm outline-none"
                        >
                          <option value="EMPLOYEE">Employee (Requisitioner)</option>
                          <option value="ADMIN">Admin (Executive Governance)</option>
                          <option value="CUSTOMER">Customer / Enterprise Client</option>
                          <option value="MANAGER">Manager (Level 1 Approver)</option>
                          <option value="PROCUREMENT_MANAGER">Procurement Manager (PO Creator)</option>
                          <option value="SUPPLIER">Supplier (Vendor Fulfillment)</option>
                          <option value="DELIVERY_AGENT">Delivery Courier (Fleet Logistics)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          placeholder="name@enterprise.io"
                          className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-sm outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1">
                          Department
                        </label>
                        <input
                          type="text"
                          value={regDept}
                          onChange={e => setRegDept(e.target.value)}
                          placeholder="e.g. Infrastructure, Logistics"
                          className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-sans uppercase tracking-[0.1em] font-semibold text-[#121212] mb-1">
                        Secure Password (Encrypted automatically)
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Create strong enterprise password"
                        className="w-full px-3 py-2 bg-[#F9F7F2] border border-[#121212]/30 focus:border-[#121212] focus:bg-white text-sm outline-none font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 bg-[#121212] hover:bg-[#2A2A2A] text-[#F9F7F2] text-xs font-sans uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 animate-spin" />
                          <span>Generating Cryptographic Token...</span>
                        </div>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Encrypt & Register Enterprise Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Password Encryption Telemetry Box */}
              <div className="mt-6 pt-4 border-t border-[#121212]/10 bg-[#F9F7F2] p-3.5 border border-[#121212]/15">
                <div className="flex items-center justify-between text-[10px] font-sans uppercase tracking-[0.15em] font-bold text-[#121212]/70 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#121212]" />
                    Live Cryptographic Inspection Widget
                  </span>
                  <span className="text-emerald-700 bg-emerald-100 px-1 py-0.5 text-[9px]">
                    Active Salt
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#121212]/80 truncate">
                  <span className="text-[#121212]/50">SHA-256: </span>
                  <span className="font-semibold text-[#121212]">{liveHash}</span>
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-[#121212]/60 font-mono">
                  <span>Salt: SMART_PROCURE_2026</span>
                  <span>&bull;</span>
                  <span>Rounds: 10,000 PBKDF2</span>
                  <span>&bull;</span>
                  <span>HMAC-SHA256 Sign</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer System Status Ribbon */}
      <footer className="border-t border-[#121212]/10 bg-white/70 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#121212]/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Enterprise Gateway Online &bull; Spring Boot 3.3.0 &bull; PostgreSQL 16</span>
          </div>
          <div>
            <span>SmartProcure &copy; 2026 Enterprise Procurement & PO Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
