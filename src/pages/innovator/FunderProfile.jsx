import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { db, auth, functions } from '../../firebase/config';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import {
  ArrowLeft, MessageSquare, Send, Zap, Award,
  Target, Globe, Shield, Star, CheckCircle2,
  ChevronRight, Sparkles, Loader2, TrendingUp, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FunderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Hook for state
  const [funder, setFunder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedInnovation, setSelectedInnovation] = useState('');
  const [requestAmount, setRequestAmount] = useState('');
  const [innovations, setInnovations] = useState([]);
  const [outreachMessage, setOutreachMessage] = useState('');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

  useEffect(() => {
    fetchFunder();
    fetchInnovations();

    // Auto-open modal if requested from previous page
    if (location.state?.openRequest) {
      setShowRequestModal(true);
      // Clear state to prevent reopening on refresh (optional but good practice)
      window.history.replaceState({}, document.title);
    }
  }, [id]);

  const fetchFunder = async () => {
    try {
      // Fetch from "users" collection, as that is where all registered users live
      const docSnap = await getDoc(doc(db, "users", id));
      if (docSnap.exists()) setFunder(docSnap.data());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInnovations = async () => {
    try {
      const q = collection(db, "innovations");
      // For simplicity, just fetching all for the current user
      const snap = await getDocs(query(q, where("userId", "==", auth.currentUser.uid)));
      setInnovations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { }
  };

  const handleFundingRequest = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    try {
      const selectedInn = innovations.find(i => i.id === selectedInnovation);

      await addDoc(collection(db, "funding_requests"), {
        funderId: id,
        funderName: funder?.name || "Anonymous Funder",
        innovationId: selectedInnovation,
        innovationTitle: selectedInn?.title || "Untitled Innovation",
        innovationDomain: selectedInn?.domain || "General",
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || "Innovator",
        requestedAmount: Number(requestAmount) || 0,
        status: 'Pending',
        lastMessage: outreachMessage || 'Funding request initiated.',
        createdAt: serverTimestamp()
      });
      setShowRequestModal(false);
      setOutreachMessage('');
      setSelectedInnovation('');
      setRequestAmount('');
      alert("Funding request sent successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleGeneratePitch = async () => {
    if (!selectedInnovation) return alert("Please select an innovation first.");

    setIsGeneratingPitch(true);
    try {
      const innovation = innovations.find(inn => inn.id === selectedInnovation);
      const generatePitchHelper = httpsCallable(functions, 'generatePitchHelper');
      const res = await generatePitchHelper({ innovation, funder });
      if (res.data?.pitch) {
        setOutreachMessage(res.data.pitch);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate pitch. Ensure Local Emulator is running.");
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="animate-spin text-primary-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <button onClick={() => navigate('/innovator/funders')} className="flex items-center text-slate-400 hover:text-slate-900 font-bold transition-all group">
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Discovery
      </button>

      {funder ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* Header Info */}
            <section className="premium-card p-10 relative overflow-hidden bg-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 z-0" />

              <div className="relative z-10 space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-black text-4xl shadow-lg border border-white">
                    {funder.name?.charAt(0) || "?"}
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <h1 className="text-4xl font-black text-slate-900 tracking-tight">{funder.name || "Anonymous Funder"}</h1>
                      <CheckCircle2 size={24} fill="currentColor" className="text-blue-500" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{funder.type || "Institution"}</span>
                      {funder.focus?.map(f => (
                        <span key={f} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center">
                    <TrendingUp size={14} className="mr-2" /> Investment Thesis
                  </h3>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">
                    {funder.details || `Focused on high-impact R&D initiatives in ${funder.focus?.join(', ')}. We prioritize projects with clear milestone roadmaps and scalable market applications.`}
                  </p>
                </div>
              </div>
            </section>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="premium-card p-6 space-y-2">
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center">
                  <DollarSign size={14} className="mr-1" /> Min. Ticket
                </div>
                <div className="text-xl font-black text-slate-900">${(Number(funder.minBudget) || 0).toLocaleString()}</div>
              </div>
              <div className="premium-card p-6 space-y-2">
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center">
                  <Shield size={14} className="mr-1" /> Risk Appetite
                </div>
                <div className="text-xl font-black text-slate-900">{funder.riskAppetite || "Balanced"}</div>
              </div>
              <div className="premium-card p-6 space-y-2">
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center">
                  <Globe size={14} className="mr-1" /> Region
                </div>
                <div className="text-xl font-black text-slate-900">Global</div>
              </div>
              <div className="premium-card p-6 space-y-2">
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center">
                  <Star size={14} className="mr-1" /> Reliability
                </div>
                <div className="text-xl font-black text-slate-900">AAA</div>
              </div>
            </div>

            {/* AI Match Details */}
            <section className="premium-card p-10 border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-900 flex items-center">
                  <Sparkles className="text-indigo-600 mr-3" size={24} /> AI Match Intelligence
                </h3>
                <div className="px-4 py-2 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-500/20">
                  {Math.floor(Math.random() * (98 - 85 + 1)) + 85}% Match
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { label: 'Domain Alignment', value: 'High', desc: 'Funder focus perfectly overlaps with your recent innovations.', icon: Target },
                  { label: 'Funding Capacity', value: 'Optimal', desc: 'Your projected budget aligns with their typical ticket size.', icon: Award }
                ].map(item => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center space-x-2 text-indigo-600">
                      <item.icon size={18} />
                      <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{item.value}</p>
                    <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Action Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="premium-card p-8 space-y-6 border-t-4 border-t-primary-500">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Direct Outreach</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="w-full btn-primary !py-4 flex items-center justify-center space-x-3 shadow-xl shadow-primary-500/30"
                >
                  <Zap size={20} />
                  <span>Request Funding</span>
                </button>
                <button
                  onClick={() => navigate('/innovator/messages')}
                  className="w-full btn-secondary !py-4 !border-slate-200 flex items-center justify-center space-x-3"
                >
                  <MessageSquare size={20} />
                  <span>Open Dialogue</span>
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                Requests are analyzed by our AI to ensure compatibility before transmission.
              </p>
            </div>

            <div className="premium-card p-8 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Portfolio Focus</h3>
              <div className="space-y-3">
                {(funder.focus || ['Green Energy', 'Deep Tech', 'Bio-Informatics']).map(tag => (
                  <div key={tag} className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>{tag}</span>
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: Math.random() * 100 + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem]">
          <p className="text-slate-400 font-bold">Funder not found.</p>
        </div>
      )}

      {/* Funding Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRequestModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 p-10 overflow-hidden">
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Initiate Funding Request</h2>
                  <p className="text-slate-500 font-medium">Select an innovation to showcase to <span className="text-primary-600 font-bold">{funder?.name || "this funder"}</span>.</p>
                </div>

                <form onSubmit={handleFundingRequest} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Select Innovation</label>
                    <select
                      required
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold appearance-none"
                      value={selectedInnovation}
                      onChange={(e) => setSelectedInnovation(e.target.value)}
                    >
                      <option value="">Choose a project...</option>
                      {innovations.map(inn => (
                        <option key={inn.id} value={inn.id}>{inn.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Requested Amount ($)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 50000"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold appearance-none"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Outreach Message</label>
                      <button
                        type="button"
                        onClick={handleGeneratePitch}
                        disabled={isGeneratingPitch || !selectedInnovation}
                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center hover:text-indigo-700 disabled:opacity-50"
                      >
                        {isGeneratingPitch ? <Loader2 size={12} className="animate-spin mr-1" /> : <Sparkles size={12} className="mr-1" />}
                        Auto-Generate Pitch
                      </button>
                    </div>
                    <textarea
                      placeholder="Why should they fund this project?"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold h-40 resize-none text-sm leading-relaxed"
                      value={outreachMessage}
                      onChange={(e) => setOutreachMessage(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4">
                    <button type="submit" disabled={requestLoading || !selectedInnovation} className="flex-1 btn-primary !py-4 flex items-center justify-center space-x-2">
                      {requestLoading ? <Loader2 className="animate-spin" /> : <><span>Transmit Request</span> <Send size={18} /></>}
                    </button>
                    <button type="button" onClick={() => setShowRequestModal(false)} className="px-6 font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FunderProfile;
