import React, { useState } from 'react';
import { Bell, Check, X, MessageSquare, Info } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { AnimatePresence, motion } from 'framer-motion';

const NavNotifications = () => {
    const { notifications, unreadCount } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    // Helper to get color/icon based on status
    const getStatusConfig = (status) => {
        switch (status) {
            case 'Approved': return { color: 'bg-green-100 text-green-600', icon: Check };
            case 'Verified': return { color: 'bg-emerald-100 text-emerald-600', icon: Check };
            case 'Rejected': return { color: 'bg-red-100 text-red-600', icon: X };
            case 'Pending':
            case 'submitted':
            case 'Sent': return { color: 'bg-blue-100 text-blue-600', icon: Info }; // Incoming
            default: return { color: 'bg-slate-100 text-slate-500', icon: MessageSquare };
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{unreadCount} New</span>
                            </div>

                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-xs">
                                        No new notifications
                                    </div>
                                ) : (
                                    notifications.map((note) => {
                                        const { color, icon: Icon } = getStatusConfig(note.status);
                                        return (
                                            <div key={note.id || Math.random()} className={`p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 relative group ${!note.isRelevant ? 'opacity-50' : ''}`}>
                                                <div className="flex gap-3">
                                                    <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center flex-shrink-0`}>
                                                        <Icon size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900 mb-0.5">
                                                            {note.title}
                                                        </p>
                                                        <p className="text-xs text-slate-500 leading-snug">
                                                            {note.subtitle}
                                                        </p>
                                                        {note.status && <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{note.status}</p>}
                                                        <p className="text-[10px] text-slate-400 mt-1">
                                                            {note.date ? new Date(note.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {note.isRelevant && (
                                                    <div className="mt-2 pl-11">
                                                        <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">Action Required</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NavNotifications;
