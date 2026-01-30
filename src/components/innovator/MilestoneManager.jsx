import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/config';
import { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp, query, orderBy, increment } from 'firebase/firestore';
import { Plus, ListChecks, Calendar, DollarSign, Send, Sparkles, Loader2, FileCheck, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MilestoneManager = ({ proposalId, proposal, onRefreshProposal }) => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    deadline: '',
    percentage: ''
  });

  useEffect(() => {
    fetchMilestones();
  }, [proposalId]);

  const fetchMilestones = async () => {
    const q = query(collection(db, "proposals", proposalId, "milestones"), orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    setMilestones(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    try {
      const result = await suggestMilestonesAI({
        proposalTitle: proposal.title,
        proposalAbstract: proposal.abstract,
        timeline: proposal.timeline
      });

      const suggested = result.data.milestones;
      for (const m of suggested) {
        await addDoc(collection(db, "proposals", proposalId, "milestones"), {
          ...m,
          status: 'Pending',
          createdAt: serverTimestamp()
        });
      }
      fetchMilestones();
    } catch (err) {
      console.error(err);
    } finally {
      setSuggesting(false);
    }
  };

  const addManualMilestone = async (e) => {
    e.preventDefault();
    const totalPercentage = milestones.reduce((sum, m) => sum + parseInt(m.percentage || 0), 0) + parseInt(newMilestone.percentage);
    if (totalPercentage > 100) {
      alert("Total fund release percentage cannot exceed 100%");
      return;
    }

    await addDoc(collection(db, "proposals", proposalId, "milestones"), {
      ...newMilestone,
      status: 'Pending',
      createdAt: serverTimestamp()
    });
    setNewMilestone({ title: '', description: '', deadline: '', percentage: '' });
    setIsAdding(false);
    fetchMilestones();
  };

  const handleSubmission = async (milestoneId, milestoneTitle) => {
    const proof = prompt("Describe the work completed for this milestone:");
    if (!proof) return;

    try {
      const result = await summarizeMilestoneAI({ milestoneTitle, proofDetails: proof });
      const milestoneRef = doc(db, "proposals", proposalId, "milestones", milestoneId);
      await updateDoc(milestoneRef, {
        status: 'Submitted',
        submissionSummary: result.data.summary,
        submittedAt: serverTimestamp()
      });
      fetchMilestones();
    } catch (err) {
      console.error(err);
    }
  };

  const simulateApproval = async (milestone) => {
    const amount = (parseFloat(proposal.budget) * (parseInt(milestone.percentage) / 100));

    try {
      await updateDoc(doc(db, "proposals", proposalId, "milestones", milestone.id), {
        status: 'Approved',
        approvedAt: serverTimestamp()
      });

      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        "wallet.released": increment(amount),
        "wallet.pending": increment(-amount)
      });

      const message = `Milestone "${milestone.title}" approved! $${amount.toLocaleString()} released.`;
      const prioRes = await prioritizeNotificationAI({ message, type: 'milestone' });

      await addDoc(collection(db, "notifications"), {
        userId: auth.currentUser.uid,
        message,
        type: 'milestone',
        priority: prioRes.data.priority,
        createdAt: serverTimestamp()
      });

      fetchMilestones();
      if (onRefreshProposal) onRefreshProposal();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="premium-card p-10 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-100 p-2.5 rounded-2xl text-emerald-600">
            <ListChecks size={24} />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Project Execution</h2>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Milestone Tracking & Capital Release</p>
          </div>
        </div>
        <div className="flex space-x-3 w-full md:w-auto">
          {milestones.length === 0 && (
            <button
              onClick={handleSuggest}
              disabled={suggesting}
              className="flex-1 md:flex-none btn-primary !bg-indigo-600 !shadow-indigo-500/20 flex items-center justify-center"
            >
              {suggesting ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Sparkles size={18} className="mr-2" />}
              AI Breakdown
            </button>
          )}
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex-1 md:flex-none btn-secondary flex items-center justify-center"
          >
            {isAdding ? <X size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
            {isAdding ? 'Cancel' : 'Add Step'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={addManualMilestone}
            className="p-8 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 space-y-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title</label>
                <input
                  required
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-semibold"
                  placeholder="e.g. Prototype Development"
                  value={newMilestone.title}
                  onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Funding %</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    required
                    className="w-full pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-bold"
                    placeholder="20"
                    type="number"
                    value={newMilestone.percentage}
                    onChange={e => setNewMilestone({ ...newMilestone, percentage: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deliverables</label>
              <textarea
                required
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl h-24 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-medium resize-none"
                placeholder="What will be achieved?"
                value={newMilestone.description}
                onChange={e => setNewMilestone({ ...newMilestone, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary">Append Milestone</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-10">
            <Loader2 className="animate-spin h-8 w-8 text-slate-200 mx-auto" />
          </div>
        ) : milestones.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/20">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic opacity-60">Ready for architectural breakdown</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {milestones.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative flex flex-col md:flex-row items-start md:items-center gap-6 p-8 rounded-[2rem] border border-slate-100 hover:border-primary-200 hover:bg-primary-50/10 transition-all duration-300"
              >
                <div className="flex items-center space-x-6 w-full md:w-auto">
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl text-primary-600 font-black text-xs shadow-sm group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all duration-300">
                    M{i + 1}
                  </div>
                  <div className="flex-1 md:w-64">
                    <h4 className="font-black text-slate-900 group-hover:text-primary-600 transition-colors">{m.title}</h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <DollarSign size={10} className="mr-0.5" /> {m.percentage}%
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${m.status === 'Submitted' ? 'bg-indigo-100 text-indigo-600' :
                          m.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-slate-100 text-slate-500'
                        }`}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-slate-500 font-medium leading-relaxed italic line-clamp-2">"{m.description}"</p>

                  {m.submissionSummary && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-white/80 rounded-2xl border border-primary-100/30 flex items-start space-x-3"
                    >
                      <Sparkles size={14} className="text-primary-400 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        <span className="font-black text-primary-600 uppercase tracking-widest mr-2">AI Summary:</span>{m.submissionSummary}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 w-full md:w-auto">
                  {proposal.status === 'Funded' && m.status === 'Pending' && (
                    <button
                      onClick={() => handleSubmission(m.id, m.title)}
                      className="btn-secondary !py-2 !text-xs !rounded-xl flex items-center justify-center"
                    >
                      <Send size={14} className="mr-2" /> Submit Intel
                    </button>
                  )}
                  {m.status === 'Submitted' && (
                    <button
                      onClick={() => simulateApproval(m)}
                      className="btn-primary !py-2 !text-xs !rounded-xl !bg-emerald-600 !shadow-emerald-500/20 flex items-center justify-center"
                    >
                      <CheckCircle size={14} className="mr-2" /> Approve Release
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneManager;
