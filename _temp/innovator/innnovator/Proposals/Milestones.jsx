import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ListChecks, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Milestones = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveProposals();
  }, []);

  const fetchActiveProposals = async () => {
    try {
      const q = query(collection(db, "proposals"), where("userId", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      setProposals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {} finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header className="space-y-1">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Execution <span className="text-primary-600">Milestones</span></h1>
        <p className="text-slate-500 font-medium text-lg">Track progress and release funding for your active R&D projects.</p>
      </header>

      {loading ? (
        <div className="p-20 text-center animate-pulse text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Roadmap...</div>
      ) : proposals.length === 0 ? (
        <div className="premium-card p-20 text-center space-y-4">
          <ListChecks size={48} className="mx-auto text-slate-200" />
          <p className="text-slate-500 font-bold">No active milestones. Submit a proposal to start tracking progress.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {proposals.map(p => (
            <div key={p.id} className="premium-card overflow-hidden">
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-black text-slate-900">{p.title}</h3>
                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200">{p.status}</span>
              </div>
              <div className="p-8 text-center text-slate-400 text-sm font-medium">
                Click into the <span className="text-primary-600 font-bold">Proposal Details</span> to manage specific technical milestones and Proof of Work.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Milestones;
