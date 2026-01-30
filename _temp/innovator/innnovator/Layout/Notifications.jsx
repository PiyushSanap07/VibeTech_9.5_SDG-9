import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { Bell, Info, AlertTriangle, CheckCircle, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "notifications"), 
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    return unsubscribe;
  }, []);

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'High': return 'border-l-4 border-red-500 bg-red-50/50';
      case 'Medium': return 'border-l-4 border-amber-500 bg-amber-50/50';
      default: return 'border-l-4 border-indigo-500 bg-indigo-50/50';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'funded': return <CheckCircle className="text-emerald-500" size={18} />;
      case 'matched': return <Info className="text-indigo-500" size={18} />;
      case 'milestone': return <AlertTriangle className="text-amber-500" size={18} />;
      default: return <Bell className="text-slate-400" size={18} />;
    }
  };

  return (
    <div className="premium-card !rounded-[2.5rem] w-96 max-h-[500px] overflow-hidden flex flex-col shadow-2xl">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-primary-600" size={18} />
          <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Intelligence Feed</h3>
        </div>
        <span className="bg-primary-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
          {notifications.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-slate-200">
              <Bell size={24} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">
              No new intel
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            <AnimatePresence initial={false}>
              {notifications.map((n, i) => (
                <motion.div 
                  key={n.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-6 transition-all hover:bg-white ${getPriorityStyles(n.priority)}`}
                >
                  <div className="flex space-x-4">
                    <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">{n.message}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-300 uppercase">
                          {n.createdAt?.toDate() ? new Date(n.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${
                           n.priority === 'High' ? 'text-red-600 border-red-100 bg-red-50' : 
                           n.priority === 'Medium' ? 'text-amber-600 border-amber-100 bg-amber-50' :
                           'text-indigo-600 border-indigo-100 bg-indigo-50'
                        }`}>
                          {n.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      {notifications.length > 0 && (
        <button className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-t border-slate-50 hover:text-primary-600 hover:bg-slate-50 transition-all">
          Mark all as read
        </button>
      )}
    </div>
  );
};

export default Notifications;
