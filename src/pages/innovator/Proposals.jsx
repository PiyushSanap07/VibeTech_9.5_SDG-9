import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import {
  FileText, Search, Filter, ArrowUpRight,
  Clock, TrendingUp, Sparkles, ChevronRight,
  MessageSquare, Lightbulb, Users
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProposalForm from './ProposalForm';

const Proposals = () => {
  const location = useLocation();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProposals();
    if (location.state?.conversationId) {
      setIsFormOpen(true);
    }
  }, [location.state]);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "proposals"),
        where("userId", "==", auth.currentUser.uid)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProposals(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProposals = proposals.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Active <span className="text-primary-600">Proposals</span></h1>
          <p className="text-slate-500 font-medium text-lg">Manage your formal R&D pipeline and funding requests.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary flex items-center shadow-xl shadow-primary-500/20"
        >
          <FileText size={20} className="mr-2" /> New Proposal
        </button>
      </header>

      <div className="flex items-center space-x-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search proposals by title..."
            className="w-full pl-12 pr-4 py-2 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-medium text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all">
          <Filter size={20} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="py-20 text-center space-y-6 premium-card bg-slate-50/50 border-dashed border-2">
          <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-sm text-slate-300">
            <FileText size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">No proposals found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Start a formal funding request for your innovations.</p>
          </div>
          <button onClick={() => setIsFormOpen(true)} className="btn-secondary !bg-white">Create New Proposal</button>
        </div>
      ) : (
        <div className="space-y-6 pb-20">
          {filteredProposals.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="premium-card group overflow-hidden border-slate-200/40"
            >
              <Link to={`/innovator/proposal/${p.id}`} className="block p-8 hover:bg-slate-50/50 transition-all">
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">{p.title}</h3>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.status === 'Funded' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                        }`}>
                        {p.status}
                      </span>
                      {p.origin === 'Chat' && (
                        <span className="flex items-center text-[9px] font-black text-primary-500 bg-primary-50 px-2 py-1 rounded uppercase tracking-tighter">
                          <MessageSquare size={10} className="mr-1" /> From Chat
                        </span>
                      )}
                    </div>

                    <p className="text-slate-500 text-sm font-medium line-clamp-2 max-w-4xl">{p.abstract}</p>

                    <div className="flex flex-wrap items-center gap-6 pt-2">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <Users size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Open Call</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-400">
                        <TrendingUp size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">${parseFloat(p.budget).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-400">
                        <Clock size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{p.timeline}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col justify-between items-end border-l border-slate-100 pl-8 lg:min-w-[180px]">
                    {p.aiAnalysis && (
                      <div className="flex space-x-4">
                        <div className="text-center">
                          <div className="text-xl font-black text-primary-600">{p.aiAnalysis.innovation}%</div>
                          <div className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Intel</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-black text-emerald-600">{p.aiAnalysis.feasibility}%</div>
                          <div className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Feas.</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center text-primary-600 font-black text-[11px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      Details <ArrowUpRight size={16} className="ml-1.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <ProposalForm onClose={() => setIsFormOpen(false)} onRefresh={fetchProposals} />
      )}
    </div>
  );
};

export default Proposals;
