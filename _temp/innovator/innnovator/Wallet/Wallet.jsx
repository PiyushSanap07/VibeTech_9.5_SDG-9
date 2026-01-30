import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Wallet as WalletIcon, ArrowUpRight, TrendingUp, ShieldCheck, Zap, History, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const Wallet = () => {
  const [wallet, setWallet] = useState({ released: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", auth.currentUser.uid), (snap) => {
      if (snap.exists() && snap.data().wallet) {
        setWallet(snap.data().wallet);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <header className="space-y-1">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Virtual <span className="text-primary-600">Wallet</span></h1>
        <p className="text-slate-500 font-medium text-lg">Manage your R&D capital and disbursement history.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="premium-card p-10 bg-slate-900 text-white border-none shadow-2xl shadow-primary-500/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary-600 rounded-full -mr-20 -mt-20 opacity-20 blur-3xl" />
          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-white/10 rounded-2xl"><WalletIcon size={24} className="text-primary-400" /></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Released Capital</span>
            </div>
            <div className="space-y-1">
              <p className="text-5xl font-black tracking-tighter">${wallet.released?.toLocaleString()}</p>
              <p className="text-xs font-bold text-emerald-400 flex items-center">
                <TrendingUp size={14} className="mr-1" /> +12.5% vs last month
              </p>
            </div>
            <button className="w-full py-4 bg-primary-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/20">Withdraw Funds</button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="premium-card p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><Zap size={24} /></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pending Approval</span>
          </div>
          <div className="space-y-1">
            <p className="text-5xl font-black tracking-tighter text-slate-900">${wallet.pending?.toLocaleString()}</p>
            <p className="text-xs font-bold text-slate-400">Allocated to active milestones</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center space-x-3">
            <ShieldCheck size={20} className="text-emerald-500" />
            <p className="text-[10px] font-bold text-slate-500 leading-tight uppercase tracking-tight">Funds are released automatically upon milestone verification.</p>
          </div>
        </motion.div>
      </div>

      <section className="premium-card overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center">
            <History size={18} className="mr-2" /> Transaction History
          </h3>
          <button className="text-[10px] font-black text-primary-600 uppercase hover:underline">Export CSV</button>
        </div>
        <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest text-[10px] opacity-40">
          No recent disbursements found.
        </div>
      </section>
    </div>
  );
};

export default Wallet;
