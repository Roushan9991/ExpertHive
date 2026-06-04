import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Trophy, 
  Briefcase, 
  Clock, 
  Sparkles, 
  Star, 
  Users, 
  CheckCircle2, 
  MessageSquare, 
  ChevronDown, 
  GraduationCap, 
  Wheat, 
  TrendingUp, 
  Coins,
  ArrowUpRight,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlatformStats } from '../data/mockData';
import { AgriVisualizer } from '../components/AgriVisualizer';

const featureCards = [
  { 
    title: 'Verified Expert Badge', 
    description: 'Connect with professionals strictly vetted for real-world agricultural experience.', 
    icon: ShieldCheck,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
  },
  { 
    title: 'Session Ratings', 
    description: 'Read reviews and browse ratings left by students for every completed session.', 
    icon: Trophy,
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
  },
  { 
    title: 'Consultation History', 
    description: 'Track total guidance sessions and expert portfolios to select the perfect mentor.', 
    icon: Briefcase,
    color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
  },
  { 
    title: 'Customer Support', 
    description: 'Enjoy dedicated session support. Write directly to support@experthive.co.in.', 
    icon: Clock,
    color: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
  },
];

const audienceItems = [
  { name: 'Students', desc: 'Find clarity in agricultural courses and projects.', icon: GraduationCap },
  { name: 'MBA Aspirants', desc: 'Prepare for top agribusiness management programs.', icon: BookOpen },
  { name: 'Interns', desc: 'Navigate corporate internships with professional coaching.', icon: Briefcase },
  { name: 'Early Professionals', desc: 'Accelerate your career in supply chain and agronomy.', icon: TrendingUp },
  { name: 'Career Switchers', desc: 'Smoothly transition into the agricultural sector.', icon: Coins },
  { name: 'Job Seekers', desc: 'Build interview readiness and clean up your resume.', icon: Users },
];

const faqItems = [
  {
    question: 'How do mentoring sessions work?',
    answer: 'Browse verified experts on our platform, choose a slot that fits your schedule, book in a few clicks, and receive an automated calendar invite with a secure Zoom meeting link for your 1-on-1 session.',
  },
  {
    question: 'How does the expert verification process work?',
    answer: 'Every expert is manually evaluated before approval. We review background credentials, verified roles in agribusiness, domain expertise (like crop science or logistics), and monitor student ratings to ensure premium guidance.',
  },
  {
    question: 'Can students get customized interview or resume preparation?',
    answer: 'Absolutely. During booking, you can enter custom notes details outlining what you need—such as review of a paddy project, feedback on a resume, mock interviews, or ag-tech career advice.',
  },
  {
    question: 'How do experts set up their accounts and earn?',
    answer: 'Experts can apply using the "Become an Expert" form. Once verified and approved, you can log in, set your specific availability, consult learners, and get direct payouts for your time and shared knowledge.',
  },
];

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200/80 py-4 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left font-semibold text-slate-800 py-2 hover:text-emerald-700 transition-colors duration-200"
      >
        <span className="text-base sm:text-lg">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="text-emerald-600 bg-emerald-500/10 p-1.5 rounded-full"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-4 pt-2 text-slate-600 leading-relaxed text-sm sm:text-base">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Home = () => {
  const [stats, setStats] = useState({ totalExperts: 0, totalConsultations: 0, averageRating: '0.0' });

  useEffect(() => {
    getPlatformStats().then(setStats);
  }, []);

  // Set default values if database returns 0 or empty for demo visual quality
  const displayExperts = stats.totalExperts > 0 ? stats.totalExperts : 48;
  const displayConsultations = stats.totalConsultations > 0 ? stats.totalConsultations : 320;
  const displayRating = stats.averageRating !== '0.0' ? stats.averageRating : '4.9';

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <main className="flex-grow bg-slate-50 overflow-x-hidden pt-16">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-b from-[#012d1d] via-[#021f14] to-[#043322] text-white py-12 md:py-24 lg:py-32 overflow-hidden">
        {/* Abstract Glowing Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f3a2c_1px,transparent_1px),linear-gradient(to_bottom,#0f3a2c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />
        
        {/* Soft blur orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8 flex flex-col items-start"
            >
              <motion.div 
                variants={fadeIn}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-300 backdrop-blur-md shadow-inner"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>Bridging class learning with real-world Agribusiness</span>
              </motion.div>

              <motion.h1 
                variants={fadeIn}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-left"
              >
                Learn from <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent">Professionals</span>.<br className="hidden sm:inline" />
                Grow with <span className="bg-gradient-to-r from-amber-300 via-emerald-300 to-emerald-400 bg-clip-text text-transparent font-extrabold">Real Experience</span>.
              </motion.h1>

              <motion.p 
                variants={fadeIn}
                className="text-slate-300 text-base sm:text-lg max-w-xl leading-relaxed text-left"
              >
                Book 1-on-1 sessions with verified experts in Agronomy, Agri-Supply Chains, and Agribusiness. Gain insights that go far beyond standard textbooks.
              </motion.p>

              <motion.div 
                variants={fadeIn}
                className="flex flex-wrap gap-4 w-full sm:w-auto"
              >
                <Link 
                  to="/experts" 
                  className="group relative inline-flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-3.5 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-400/40 hover:-translate-y-0.5 w-full sm:w-auto"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explore Experts <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link 
                  to="/apply-expert" 
                  className="inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-3.5 border border-white/15 hover:border-white/30 transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm w-full sm:w-auto text-center"
                >
                  Become an Expert
                </Link>
              </motion.div>

              {/* Sub-features grid */}
              <motion.div 
                variants={fadeIn}
                className="grid gap-4 grid-cols-1 sm:grid-cols-3 pt-4 border-t border-slate-700/40 w-full"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100">Flexible Scheduling</h3>
                    <p className="text-slate-400 text-[11px] sm:text-xs">Pick slot times that fit student routines.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100">Industry Vetted</h3>
                    <p className="text-slate-400 text-[11px] sm:text-xs">Mentors verified from top ag companies.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100">Student Pricing</h3>
                    <p className="text-slate-400 text-[11px] sm:text-xs">Mentorship fee plans made affordable.</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Visualizer (3D canvas panel) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
              className="relative flex items-center justify-center"
            >
              <div className="w-full max-w-[500px] lg:max-w-none rounded-[2.5rem] p-3 bg-gradient-to-br from-white/10 to-white/0 border border-white/15 backdrop-blur-md shadow-2xl shadow-[#011a11]/80 overflow-hidden">
                <AgriVisualizer />
                
                {/* Float spotlight card */}
                <div className="absolute bottom-8 left-8 right-8 backdrop-blur-lg bg-[#012d1d]/80 border border-emerald-500/20 rounded-2xl p-4 shadow-2xl z-20 flex items-center justify-between transition-all duration-300 hover:border-emerald-500/40">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-700/30">
                      <Wheat className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-100 uppercase tracking-widest">Active Mentorship</p>
                      <p className="text-sm font-bold text-white">Agritech & Crop Networks</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded-md">
                      <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                      {displayRating}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">Satisfaction Rating</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. Platform Stats Overlap Banner */}
      <section className="relative z-20 -mt-10 px-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-xl shadow-slate-900/5">
          <div className="grid gap-8 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-center">
            
            <div className="pt-4 sm:pt-0 first:pt-0">
              <span className="block text-4xl sm:text-5xl font-black text-[#012d1d] tracking-tight">{displayExperts}+</span>
              <span className="block text-slate-500 font-semibold text-sm sm:text-base mt-1">Verified Mentors</span>
              <span className="block text-slate-400 text-xs mt-1">Vetted agribusiness experts</span>
            </div>

            <div className="pt-6 sm:pt-0">
              <span className="block text-4xl sm:text-5xl font-black text-[#012d1d] tracking-tight">{displayConsultations}+</span>
              <span className="block text-slate-500 font-semibold text-sm sm:text-base mt-1">Consultations Offered</span>
              <span className="block text-slate-400 text-xs mt-1">1-on-1 scheduled sessions</span>
            </div>

            <div className="pt-6 sm:pt-0">
              <span className="block text-4xl sm:text-5xl font-black text-[#012d1d] tracking-tight">{displayRating} / 5</span>
              <span className="block text-slate-500 font-semibold text-sm sm:text-base mt-1">Average Student Rating</span>
              <span className="block text-slate-400 text-xs mt-1">High quality learning guarantee</span>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Steps / How it Works Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="text-center space-y-4 max-w-3xl mx-auto mb-16"
        >
          <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-emerald-600 bg-emerald-500/10 px-3.5 py-1.5 rounded-full">Seamless Flow</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Simple Steps for Learners & Experts</h2>
          <p className="text-slate-600 text-base sm:text-lg">
            ExpertHive coordinates calendar sessions, automated reminders, and remote web meetings, letting you focus fully on standard career growth.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Student Steps */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🎓</span>
                <h3 className="text-2xl font-bold text-slate-950">For Learners</h3>
              </div>
              <div className="space-y-6 relative border-l border-emerald-500/20 pl-6 ml-3">
                
                <div className="relative">
                  <span className="absolute -left-[35px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs">1</span>
                  <h4 className="font-bold text-slate-900 text-base">Find an Expert</h4>
                  <p className="text-slate-500 text-sm mt-1">Browse verified experts across specific agricultural specializations, read ratings, and view profile fields.</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[35px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs">2</span>
                  <h4 className="font-bold text-slate-900 text-base">Choose Slots & Book</h4>
                  <p className="text-slate-500 text-sm mt-1">Select a matching time block, fill in consultation topics, and make an instant, safe payment.</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[35px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs">3</span>
                  <h4 className="font-bold text-slate-900 text-base">Attend 1-on-1 Zoom</h4>
                  <p className="text-slate-500 text-sm mt-1">Join the web call directly from your student dashboard. Receive actionable mentor advice tailored to your goals.</p>
                </div>

              </div>
            </div>
            
            <Link to="/experts" className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#012d1d] hover:bg-[#03442c] text-white font-semibold py-3 px-6 transition-all duration-300 w-full">
              Explore Available Experts
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Expert Steps */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">👨‍💼</span>
                <h3 className="text-2xl font-bold text-slate-950">For Industry Experts</h3>
              </div>
              <div className="space-y-6 relative border-l border-emerald-500/20 pl-6 ml-3">
                
                <div className="relative">
                  <span className="absolute -left-[35px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs">1</span>
                  <h4 className="font-bold text-slate-900 text-base">Apply & Build Profile</h4>
                  <p className="text-slate-500 text-sm mt-1">Fill in the quick application form detailing your experiences, fee rate, and specific ag fields.</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[35px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs">2</span>
                  <h4 className="font-bold text-slate-900 text-base">Define Hours Availability</h4>
                  <p className="text-slate-500 text-sm mt-1">Access your dashboard calendar to update available mentoring slots that match your busy routine.</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[35px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs">3</span>
                  <h4 className="font-bold text-slate-900 text-base">Mentor & Earn</h4>
                  <p className="text-slate-500 text-sm mt-1">Share professional insights to guide student careers and build your brand. Get paid securely for consultations.</p>
                </div>

              </div>
            </div>

            <Link to="/apply-expert" className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold py-3 px-6 transition-all duration-300 w-full border border-emerald-200">
              Apply to Become an Expert
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>

        </div>
      </section>

      {/* 4. Target Audience Section */}
      <section className="bg-white py-16 md:py-24 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center space-y-4 max-w-3xl mx-auto mb-16"
          >
            <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-emerald-600 bg-emerald-500/10 px-3.5 py-1.5 rounded-full">Tailored Mentorship</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Who is ExpertHive Designed For?</h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Mentorship should never be one-size-fits-all. Find tailored guidance to matches your exact career milestone.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {audienceItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group rounded-3xl bg-slate-50 hover:bg-white p-6 border border-slate-200/50 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 mb-5 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors duration-200">{item.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. Trust Badges / Value Prop Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          
          <div className="space-y-6">
            <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-emerald-600 bg-emerald-500/10 px-3.5 py-1.5 rounded-full">Core Principles</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">The Value You Get is Real Practical Guidance</h2>
            <p className="text-slate-600 text-base leading-relaxed">
              We move beyond textbook theories. Get direct exposure to real supply chain logistics, crop science validation, and professional career pathways.
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-1 rounded-full text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-slate-700 font-semibold text-sm">Direct industry exposure, no generic syllabi</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-1 rounded-full text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-slate-700 font-semibold text-sm">1-on-1 focus directly on your projects</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-1 rounded-full text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-slate-700 font-semibold text-sm">Affordable pay-as-you-go sessions</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {featureCards.map(({ title, description, icon: Icon, color }) => (
              <div 
                key={title} 
                className="rounded-3xl bg-white p-6 border border-slate-200/50 hover:border-slate-300 transition-all duration-300 hover:shadow-md"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${color} mb-5`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section className="bg-white py-16 md:py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center space-y-4 max-w-3xl mx-auto mb-16"
          >
            <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-emerald-600 bg-emerald-500/10 px-3.5 py-1.5 rounded-full">Success Stories</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Vouched by Learners</h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Read how 1-on-1 consultations provided students with agribusiness clarity.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            
            <div className="rounded-3xl border border-slate-200/60 bg-slate-50 p-8 shadow-sm flex flex-col justify-between hover:border-emerald-500/20 hover:bg-white transition-all duration-300 group">
              <div>
                <div className="flex gap-1 text-amber-400 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="font-semibold text-slate-800 text-lg leading-relaxed italic">
                  "My mentor helped me understand the agricultural logistics and prepare for my upcoming internship presentation at ITC Limited. I could not have gotten this insight elsewhere."
                </p>
              </div>
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-200/60">
                <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition-transform duration-300">
                  GG
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Ganesh G</h4>
                  <p className="text-slate-500 text-xs">Intern @ ITC Limited (Agribusiness Division)</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/60 bg-slate-50 p-8 shadow-sm flex flex-col justify-between hover:border-emerald-500/20 hover:bg-white transition-all duration-300 group">
              <div>
                <div className="flex gap-1 text-amber-400 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="font-semibold text-slate-800 text-lg leading-relaxed italic">
                  "The session gave me the confidence to switch from pure academic learning into a hands-on marketing role. The feedback on my resume was incredibly detailed."
                </p>
              </div>
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-slate-200/60">
                <div className="w-11 h-11 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition-transform duration-300">
                  P
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Priya</h4>
                  <p className="text-slate-500 text-xs">Agribusiness Student @ MANAGE Hyderabad</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. FAQ & Call to Action Split */}
      <section className="bg-slate-50 py-16 md:py-24 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          
          {/* FAQ Accordions */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-10 border border-slate-200/50 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">FAQ</h2>
            <p className="text-slate-500 text-sm sm:text-base mb-6">Frequently asked questions about session scheduling, payment policies, and validation.</p>
            
            <div className="space-y-1">
              {faqItems.map((item) => (
                <FAQItem key={item.question} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>

          {/* Glowing Call to Action */}
          <div className="rounded-[2rem] bg-gradient-to-br from-[#012d1d] via-[#021f14] to-[#043322] text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c382a_1px,transparent_1px),linear-gradient(to_bottom,#0c382a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[70px] pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                <Wheat className="h-3 w-3" />
                Agribusiness Network Portal
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">Ready to Connect with an Agribusiness Expert?</h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Connect directly with research heads, logistics managers, and farm agronomists. Booking is completely secured and schedules align automatically with your timezone.
              </p>
            </div>

            <div className="relative z-10 pt-8 sm:pt-12 flex flex-col sm:flex-row gap-4">
              <Link 
                to="/experts" 
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-4 shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Browse All Experts
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                to="/apply-expert" 
                className="inline-flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold px-6 py-4 border border-white/15 hover:border-white/30 transition-all duration-300 text-center"
              >
                Become a Mentor
              </Link>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};
