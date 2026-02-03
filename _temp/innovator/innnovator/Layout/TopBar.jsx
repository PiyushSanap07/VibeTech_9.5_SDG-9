import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { LogOut, Bell, Search } from 'lucide-react';
import Notifications from './Notifications';
import { motion, AnimatePresence } from 'framer-motion';

const TopBar = ({ user }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <header className="h-20 flex items-center px-8 bg-transparent sticky top-0 z-40 backdrop-blur-sm">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search funders, innovations, or proposals..." 
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all shadow-sm" 
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 text-slate-500 hover:text-primary-600 hover:bg-white rounded-2xl transition-all duration-300 relative group shadow-sm border border-transparent hover:border-slate-100"
          >
            <Bell size={22} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-primary-500 rounded-full border-2 border-[#F8FAFC]" />
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 z-50 origin-top-right"
              >
                <Notifications />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={handleLogout}
          className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 shadow-sm border border-transparent hover:border-red-100"
        >
          <LogOut size={22} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
