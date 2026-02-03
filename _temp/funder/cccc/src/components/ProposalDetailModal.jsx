import React, { useState, useEffect } from 'react';
import { db, functions } from '../firebase/config';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, AlertTriangle, ShieldCheck, TrendingUp, Check, Ban, Brain } from 'lucide-react';

const ProposalDetailModal = ({ proposal, onClose, aiMatch }) => {
  const { currentUser, funderData } = useAuth();
  const [aiReview, setAiReview] = useState(null);
  const [decisionSupport, setDecisionSupport] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [processingDecision, setProcessingDecision] = useState(false);

  useEffect(() => {
    getAIReview();
  }, [proposal]);

  const getAIReview = async () => {
    try {
      setLoadingReview(true);
      
      if (!funderData || !funderData.preferences) {
        console.warn("Funder preferences missing for AI decision support");
      }

      const reviewProposal = httpsCallable(functions, 'reviewProposal');
      const supportDecision = httpsCallable(functions, 'getDecisionSupport');
      
      const [reviewRes, supportRes] = await Promise.all([
        reviewProposal({ proposal }),
        supportDecision({ proposal, funderPrefs: funderData?.preferences || {} })
      ]);

      setAiReview(reviewRes.data);
      setDecisionSupport(supportRes.data);
    } catch (error) {
      console.error("AI Review Error:", error);
      // Don't alert here to avoid annoying the user, but show it in console
    } finally {
      setLoadingReview(false);
    }
  };

  const handleDecision = async (status) => {
    try {
      setProcessingDecision(true);

      const rationale = decisionSupport?.rationale || "No AI rationale available";
      const confidenceScore = decisionSupport?.confidenceScore || 0;

      // Create investment or log decision
      if (status === 'accepted') {
        await addDoc(collection(db, 'investments'), {
          funderId: currentUser.uid,
          proposalId: proposal.id,
          title: proposal.title,
          domain: proposal.domain,
          amount: proposal.budget,
          status: 'active',
          progress: 0,
          aiDecisionRationale: rationale,
          aiConfidenceScore: confidenceScore,
          createdAt: serverTimestamp()
        });
      }

      // Update proposal status or log
      await addDoc(collection(db, 'decision_logs'), {
        funderId: currentUser.uid,
        proposalId: proposal.id,
        status,
        rationale: rationale,
        timestamp: serverTimestamp()
      });

      alert(`Proposal ${status === 'accepted' ? 'Accepted' : 'Rejected'}!`);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error processing decision');
    } finally {
      setProcessingDecision(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">{proposal.domain}</span>
            <h2 className="text-2xl font-bold text-slate-900">{proposal.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Project Overview</h3>
              <p className="text-slate-600 leading-relaxed">{proposal.description}</p>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Budget Required</p>
                <p className="text-xl font-bold text-slate-900">${proposal.budget?.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Duration</p>
                <p className="text-xl font-bold text-slate-900">{proposal.timeline}</p>
              </div>
            </section>

            {loadingReview ? (
              <div className="flex items-center justify-center py-20 gap-3">
                <Sparkles className="w-6 h-6 text-primary-600 animate-pulse" />
                <span className="text-slate-400 animate-pulse">AI is evaluating proposal...</span>
              </div>
            ) : aiReview && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <section className="bg-primary-50/50 border border-primary-100 p-6 rounded-2xl">
                  <h3 className="flex items-center gap-2 text-primary-800 font-bold mb-3">
                    <Brain className="w-5 h-5" />
                    AI Executive Summary
                  </h3>
                  <p className="text-primary-900/80 text-sm leading-relaxed">{aiReview.summary}</p>
                </section>

                <div className="grid grid-cols-2 gap-6">
                  <section className="space-y-3">
                    <h4 className="font-bold text-green-700 flex items-center gap-2 text-sm">
                      <ShieldCheck className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {aiReview.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-green-500 mt-1.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section className="space-y-3">
                    <h4 className="font-bold text-amber-700 flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      Risk Flags
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(aiReview.risks).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
                          <span className="capitalize text-slate-500">{key}</span>
                          <span className={clsx(
                            "font-bold",
                            val === 'High' ? 'text-red-600' : val === 'Med' ? 'text-amber-600' : 'text-green-600'
                          )}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}
          </div>

          {/* AI Decision Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary-400" />
                <h3 className="font-bold">AI Decision Support</h3>
              </div>

              {loadingReview ? (
                <div className="h-40 flex items-center justify-center border border-white/10 rounded-2xl">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : decisionSupport && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Rec. Action</span>
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase",
                      decisionSupport.recommendation === 'Accept' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    )}>
                      {decisionSupport.recommendation}
                    </span>
                  </div>

                  <div className="text-center py-4 bg-white/5 rounded-2xl">
                    <div className="text-3xl font-black text-primary-400">{decisionSupport.confidenceScore}%</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Confidence Score</div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">AI Rationale</p>
                    <p className="text-xs text-slate-300 italic leading-relaxed">"{decisionSupport.rationale}"</p>
                  </div>
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-white/10 space-y-3">
                <button
                  disabled={processingDecision || loadingReview}
                  onClick={() => handleDecision('accepted')}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Check className="w-5 h-5" />
                  Accept Proposal
                </button>
                <button
                  disabled={processingDecision || loadingReview}
                  onClick={() => handleDecision('rejected')}
                  className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Ban className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>

            {aiMatch && (
              <div className="bg-primary-50 p-6 rounded-3xl border border-primary-100">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  <h4 className="font-bold text-primary-900">ROI Potential</h4>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-primary-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-600 rounded-full" 
                      style={{ width: aiMatch.roiPotential === 'High' ? '90%' : aiMatch.roiPotential === 'Medium' ? '60%' : '30%' }} 
                    />
                  </div>
                  <span className="text-sm font-black text-primary-700">{aiMatch.roiPotential}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const clsx = (...args) => args.filter(Boolean).join(' ');

export default ProposalDetailModal;
