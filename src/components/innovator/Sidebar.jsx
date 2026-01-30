import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, User, Lightbulb, Users,
  MessageSquare, FileText, ListChecks, Wallet, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ user }) => {
  const location = useLocation();

  const navItems = [
    { path: '/innovator/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/innovator/profile', icon: User, label: 'Profile' },
    { path: '/innovator/innovations', icon: Lightbulb, label: 'Innovations' },
    { path: '/innovator/funders', icon: Users, label: 'Funders' },
    { path: '/innovator/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/innovator/proposals', icon: FileText, label: 'Proposals' },
    { path: '/innovator/milestones', icon: ListChecks, label: 'Milestones' },
    { path: '/innovator/wallet', icon: Wallet, label: 'Wallet' },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 shadow-premium">
      <div className="p-8">
        <Link to="/innovator/dashboard" className="flex items-center space-x-3 group">
          <div className="bg-primary-600 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary-500/30">
            <Sparkles size={24} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Innovator<span className="text-primary-600">Hub</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 group ${isActive
                ? 'text-primary-600 bg-primary-50/50'
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1.5 h-8 bg-primary-600 rounded-r-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon size={22} className={`${isActive ? 'text-primary-600' : 'group-hover:text-slate-900'}`} />
              <span className="tracking-tight uppercase text-[11px] font-black">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 font-black shadow-sm">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 truncate">Innovator Account</p>
            <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
