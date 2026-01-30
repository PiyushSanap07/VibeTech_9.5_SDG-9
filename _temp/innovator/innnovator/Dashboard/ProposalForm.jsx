import React, { useState, useEffect } from 'react';
import { db, auth, analyzeProposalAI } from '../../firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { X, Loader2, Sparkles, Target, Zap, Clock, DollarSign, Lightbulb, Users, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const ProposalForm = ({ onClose, onRefresh }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [innovations, setInnovations] = useState([]);
  const [funders, setFunders] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    budget: '',
    timeline: '',
    innovationId: '',
    funderId: '',
    origin: 'Direct' // Direct or Chat
  });

  useEffect(() => {
    fetchAuxData();
    if (location.state?.conversationId) {
      handleChatToProposal(location.state.conversationId);
    }
  }, []);

  const fetchAuxData = async () => {
    try {
      const uid = auth.currentUser.uid;
      const snapI = await getDocs(query(collection(db, "innovations"), where("userId", "==", uid)));
      setInnovations(snapI.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const snapF = await getDocs(collection(db, "funders"));
      setFunders(snapF.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleChatToProposal = async (convId) => {
    setLoading(true);
    try {
      const convSnap = await getDoc(doc(db, "conversations", convId));
      if (convSnap.exists()) {
        const data = convSnap.data();
        setFormData(prev => ({
          ...prev,
          funderId: data.funderId || '',
          origin: 'Chat',
          title: `Proposal for ${data.funderName || 'Research'}`
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const analysisResult = await analyzeProposalAI({
        title: formData.title,
        abstract: formData.abstract,
        budget: formData.budget,
        timeline: formData.timeline
      });

      await addDoc(collection(db, "proposals"), {
        ...formData,
        userId: auth.currentUser.uid,
        status: 'Draft',
        createdAt: serverTimestamp(),
        aiAnalysis: analysisResult.data,
        matches: []
      });

      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Submission failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col lg:flex-row"
      >
        {/* Sidebar Info */}
        <div className="lg:w-80 bg-slate-900 p-10 text-white space-y-8 shrink-0">
          <div className="space-y-2">
            <div className="bg-primary-500 w-12 h-12 rounded-2xl flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <h2 className="text-2xl font-black tracking-tight pt-4">R&D Submission</h2>
            <p className="text-slate-400 text-sm font-medium">Our AI will analyze your proposal for feasibility, innovation, and market alignment.</p>
          </div>

          <div className="space-y-6 pt-8 border-t border-white/10">
            <div className="flex items-center space-x-3 text-emerald-400">
              <Target size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Target Funder</span>
            </div>
            <div className="flex items-center space-x-3 text-amber-400">
              <Lightbulb size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">Linked Innovation</span>
            </div>
          </div>

          {formData.origin === 'Chat' && (
            <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl">
              <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Created via Chat</p>
              <p className="text-xs text-slate-300">Context automatically synchronized from discussion.</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto max-h-[85vh]">
          <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Initiate <span className="text-primary-600">R&D</span></h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Powered by Gemini Intel</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-white hover:shadow-sm rounded-2xl transition-all text-slate-400 hover:text-red-500 border border-transparent hover:border-slate-100"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Innovation Project</label>
                <div className="relative">
                  <Lightbulb className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold appearance-none"
                    value={formData.innovationId}
                    onChange={(e) => setFormData({...formData, innovationId: e.target.value})}
                  >
                    <option value="">General Proposal</option>
                    {innovations.map(inn => <option key={inn.id} value={inn.id}>{inn.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Target Funder</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold appearance-none"
                    value={formData.funderId}
                    onChange={(e) => setFormData({...formData, funderId: e.target.value})}
                  >
                    <option value="">Open Call (Global)</option>
                    {funders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Project Title</label>
              <div className="relative">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Next-Gen Solid State Battery Research"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold" 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Technical Abstract</label>
                <span className="text-[10px] font-bold text-slate-300 italic">AI will analyze this for innovation score</span>
              </div>
              <textarea 
                required
                rows={5}
                placeholder="Describe the scientific breakthrough and technical roadmap..."
                className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium resize-none leading-relaxed" 
                value={formData.abstract} 
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Target Budget</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    required
                    type="number" 
                    placeholder="50000"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold" 
                    value={formData.budget} 
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Estimated Timeline</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. 18 Months"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold" 
                    value={formData.timeline} 
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col space-y-4">
              <button 
                disabled={loading}
                type="submit" 
                className="w-full btn-primary !py-5 !rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-500/40 relative overflow-hidden group"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center space-x-3"
                    >
                      <Loader2 className="animate-spin" size={24} />
                      <span className="font-black tracking-widest text-sm uppercase">AI Analyzing...</span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="submit"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center space-x-3"
                    >
                      <Sparkles size={24} />
                      <span className="font-black tracking-widest text-sm uppercase">Secure Analysis & Submit</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest opacity-60">
                Technical score and market feasibility will be generated instantly.
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ProposalForm;
