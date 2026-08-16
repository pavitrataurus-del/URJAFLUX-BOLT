import React, { useState } from "react";
import { 
  Compass, 
  ArrowRight, 
  Layers, 
  Cpu, 
  Activity, 
  Brain, 
  ShieldCheck, 
  Terminal, 
  Database,
  Building2,
  Workflow,
  Globe,
  UserCheck,
  Check,
  Mail,
  Phone,
  MapPin,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingPageProps {
  onLoginClick: () => void;
  onGoToDashboard?: () => void;
  isLoggedIn?: boolean;
}

export default function LandingPage({ onLoginClick, onGoToDashboard, isLoggedIn = false }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);
  const [demoSelectedDomain, setDemoSelectedDomain] = useState("Vastu Grid");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    }, 5000);
  };

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "Solutions", href: "#solutions" },
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" }
  ];

  const coreFeatures = [
    {
      icon: Compass,
      title: "Vastu & Vedic Spatial Analysis",
      description: "Advanced geometric analysis alignment using the 16 primary direction grids and the Vastu Purusha Mandala configuration."
    },
    {
      icon: Layers,
      title: "Interactive CAD Design Workspace",
      description: "A precision drawing interface featuring automatic snapping, architectural overlays, and real-time dimension parsing."
    },
    {
      icon: Cpu,
      title: "Microservices & Twin Pipelines",
      description: "Enterprise digital twin synchronization utilizing robust stream parsing, automated telemetry, and persistent metadata."
    },
    {
      icon: Brain,
      title: "Vedic AI Reasoner & Suggestion Engine",
      description: "Generates high-fidelity corrective actions, remedies, and room placements computed from holistic space geometry rules."
    },
    {
      icon: Workflow,
      title: "Workflow Automation & Pipelines",
      description: "Automate report compilation, design inspections, and compliance checks via dynamic orchestration nodes."
    },
    {
      icon: ShieldCheck,
      title: "Security & Compliance Audits",
      description: "Ironclad role-based access, automated system telemetry logs, and complete ledger records."
    }
  ];

  const solutions = [
    {
      title: "Corporate Headquarters & Commercial Complexes",
      desc: "Architectural layouts tailored for global enterprises to enhance corporate synergy, executive focus, and strategic alignment.",
      metrics: "Used by 45+ Commercial Real Estate Developers"
    },
    {
      title: "Premium Residential & Villa Estates",
      desc: "Immersive metaphysical design systems ensuring optimum spatial health, structural beauty, and residential well-being.",
      metrics: "1,200+ Smart Homes Globally Calibrated"
    },
    {
      title: "Industrial & Manufacturing Hubs",
      desc: "Optimizing material flow, power distribution alignments, and machinery positions under rigorous spatial rules.",
      metrics: "Reduces Operational Downtime by up to 18%"
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* Precision grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* Decorative Aura Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070b13]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* Logo (Left) */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md relative overflow-hidden">
              <Compass className="w-5 h-5 text-emerald-400 group-hover:rotate-45 transition-transform duration-500" />
              <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-widest font-mono text-slate-100 leading-none">URJAFLUX</h1>
              <span className="text-[9px] font-mono text-emerald-500 font-bold tracking-widest uppercase mt-1 block">AI OS ENTERPRISE</span>
            </div>
          </a>

          {/* Nav Links (Middle) */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-mono tracking-wider text-slate-400 hover:text-emerald-400 transition-colors uppercase"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Top Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={onGoToDashboard || onLoginClick}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono tracking-wider uppercase font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  GO TO DASHBOARD
                </button>
                <button
                  onClick={onLoginClick}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono tracking-wider uppercase font-bold transition-all cursor-pointer"
                >
                  SWITCH ACCOUNT
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-6 py-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-400 text-emerald-300 hover:text-slate-950 text-xs font-mono tracking-wider uppercase font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                LOGIN
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-slate-800 bg-[#070b13]/95 backdrop-blur-lg overflow-hidden"
            >
              <div className="px-6 py-8 space-y-4 flex flex-col">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-mono tracking-wider text-slate-300 hover:text-emerald-400 transition-colors uppercase py-2 border-b border-slate-800/40"
                  >
                    {link.label}
                  </a>
                ))}
                {isLoggedIn ? (
                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onGoToDashboard) onGoToDashboard();
                      }}
                      className="w-full text-center py-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-mono tracking-wider uppercase font-bold transition-all"
                    >
                      GO TO DASHBOARD
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLoginClick();
                      }}
                      className="w-full text-center py-3 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 text-xs font-mono tracking-wider uppercase font-bold transition-all"
                    >
                      SWITCH ACCOUNT
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLoginClick();
                    }}
                    className="w-full text-center py-3 rounded-xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 text-xs font-mono tracking-wider uppercase font-bold transition-all mt-4"
                  >
                    LOGIN
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section id="home" className="relative py-20 lg:py-32 flex flex-col justify-center min-h-[calc(100vh-5rem)]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-emerald-500/20 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold">THE FIRST COGNITIVE METAPHYSICAL CAD PLATFORM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-100">
              Harmonize Spatial Architecture. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400">
                Calibrate Spatial Energy.
              </span>
            </h1>

            <p className="text-base text-slate-400 leading-relaxed max-w-2xl">
              URJAFLUX AI OS connects deep Vedic spatial algorithms with real-time CAD engines. Designed for global real estate corporations, elite consulting firms, and commercial visionaries to create architecturally stable and energetically flawless spatial structures.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onLoginClick}
                className="px-8 py-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-mono text-xs tracking-wider uppercase font-bold transition-all shadow-lg shadow-emerald-400/20 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>ENTER CONSOLE</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#features"
                className="px-8 py-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 font-mono text-xs tracking-wider uppercase font-bold transition-all text-center"
              >
                EXPLORE CAPABILITIES
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-6">
              <div>
                <p className="text-2xl font-bold text-slate-100 font-mono">100%</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Vedic Alignment</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100 font-mono">19</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Domain Engines</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100 font-mono">1.2k+</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Calibrations</p>
              </div>
            </div>
          </div>

          {/* Hero Right Canvas / Mockup (Figma-style visual CAD simulation) */}
          <div className="lg:col-span-5 relative">
            <div className="w-full aspect-square max-w-[480px] mx-auto bg-slate-950 border border-slate-800/80 rounded-2xl p-4 relative overflow-hidden shadow-2xl">
              {/* Grid backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-30" />
              
              {/* CAD Window Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider ml-2">vastu_digital_twin.dwg</span>
                </div>
                <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded uppercase font-bold">16 ZONE CALIBRATION ACTIVE</span>
              </div>

              {/* Graphic Vastu Chakra Circle */}
              <div className="relative w-full h-[320px] flex items-center justify-center">
                {/* Outer Compass Ring */}
                <div className="absolute w-[240px] h-[240px] rounded-full border border-dashed border-slate-800 flex items-center justify-center animate-spin-slow" />
                <div className="absolute w-[210px] h-[210px] rounded-full border border-emerald-500/20 flex items-center justify-center" />
                <div className="absolute w-[180px] h-[180px] rounded-full border border-slate-800 flex items-center justify-center" />

                {/* 16 Cardinal Axis Lines */}
                <div className="absolute w-[220px] h-[1px] bg-slate-800/50" />
                <div className="absolute h-[220px] w-[1px] bg-slate-800/50" />
                <div className="absolute w-[220px] h-[1px] bg-slate-800/30 rotate-45" />
                <div className="absolute w-[220px] h-[1px] bg-slate-800/30 -rotate-45" />
                <div className="absolute w-[220px] h-[1px] bg-slate-800/10 rotate-[22.5deg]" />
                <div className="absolute w-[220px] h-[1px] bg-slate-800/10 rotate-[67.5deg]" />
                <div className="absolute w-[220px] h-[1px] bg-slate-800/10 -rotate-[22.5deg]" />
                <div className="absolute w-[220px] h-[1px] bg-slate-800/10 -rotate-[67.5deg]" />

                {/* Simulated blueprint walls inside */}
                <div className="absolute w-28 h-28 border border-emerald-500/40 bg-emerald-500/5 flex items-center justify-center font-mono text-[9px] text-slate-400 rotate-12">
                  <span>Brahmastan</span>
                  {/* Snapping dot */}
                  <div className="absolute top-0 left-0 w-2 h-2 bg-emerald-400 border border-slate-950" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border border-slate-950" />
                </div>

                {/* Glowing target crosshair */}
                <div className="absolute w-8 h-8 flex items-center justify-center pointer-events-none">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <div className="absolute w-6 h-6 rounded-full border border-emerald-500 animate-ping" />
                </div>

                {/* North indicator */}
                <div className="absolute top-1 font-mono text-[9px] font-bold text-emerald-400 tracking-widest bg-slate-950 px-1">N 0.0°</div>
                <div className="absolute bottom-1 font-mono text-[8px] text-slate-500">S 180.0°</div>
                <div className="absolute left-1 font-mono text-[8px] text-slate-500">W 270.0°</div>
                <div className="absolute right-1 font-mono text-[8px] text-slate-500">E 90.0°</div>
              </div>

              {/* Status bar */}
              <div className="mt-4 flex items-center justify-between text-[8px] font-mono text-slate-500 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>GRID SYNCED</span>
                </div>
                <span>CURSOR: X: 142.45m Y: -32.81m</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= WHAT IS URJAFLUX ================= */}
      <section className="py-20 bg-slate-900/30 border-y border-slate-800/50">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <span className="text-[10px] font-mono text-emerald-400 tracking-widest font-bold uppercase">ENTERPRISE PURPOSE</span>
          <h2 className="text-3xl font-black text-slate-100">The Convergence of Science and Vastu Sastra</h2>
          <p className="text-slate-400 leading-relaxed text-base">
            URJAFLUX is not a simple drafting tool, nor is it a conceptual database. It is a highly specialized Spatial AI Operating System. By computing physical geometry coordinates alongside ancient electromagnetic alignments, URJAFLUX enables real estate managers, architects, and designers to audit, fix, and align environments for optimal human performance, safety, and operational excellence.
          </p>
        </div>
      </section>

      {/* ================= CORE FEATURES ================= */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <span className="text-[10px] font-mono text-emerald-400 tracking-widest font-bold uppercase">ARCHITECTURAL GRID SYSTEMS</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100">Enterprise Features for Precision Auditing</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm">
              Discover the full suite of integrated modules designed to handle complicated CAD drawings and translate spatial layouts into energy matrices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={feat.title}
                  className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-xl relative group hover:border-emerald-500/40 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/30 group-hover:bg-slate-900 transition-all mb-6">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 mb-3 tracking-wider font-mono uppercase">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE URJAFLUX ================= */}
      <section className="py-24 bg-slate-900/20 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-6">
            <span className="text-[10px] font-mono text-emerald-400 tracking-widest font-bold uppercase">OPTIMAL SPACE COGNITION</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100">Why Global Enterprises Choose the URJAFLUX Framework</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Unlike classical CAD software which only ensures volumetric or structural integrity, URJAFLUX checks the subtle energetic and cardinal matrix of the property. This results in workspaces that minimize stress, improve throughput, and secure spatial stability.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">Automatic DXF / CAD Importer</h4>
                  <p className="text-xs text-slate-500">Upload standard architectural drafts and let our core engine construct spatial boundaries instantly.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">16-Zone Master Mandala Overlay</h4>
                  <p className="text-xs text-slate-500">Precisely segment spatial nodes with a custom rotational center and automated magnetic declination offsets.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">Enterprise Compliance Reports</h4>
                  <p className="text-xs text-slate-500">Compile gorgeous, customized audits with structured scoring models, charts, and downloadable PDF summaries.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
            
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Global Standards Engine</span>
            </h3>

            <div className="space-y-6">
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block mb-1">COMPLIANCE CODE</span>
                <p className="text-xs font-mono font-bold text-slate-200">IS-2592 (Indian Standard Building Code Alignment)</p>
                <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3">
                  <div className="bg-emerald-500 h-1.5 rounded-full w-[94%]" />
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block mb-1">SPATIAL ALIGNMENT ACCURACY</span>
                <p className="text-xs font-mono font-bold text-slate-200">Sub-Milimeter Boundary Mapping</p>
                <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3">
                  <div className="bg-emerald-500 h-1.5 rounded-full w-[99.8%]" />
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block mb-1">REMEDY DEPLOYMENT TIMELINE</span>
                <p className="text-xs font-mono font-bold text-slate-200">Instant Telemetry Feedback</p>
                <div className="w-full bg-slate-950 rounded-full h-1.5 mt-3">
                  <div className="bg-emerald-500 h-1.5 rounded-full w-[85%]" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= SOLUTIONS / INDUSTRIES SERVED ================= */}
      <section id="solutions" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <span className="text-[10px] font-mono text-emerald-400 tracking-widest font-bold uppercase">ENTERPRISE SEGMENTS</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100">Industries Served with High Distinction</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm">
              Tailoring the energetic calibration of commercial real estate, corporate offices, and ultra-high-net-worth family residences.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {solutions.map((sol, index) => (
              <div 
                key={sol.title} 
                className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-xl relative flex flex-col justify-between hover:border-slate-700/80 transition-all duration-300"
              >
                <div className="space-y-4">
                  <span className="text-xs font-mono font-bold text-emerald-400">0{index + 1}.</span>
                  <h3 className="text-sm font-bold tracking-wider font-mono uppercase text-slate-100">{sol.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{sol.desc}</p>
                </div>
                <div className="pt-6 border-t border-slate-800/50 mt-8">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">{sol.metrics}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= DEMO SECTION ================= */}
      <section className="py-24 bg-slate-900/10 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            <div className="lg:col-span-4 space-y-6">
              <span className="text-[10px] font-mono text-emerald-400 tracking-widest font-bold uppercase">LIVE DEMO CONSOLE</span>
              <h2 className="text-3xl font-black text-slate-100">Interactive Spatial Sandbox Preview</h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Click different visual domains below to simulate how the URJAFLUX AI core maps, audits, and corrects blueprint alignments in real-time.
              </p>

              <div className="space-y-2 pt-4">
                {["Vastu Grid", "Remedy Mapper", "Digital Twin Telemetry"].map((dom) => (
                  <button
                    key={dom}
                    onClick={() => setDemoSelectedDomain(dom)}
                    className={`w-full text-left px-4 py-3 rounded-xl border font-mono text-xs transition-all flex items-center justify-between cursor-pointer ${
                      demoSelectedDomain === dom
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{dom}</span>
                    <ArrowRight className={`w-4 h-4 transition-transform ${demoSelectedDomain === dom ? "translate-x-1" : ""}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 bg-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden min-h-[380px] flex flex-col justify-between">
              
              {/* Header inside simulated screen */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">PREVIEW MODE — ACTIVE COMPILATION</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Dynamic screen content depending on tab */}
              <div className="py-8 flex-1 flex flex-col justify-center">
                {demoSelectedDomain === "Vastu Grid" && (
                  <div className="space-y-4 max-w-lg mx-auto text-center">
                    <p className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-lg inline-block">
                      16 DIRECTION CHAKRA MAPPING
                    </p>
                    <h4 className="text-sm font-bold font-mono uppercase text-slate-200">Magnetic Grid Projection</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Computes angular coordinates based on geographic North. Segments the workspace into 16 cardinal and sub-cardinal zones to analyze room functions.
                    </p>
                    <div className="flex justify-center gap-4 pt-2 font-mono text-[10px] text-slate-500">
                      <span>Northeast (NE): Water Zone</span>
                      <span>•</span>
                      <span>Southwest (SW): Earth Zone</span>
                    </div>
                  </div>
                )}

                {demoSelectedDomain === "Remedy Mapper" && (
                  <div className="space-y-4 max-w-lg mx-auto text-center">
                    <p className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-lg inline-block">
                      AUTOMATED CORRECTIVE SUGGESTIONS
                    </p>
                    <h4 className="text-sm font-bold font-mono uppercase text-slate-200">Non-Destructive Energetic Balance</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Recommends elements, colors, and metal wire boundaries (brass, copper, iron) to isolate energy defects without structural alterations.
                    </p>
                    <div className="flex justify-center gap-4 pt-2 font-mono text-[10px] text-slate-500">
                      <span>Copper Wire: South-East (SE) Defect</span>
                      <span>•</span>
                      <span>Brass Wire: South-West (SW) Defect</span>
                    </div>
                  </div>
                )}

                {demoSelectedDomain === "Digital Twin Telemetry" && (
                  <div className="space-y-4 max-w-lg mx-auto text-center">
                    <p className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-lg inline-block">
                      IoT SENSOR & SPATIAL STACKS
                    </p>
                    <h4 className="text-sm font-bold font-mono uppercase text-slate-200">Real-time Telemetry Synchronization</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Links physical environmental variables (light levels, magnetic flux, thermal grids) into the CAD digital twin workspace for responsive calibration.
                    </p>
                    <div className="flex justify-center gap-4 pt-2 font-mono text-[10px] text-slate-500">
                      <span>Status: Synchronized</span>
                      <span>•</span>
                      <span>Last Ingestion: 2.1s ago</span>
                    </div>
                  </div>
                )}
              </div>

              {/* CAD command bar mockup */}
              <div className="bg-[#0c1220] border border-slate-800 p-3 rounded-lg flex items-center justify-between font-mono text-[10px]">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-emerald-400 font-bold">$</span>
                  <span>vastu --analyze --file="office_draft_v4.dxf"</span>
                </div>
                <span className="text-slate-500">ENTER</span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS PLACEHOLDER ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <span className="text-[10px] font-mono text-emerald-400 tracking-widest font-bold uppercase">VALUED ALIGNMENTS</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100">Testimonials from Industry Leaders</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm">
              Read how URJAFLUX has transformed corporate workspaces and multi-tenant highrises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900/20 border border-slate-800/80 p-8 rounded-xl space-y-6">
              <div className="flex items-center gap-1 text-emerald-400">
                <span>★★★★★</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Integrating URJAFLUX with our commercial AutoCAD designs allowed us to align our entire 12-story high-rise with regional magnetic grids. Our corporate tenants have reported a noticeable increase in employee satisfaction and clarity."
              </p>
              <div>
                <p className="text-xs font-mono font-bold text-slate-200 uppercase">Devendra K. Sharma</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Managing Director, Apex Estates</p>
              </div>
            </div>

            <div className="bg-slate-900/20 border border-slate-800/80 p-8 rounded-xl space-y-6">
              <div className="flex items-center gap-1 text-emerald-400">
                <span>★★★★★</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "As Vastu consultants, we previously did all calculations manually. With the URJAFLUX CAD studio, we can instantly import architectural files and generate high-fidelity corrective advice within minutes. A complete game-changer."
              </p>
              <div>
                <p className="text-xs font-mono font-bold text-slate-200 uppercase">Siddharth Vastu & Partners</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Chief Spatial Analyst</p>
              </div>
            </div>

            <div className="bg-slate-900/20 border border-slate-800/80 p-8 rounded-xl space-y-6">
              <div className="flex items-center gap-1 text-emerald-400">
                <span>★★★★★</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "The Digital Twin telemetry sync has helped our facilities team adjust light, heat, and air ventilation patterns to harmonize with the local mandala alignments. Outstanding executive layout and visual execution."
              </p>
              <div>
                <p className="text-xs font-mono font-bold text-slate-200 uppercase">Elena Rostova</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Head of Facilities, InnovaCorp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRICING PLACEHOLDER ================= */}
      <section id="pricing" className="py-24 bg-slate-900/20 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <span className="text-[10px] font-mono text-emerald-400 tracking-widest font-bold uppercase">ENTERPRISE PRICING PLAN</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100">Clear & Predictable Investments</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm">
              Select the appropriate tier to begin spatial energy auditing for your portfolio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Tier 1 */}
            <div className="bg-slate-950 border border-slate-800/80 p-8 rounded-xl flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Professional Tier</span>
                <h3 className="text-lg font-bold text-slate-200 font-mono">CONSULTANT</h3>
                <p className="text-3xl font-mono font-bold text-slate-100">$249<span className="text-xs text-slate-500"> / month</span></p>
                <p className="text-xs text-slate-400 leading-relaxed">Perfect for solo Vastu consultants, interior designers, and local architects.</p>
                <div className="w-full h-[1px] bg-slate-800/80 my-4" />
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">✔ 16-Zone Master Mandala</li>
                  <li className="flex items-center gap-2">✔ CAD DXF File Importer</li>
                  <li className="flex items-center gap-2">✔ Local Storage Support</li>
                  <li className="flex items-center gap-2">✔ Basic Report Export</li>
                </ul>
              </div>
              <button onClick={onLoginClick} className="w-full py-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider transition-all mt-8">
                SELECT CONSULTANT
              </button>
            </div>

            {/* Tier 2 */}
            <div className="bg-slate-950 border-2 border-emerald-500/40 p-8 rounded-xl flex flex-col justify-between relative">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-500 text-slate-950 text-[8px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded">
                RECOMMENDED ENTERPRISE
              </div>
              <div className="space-y-4">
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Standard Tier</span>
                <h3 className="text-lg font-bold text-slate-100 font-mono">ENTERPRISE</h3>
                <p className="text-3xl font-mono font-bold text-slate-100">$799<span className="text-xs text-slate-500"> / month</span></p>
                <p className="text-xs text-slate-400 leading-relaxed">Designed for medium real estate groups, spatial planning offices, and multi-disciplinary agencies.</p>
                <div className="w-full h-[1px] bg-slate-800/80 my-4" />
                <ul className="space-y-2 text-xs text-slate-200 font-semibold">
                  <li className="flex items-center gap-2 text-emerald-400">✔ Everything in Consultant</li>
                  <li className="flex items-center gap-2">✔ Digital Twin Telemetry Pipelines</li>
                  <li className="flex items-center gap-2">✔ Real-time Cloud Synchronization</li>
                  <li className="flex items-center gap-2">✔ Custom Branded Audits (PDF)</li>
                </ul>
              </div>
              <button onClick={onLoginClick} className="w-full py-2.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider transition-all mt-8">
                ACTIVATE ENTERPRISE
              </button>
            </div>

            {/* Tier 3 */}
            <div className="bg-slate-950 border border-slate-800/80 p-8 rounded-xl flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">High Scale Tier</span>
                <h3 className="text-lg font-bold text-slate-200 font-mono">CONGLOMERATE</h3>
                <p className="text-3xl font-mono font-bold text-slate-100">CUSTOM<span className="text-xs text-slate-500"> / annual</span></p>
                <p className="text-xs text-slate-400 leading-relaxed">Dedicated clusters, complete system logging, custom API access, and expert audit guidance.</p>
                <div className="w-full h-[1px] bg-slate-800/80 my-4" />
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">✔ Unlimited Spatial Twins</li>
                  <li className="flex items-center gap-2">✔ API SLA & Integration Suite</li>
                  <li className="flex items-center gap-2">✔ AI Governance Configurator</li>
                  <li className="flex items-center gap-2">✔ Dedicated 24/7 Account Engineers</li>
                </ul>
              </div>
              <button onClick={onLoginClick} className="w-full py-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider transition-all mt-8">
                REQUEST CUSTOM PROPOSAL
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section id="about" className="py-24 max-w-4xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <span className="text-[10px] font-mono text-emerald-400 tracking-widest font-bold uppercase">OUR HERITAGE & VISION</span>
          <h2 className="text-3xl font-black text-slate-100">Pioneers of Sacred Spatial Engineering</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Founded in 2024, URJAFLUX is dedicated to preserving the deep cognitive spatial alignment knowledge of the Vedic seers, and formalizing it inside standard high-performance software containers. Our engineering board compiles state-of-the-art WebGL rendering engines, computational geometry algorithms, and AI reasoning pipelines to deliver unmatched energetic insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <div className="bg-slate-900/20 border border-slate-800/60 p-6 rounded-xl space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase">Scientific Precision</h4>
            <p className="text-xs text-slate-500">Our directional math adjusts perfectly for local magnetic declination relative to true geographic North based on city coordinates.</p>
          </div>
          <div className="bg-slate-900/20 border border-slate-800/60 p-6 rounded-xl space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase">Ancient Authentication</h4>
            <p className="text-xs text-slate-500">Every suggestion is validated against authentic references like Samarangana Sutradhara, Mayamata, and Lal Kitab spaces.</p>
          </div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section id="contact" className="py-24 bg-slate-900/30 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Contact info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-mono text-emerald-400 tracking-widest font-bold uppercase">ESTABLISH COMMUNICATION</span>
              <h2 className="text-3xl font-black text-slate-100">Schedule an Energetic Audit</h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Connect with our sacred engineering board to discuss custom deployments, dedicated instances, or spatial audits of your corporate offices.
              </p>
            </div>

            <div className="space-y-4 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>enterprise@urjaflux.ai</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>+1 (800) 555-URJA</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Bramhastan Block, Cyber Towers, Hyd, IN</span>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 p-8 rounded-2xl relative">
            
            <AnimatePresence>
              {contactSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-center p-8 z-10"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold font-mono uppercase text-slate-200">Enquiry Broadcast Sent</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                    Thank you. Your message has been received and signed onto our secure database. A sacred planning engineer will contact you shortly.
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="e.g. Anand Vardhan"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="e.g. client@agency.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Enquiry Message</label>
                <textarea
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 font-mono resize-none"
                  placeholder="Describe your property footprint or corporate requirements..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                TRANSMIT SECURE INQUIRY
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-800 py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-mono font-bold tracking-widest text-slate-200">URJAFLUX AI OS</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              State-of-the-art computational Sacred Spatial Engineering for elite enterprise portfolios.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider mb-4">Modules</h4>
            <ul className="space-y-2 text-[11px] text-slate-500">
              <li><a href="#features" className="hover:text-emerald-400">Architecture Studio</a></li>
              <li><a href="#features" className="hover:text-emerald-400">Spatial CAD Engine</a></li>
              <li><a href="#features" className="hover:text-emerald-400">Vision AI Inspection</a></li>
              <li><a href="#features" className="hover:text-emerald-400">AI Governance Hub</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider mb-4">Enterprise</h4>
            <ul className="space-y-2 text-[11px] text-slate-500">
              <li><a href="#solutions" className="hover:text-emerald-400">Commercial Complex</a></li>
              <li><a href="#solutions" className="hover:text-emerald-400">Industrial Layouts</a></li>
              <li><a href="#pricing" className="hover:text-emerald-400">Custom Deployment</a></li>
              <li><a href="#pricing" className="hover:text-emerald-400">Security & Compliance</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider mb-4">Regulatory</h4>
            <ul className="space-y-2 text-[11px] text-slate-500 font-mono">
              <li>IS 2592 ALIGNED</li>
              <li>AES-256 ENCRYPTED</li>
              <li>COMMERCIAL LICENSE</li>
              <li>© 2026 URJAFLUX SYSTEM</li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-600 font-mono">
          <span>ALL RIGHTS RESERVED. MANIFESTED WITH SECURE SYSTEMS INTEGRATION IN CLOUD RUN.</span>
          <span className="mt-4 sm:mt-0">SECURE PORT 3000 CONSOLE LINK</span>
        </div>
      </footer>

    </div>
  );
}
