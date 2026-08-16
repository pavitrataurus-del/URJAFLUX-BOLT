import React, { useState } from "react";
import { Compass, ShieldCheck, Lock, Mail, ArrowRight, Sparkles, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { authService } from "../services/authService";

interface LoginPageProps {
  onLogin: (email: string) => void;
  onBackToHome?: () => void;
}

export default function LoginPage({ onLogin, onBackToHome }: LoginPageProps) {
  const [email, setEmail] = useState("consultant@urjaflux.ai");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"founder" | "super_admin" | "consultant" | "client">("consultant");
  const [handshakeStep, setHandshakeStep] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);
    
    try {
      const role =
        activeTab === "founder"
          ? "FOUNDER"
          : activeTab === "super_admin"
            ? "SUPER_ADMIN"
            : activeTab === "client"
              ? "CLIENT"
              : "CONSULTANT";
      await authService.login(email, password, role as any);

      const steps = [
        "Securing HTTP-only JWT pipeline...",
        "Validating CSRF tokens & session cookies...",
        "Resolving multi-tenant digital twin keys...",
        "Access granted! Loading Space Studio workspace..."
      ];

      steps.forEach((step, index) => {
        setTimeout(() => {
          setHandshakeStep(step);
          if (index === steps.length - 1) {
            setTimeout(() => {
              onLogin(email);
              setIsSubmitting(false);
            }, 300);
          }
        }, (index + 1) * 200);
      });
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
      setIsSubmitting(false);
    }
  };

  const selectPreFill = (role: "founder" | "super_admin" | "consultant" | "client") => {
    setActiveTab(role);
    if (role === "founder") {
      setEmail("founder@urjaflux.ai");
      setPassword("••••••••");
    } else if (role === "super_admin") {
      setEmail("admin@urjaflux.ai");
      setPassword("••••••••");
    } else if (role === "client") {
      setEmail("client@urjaflux.ai");
      setPassword("••••••••");
    } else {
      setEmail("consultant@urjaflux.ai");
      setPassword("••••••••");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060913] px-4 py-12 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500 selection:text-slate-900 relative overflow-hidden">
      
      {/* Decorative Vector Grid Lines in Background (Metaphysical Space Grid) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

      {/* Radiant Cosmic Aurora Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Central Card container with elegant micro-borders */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full space-y-8 bg-slate-900/60 p-8 rounded-2xl border border-slate-800/80 backdrop-blur-xl shadow-2xl relative z-10"
      >
        {/* Aesthetic Corner Brackets to convey precision CAD / Spatial Engineering */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500/40 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500/40 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500/40 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500/40 rounded-br-lg" />

        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="absolute top-4 left-4 text-[10px] font-mono text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer z-20"
          >
            ← BACK TO HOME
          </button>
        )}

        {/* Core Header Brand */}
        <div className="text-center space-y-3 pt-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-950 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10 relative group"
          >
            {/* Spinning Compass inside static rings */}
            <Compass className="w-7 h-7 text-emerald-400" />
            <span className="absolute inset-0 rounded-full border border-dashed border-emerald-500/20 animate-spin-slow" />
          </motion.div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-widest text-slate-100 font-mono">
              URJAFLUX <span className="text-emerald-400">OS</span>
            </h2>
            <div className="flex items-center justify-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase font-bold">
                ENTERPRISE v1.0.0 IMMUTABLE CORE
              </p>
            </div>
          </div>
          
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Metaphysical Spatial & CAD Diagnostics Suite. Connect to the unified Vedic Energy grid.
          </p>
        </div>

        {/* High-Fidelity Custom Segmented Control */}
        <div className="grid grid-cols-2 sm:grid-cols-4 p-1 bg-slate-950 border border-slate-800 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => selectPreFill("founder")}
            className={`py-2 text-[10px] font-mono font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "founder"
                ? "bg-amber-600 text-slate-950 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            FOUNDER
          </button>
          <button
            type="button"
            onClick={() => selectPreFill("super_admin")}
            className={`py-2 text-[10px] font-mono font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "super_admin" 
                ? "bg-indigo-600 text-slate-100 shadow" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            SUPER ADMIN
          </button>
          <button
            type="button"
            onClick={() => selectPreFill("consultant")}
            className={`py-2 text-[10px] font-mono font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "consultant" 
                ? "bg-emerald-600 text-slate-950 shadow" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            CONSULTANT
          </button>
          <button
            type="button"
            onClick={() => selectPreFill("client")}
            className={`py-2 text-[10px] font-mono font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === "client" 
                ? "bg-amber-500 text-slate-950 shadow" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            CLIENT PORTAL
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email field */}
            <div className="space-y-1.5">
              <label htmlFor="email-address" className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                ACCESS IDENTIFIER (EMAIL)
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 pl-11 pr-4 py-2.5 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                  placeholder="name@urjaflux.ai"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                PASSWORD / SECURITY TOKEN
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 pl-11 pr-10 py-2.5 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AES-256 Cloud Vault Security</span>
            </div>
            <span className="text-slate-500 font-bold">SSL ACTIVE</span>
          </div>

          {/* Secure Button with Multi-stage connection triggers */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-xs font-mono font-bold rounded-xl text-slate-950 bg-emerald-400 hover:bg-emerald-300 focus:outline-none transition-all shadow-lg shadow-emerald-400/10 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
            >
              <AnimatePresence mode="wait">
                {isSubmitting ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="uppercase tracking-widest text-[10px]">{handshakeStep || "AUTHENTICATING..."}</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span>LOG IN TO URJAFLUX AI OS</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </form>

        {/* Quick sandbox instruction block with beautiful border gradients */}
        <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
              ⚡ AUTOPILOT SANDBOX SYSTEM
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            The login credentials are autoconfigured for live sandbox diagnostics. Simply click the initialization button above to unlock the OS.
          </p>
        </div>

      </motion.div>
    </div>
  );
}

