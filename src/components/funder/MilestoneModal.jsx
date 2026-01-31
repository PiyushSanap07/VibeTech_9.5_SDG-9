import React, { useState, useEffect } from 'react';
import { db, functions } from '../../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { X, Sparkles, CheckCircle2, Clock, AlertCircle, DollarSign, BrainCircuit } from 'lucide-react';

const MilestoneModal = ({ project, onClose, onUpdate }) => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiReviewing, setAiReviewing] = useState(null); // ID of milestone being reviewed
  const [aiAnalysis, setAiAnalysis] = useState({}); // Map of milestone ID to analysis
  const [escrowInfo, setEscrowInfo] = useState({ locked: 0, released: 0 });

  useEffect(() => {
    fetchMilestones();
  }, [project]);

  const fetchMilestones = async () => {
    try {
      // Corrected: Read from subcollection
      const q = collection(db, 'investments', project.id, 'milestones');
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMilestones(docs);

      // Calculate escrow (mock logic)
      const released = docs.filter(m => m.status === 'approved').reduce((acc, m) => acc + m.paymentAmount, 0);
      setEscrowInfo({
        locked: project.amount - released,
        released
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIReview = async (milestone) => {
    try {
      setAiReviewing(milestone.id);
      const reviewMilestone = httpsCallable(functions, 'reviewMilestone');
      const result = await reviewMilestone({ milestone, projectPlan: project });
      setAiAnalysis(prev => ({ ...prev, [milestone.id]: result.data }));
    } catch (error) {
      console.error(error);
    } finally {
      setAiReviewing(null);
    }
  };

  const approveMilestone = async (milestone) => {
    try {
      await updateDoc(doc(db, 'investments', project.id, 'milestones', milestone.id), {
        status: 'Verified',
        approvedAt: serverTimestamp()
      });
      // Update project progress
      const newProgress = Math.min(100, (project.progress || 0) + (100 / milestones.length));
      await updateDoc(doc(db, 'investments', project.id), {
        progress: Math.round(newProgress)
      });
      fetchMilestones();
      onUpdate();
      alert('Milestone approved and funds released!');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Project Milestones</h2>
            <p className="text-sm text-slate-500">{project.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Escrow Status */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 text-white p-6 rounded-2xl flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Locked Funds</p>
                <p className="text-2xl font-black">${escrowInfo.locked.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-primary-50 border border-primary-100 p-6 rounded-2xl flex items-center gap-4">
              <div className="bg-primary-600 p-3 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-primary-600 font-bold uppercase">Released Funds</p>
                <p className="text-2xl font-black text-slate-900">${escrowInfo.released.toLocaleString()}</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              Timeline
            </h3>
            <div className="space-y-4">
              {milestones.map((m, idx) => {
                const analysis = aiAnalysis[m.id];
                return (
                  <div key={m.id} className="glass-card p-6 rounded-2xl border-l-4 border-l-slate-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900">M{idx + 1}: {m.title}</h4>
                        <p className="text-xs text-slate-500">Target: {m.dueDate}</p>
                      </div>
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                        m.status === 'Verified' ? 'bg-green-100 text-green-700' :
                          (m.status === 'Pending' || m.status === 'submitted') ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      )}>
                        {m.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mb-6">{m.description || 'No description provided.'}</p>

                    {(m.status === 'Pending' || m.status === 'submitted') && (
                      <div className="space-y-4">
                        <button
                          onClick={() => handleAIReview(m)}
                          disabled={aiReviewing === m.id}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-primary-600 font-bold text-sm border border-primary-100 transition-all"
                        >
                          <BrainCircuit className="w-4 h-4" />
                          {aiReviewing === m.id ? 'AI Reviewing...' : 'Review with AI'}
                        </button>

                        {analysis && (
                          <div className="bg-primary-50/50 p-4 rounded-xl border border-primary-100 animate-in fade-in">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-primary-600" />
                              <span className="text-xs font-bold text-primary-900 uppercase">AI Review Summary</span>
                            </div>
                            <p className="text-xs text-primary-800 italic mb-3">"{analysis.summary}"</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500">PROGRESS ALIGNMENT:</span>
                              <span className={clsx(
                                "text-[10px] font-black",
                                analysis.isAligned ? "text-green-600" : "text-red-600"
                              )}>
                                {analysis.isAligned ? 'ALIGNED' : 'DISCREPANCY DETECTED'}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={() => approveMilestone(m)}
                            className="flex-1 btn-primary py-3 rounded-xl bg-green-600 border-none shadow-lg shadow-green-100 text-sm"
                          >
                            Approve & Release
                          </button>
                          <button className="flex-1 btn-secondary py-3 rounded-xl text-sm">
                            Request Revision
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const clsx = (...args) => args.filter(Boolean).join(' ');

export default MilestoneModal;
