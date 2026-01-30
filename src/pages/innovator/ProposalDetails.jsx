import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase/config';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import {
  ArrowLeft, Brain, Target, Zap, TrendingUp,
  Users, CheckCircle2, AlertCircle, Wallet, Sparkles,
  ChevronRight, Calendar, DollarSign, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MilestoneManager from '../../components/innovator/MilestoneManager';

const ProposalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [completionAI, setCompletionAI] = useState(null);

  useEffect(() => {
    fetchProposal();
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    const docRef = doc(db, "users", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserProfile(docSnap.data());
    }
  };

  const fetchProposal = async () => {
    const docRef = doc(db, "proposals", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setProposal(data);
      if (data.status === 'Funded' || data.status === 'Completed') {
        runCompletionAI(data);
      }
    }
    setLoading(false);
  };

  const runCompletionAI = async (data) => {
    const milestonesSnapshot = await getDocs(collection(db, "proposals", id, "milestones"));
    const milestones = milestonesSnapshot.docs.map(d => d.data());
    try {
      const result = await predictCompletionAI({ milestones, currentStatus: data.status });
      setCompletionAI(result.data);
    } catch (err) {
      console.error(err);
    }
  };

  const findMatches = async () => {
    setMatching(true);
    try {
      // Mock funders
      const funders = [
        { id: 'f1', name: 'Alpha Ventures', focus: ['AI', 'SaaS'], minBudget: 10000 },
        { id: 'f2', name: 'Green Earth Fund', focus: ['CleanTech', 'Energy'], minBudget: 50000 },
        { id: 'f3', name: 'Deep Tech Partners', focus: ['Hardware', 'R&D', 'Biotech'], minBudget: 20000 }
      ];

      const result = await matchFundersAI({ proposal, mockFunders: funders });
      await updateDoc(doc(db, "proposals", id), {
        matches: result.data.matches,
        status: 'Matched'
      });
      fetchProposal();
    } catch (err) {
      console.error(err);
    } finally {
      setMatching(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Matched': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Funded': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Completed': return 'bg-violet-50 text-violet-600 border-violet-100';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full" />
      <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Accessing Intel...</p>
    </div>
  );

  if (!proposal) return <div className="p-20 text-center text-slate-500 font-bold">Proposal not found.</div>;

  const { aiAnalysis } = proposal;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-6 flex-1">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-sm font-bold text-slate-400 hover:text-primary-600 transition-colors group"
          >
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusColor(proposal.status)}`}>
                {proposal.status}
              </span>
              <div className="flex items-center text-slate-400 text-xs font-bold">
                <Calendar size={14} className="mr-1.5" />
                {proposal.timeline}
              </div>
            </div>
            <h1 className="text-5xl font-black text-slate-900 leading-tight tracking-tight">{proposal.title}</h1>
            <p className="text-xl text-slate-500 font-medium max-w-3xl leading-relaxed">{proposal.abstract}</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-primary-600 p-8 rounded-[2.5rem] shadow-2xl shadow-primary-500/30 text-white min-w-[280px]"
        >
          <div className="flex flex-col space-y-1">
            <span className="text-primary-100 text-xs font-black uppercase tracking-widest">Target Budget</span>
            <span className="text-5xl font-black tracking-tighter">${parseFloat(proposal.budget).toLocaleString()}</span>
          </div>
          <div className="mt-8 pt-6 border-t border-primary-500/50 flex justify-between items-center">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-primary-600 bg-primary-400" />)}
            </div>
            <span className="text-[10px] font-bold uppercase text-primary-100">3 Potential Funders</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card p-10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 text-primary-50/50 group-hover:text-primary-50 transition-colors">
              <Brain size={120} />
            </div>

            <div className="relative z-10 space-y-10">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2.5 rounded-2xl text-primary-600">
                  <Brain size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Technical Assessment</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { label: 'Innovation', val: aiAnalysis.innovation, color: 'text-primary-500', bar: 'bg-primary-500' },
                  { label: 'Feasibility', val: aiAnalysis.feasibility, color: 'text-emerald-500', bar: 'bg-emerald-500' },
                  { label: 'Market', val: aiAnalysis.market, color: 'text-amber-500', bar: 'bg-amber-500' }
                ].map((stat) => (
                  <div key={stat.label} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                      <span className={`text-2xl font-black ${stat.color}`}>{stat.val}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.val}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${stat.bar}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 space-y-6">
                <h3 className="font-extrabold text-slate-900 flex items-center text-lg">
                  <Zap size={20} className="mr-2 text-primary-500" /> Strategic Recommendations
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {aiAnalysis.suggestions.map((s, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 10 }}
                      className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex items-start space-x-4 transition-all hover:bg-white hover:shadow-sm"
                    >
                      <div className="bg-white p-2 rounded-xl text-primary-600 shadow-sm font-bold text-xs">{i + 1}</div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">{s}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <MilestoneManager proposalId={id} proposal={proposal} onRefreshProposal={() => { fetchProposal(); fetchUserProfile(); }} />
        </div>

        <aside className="lg:col-span-4 space-y-10">
          <div className="premium-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black flex items-center text-slate-900 uppercase tracking-tight">
                <Target size={20} className="mr-2 text-red-500" /> Match Intel
              </h3>
              {proposal.status === 'Draft' && (
                <button
                  onClick={findMatches}
                  disabled={matching}
                  className="bg-primary-50 text-primary-600 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-primary-100 transition-all disabled:opacity-50"
                >
                  {matching ? 'Analyzing...' : 'Scan Market'}
                </button>
              )}
            </div>

            {proposal.matches && proposal.matches.length > 0 ? (
              <div className="space-y-6">
                {proposal.matches.map((match, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50/30 group hover:bg-white hover:border-primary-100 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-black text-slate-900">Entity #{i + 1}</span>
                      <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-black">
                        {match.score}% MATCH
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 italic">"{match.explanation}"</p>
                    {proposal.status === 'Matched' && (
                      <button
                        onClick={async () => {
                          const amount = parseFloat(proposal.budget);
                          await updateDoc(doc(db, "proposals", id), { status: 'Funded' });
                          await updateDoc(doc(db, "users", auth.currentUser.uid), {
                            "wallet.pending": (userProfile?.wallet?.pending || 0) + amount
                          });
                          fetchProposal();
                          fetchUserProfile();
                        }}
                        className="w-full btn-primary !py-3 !text-xs !rounded-2xl flex items-center justify-center space-x-2"
                      >
                        <CheckCircle2 size={16} />
                        <span>Activate Funding</span>
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                  <Target size={30} />
                </div>
                <p className="text-slate-400 text-xs font-bold italic uppercase tracking-widest">
                  {matching ? 'Scanning global databases...' : 'No matches identified'}
                </p>
              </div>
            )}
          </div>

          {proposal.status === 'Funded' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-950 p-10 rounded-[3rem] shadow-2xl shadow-slate-900/40 relative overflow-hidden"
            >
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-lg font-black uppercase tracking-tight flex items-center">
                    <Wallet size={20} className="mr-2 text-primary-400" /> Capital Logic
                  </h3>
                </div>

                <div className="space-y-8">
                  <div className="space-y-1">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Released Capital</span>
                    <div className="text-4xl font-black text-white">${(userProfile?.wallet?.released || 0).toLocaleString()}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Pending Release</span>
                    <div className="text-4xl font-black text-primary-400">${(userProfile?.wallet?.pending || 0).toLocaleString()}</div>
                  </div>
                </div>

                {completionAI && (
                  <div className="pt-8 border-t border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Integrity Check</span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${completionAI.confidence === 'High' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                        {completionAI.confidence.toUpperCase()} CONFIDENCE
                      </span>
                    </div>
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/10 flex items-start space-x-3">
                      <Info size={18} className="text-primary-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-400 font-medium leading-relaxed italic">{completionAI.advisory}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ProposalDetails;
