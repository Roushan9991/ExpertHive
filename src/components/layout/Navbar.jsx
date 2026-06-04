import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Wheat, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm transition-all duration-200">
      <div className="flex items-center gap-8">
        <NavLink to="/" className="font-h2 text-h2 font-black tracking-tight text-[#012d1d] hover:opacity-90 transition-opacity flex items-center gap-2">
          <Wheat className="h-6 w-6 text-emerald-600 animate-pulse" />
          <span>Expert<span className="text-emerald-600">Hive</span></span>
        </NavLink>
        <div className="hidden md:flex items-center gap-6 ml-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `font-body-md text-sm font-semibold transition-all duration-200 py-1 ${isActive ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'text-slate-600 hover:text-emerald-700'}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/experts"
            className={({ isActive }) =>
              `font-body-md text-sm font-semibold transition-all duration-200 py-1 ${isActive ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'text-slate-600 hover:text-emerald-700'}`
            }
          >
            Explore Experts
          </NavLink>
          <NavLink
            to="/apply-expert"
            className={({ isActive }) =>
              `font-body-md text-sm font-semibold transition-all duration-200 py-1 ${isActive ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'text-slate-600 hover:text-emerald-700'}`
            }
          >
            Become an Expert
          </NavLink>
          <NavLink
            to="/data-insights"
            className={({ isActive }) =>
              `font-body-md text-sm font-semibold transition-all duration-200 py-1 ${isActive ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'text-slate-600 hover:text-emerald-700'}`
            }
          >
            Data Insights
          </NavLink>
          {user && (
            <NavLink
              to={user.role === 'admin' ? '/admin' : '/dashboard'}
              className={({ isActive }) =>
                `font-body-md text-sm font-semibold transition-all duration-200 py-1 ${isActive ? 'text-emerald-700 font-bold border-b-2 border-emerald-600' : 'text-slate-600 hover:text-emerald-700'}`
              }
            >
              Dashboard
            </NavLink>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/profile" className="font-semibold text-sm text-slate-700 hover:text-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              Hi, {user.name}
            </Link>
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  logout();
                }
              }} 
              className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors px-4 py-2 rounded-xl border border-rose-100"
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')} 
            className="text-sm font-bold text-white bg-[#012d1d] hover:bg-[#03442c] transition-all duration-200 px-5 py-2 rounded-xl shadow-md shadow-emerald-950/10 hover:shadow-emerald-950/20 hidden sm:block"
          >
            Login / Register
          </button>
        )}

        <button className="md:hidden text-slate-800 p-2 hover:bg-slate-100 rounded-lg transition-colors" onClick={toggleMenu}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 w-full bg-white border-b border-slate-200/80 shadow-xl flex flex-col p-6 md:hidden z-50"
          >
            <Link to="/" onClick={toggleMenu} className="py-3.5 border-b border-slate-100 font-semibold text-slate-700 hover:text-emerald-700 transition-colors">Home</Link>
            <Link to="/experts" onClick={toggleMenu} className="py-3.5 border-b border-slate-100 font-semibold text-slate-700 hover:text-emerald-700 transition-colors">Find Experts</Link>
            <Link to="/apply-expert" onClick={toggleMenu} className="py-3.5 border-b border-slate-100 font-semibold text-slate-700 hover:text-emerald-700 transition-colors">Become an Expert</Link>
            <Link to="/data-insights" onClick={toggleMenu} className="py-3.5 border-b border-slate-100 font-semibold text-slate-700 hover:text-emerald-700 transition-colors">Data Insights</Link>
            {user && (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={toggleMenu} className="py-3.5 border-b border-slate-100 font-semibold text-slate-700 hover:text-emerald-700 transition-colors">Dashboard</Link>
            )}
            <div className="pt-6 flex flex-col gap-4">
              {user ? (
                <>
                  <Link to="/profile" onClick={toggleMenu} className="font-semibold text-sm text-slate-700 hover:text-emerald-700 flex items-center gap-2 self-center">
                    <User className="h-4 w-4 text-emerald-600" />
                    Profile ({user.name})
                  </Link>
                  <button onClick={() => {
                    if (window.confirm('Are you sure you want to logout?')) {
                      logout();
                      toggleMenu();
                    }
                  }} className="w-full font-bold text-center text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors py-2.5 rounded-xl border border-rose-100">Logout</button>
                </>
              ) : (
                <button onClick={() => { navigate('/login'); toggleMenu(); }} className="w-full font-bold text-center text-white bg-[#012d1d] hover:bg-[#03442c] transition-all duration-200 py-2.5 rounded-xl">Login / Register</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
