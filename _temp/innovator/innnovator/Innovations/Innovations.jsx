import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, getDocs, addDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { 
  Plus, Lightbulb, Search, Filter, ArrowUpRight, 
  BarChart3, Globe, Zap, Clock, X, Loader2, Sparkles,
  Image as ImageIcon, Link as LinkIcon, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Innovations = () => {
  const [innovations, setInnovations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    tags: '',
    stage: 'Idea', // Idea, Prototype, MVP, Deployed
    budget: '',
    demoLink: '',
  });

  useEffect(() => {
    fetchInnovations();
  }, []);

  const fetchInnovations = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "innovations"), 
        where("userId", "==", auth.currentUser.uid)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInnovations(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInnovation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "innovations"), {
        ...formData,
        userId: auth.currentUser.uid,
        views: 0,
        saves: 0,
        tags: formData.tags.split(',').map(t => t.trim()),
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', domain: '', tags: '', stage: 'Idea', budget: '', demoLink: '' });
      fetchInnovations();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInnovations = innovations.filter(inn => 
    inn.title.toLowerCase().includes(search.toLowerCase()) ||
    inn.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Innovation <span className="text-primary-600">Showcase</span></h1>
          <p className="text-slate-500 font-medium text-lg">Your public-facing R&D portfolio for funder discovery.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center shadow-xl shadow-primary-500/20"
        >
          <Plus size={20} className="mr-2" /> Publish Innovation
        </button>
      </header>

      <div className="flex items-center space-x-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Filter by title or domain..." 
            className="w-full pl-12 pr-4 py-2 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-medium text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all">
          <Filter size={20} />
        </button>
      </div>

      {loading && !isModalOpen ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredInnovations.length === 0 ? (
        <div className="py-20 text-center space-y-6 premium-card bg-slate-50/50 border-dashed border-2">
          <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-sm text-slate-300">
            <Lightbulb size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">No innovations published yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Publish your projects to make them discoverable to global funders and R&D partners.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-secondary !bg-white">Add Your First Project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {filteredInnovations.map((inn, i) => (
            <motion.div 
              key={inn.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="premium-card group cursor-pointer overflow-hidden border-slate-200/40"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                    <Zap size={24} />
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">{inn.stage}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary-600 transition-colors">{inn.title}</h3>
                  <p className="text-sm text-slate-500 font-medium line-clamp-3 leading-relaxed">{inn.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {inn.tags?.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase tracking-widest">{tag}</span>
                  ))}
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                  <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <BarChart3 size={14} className="mr-1.5" />
                    {inn.views || 0} Engagement
                  </div>
                  <ArrowUpRight size={20} className="text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Innovation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 sm:p-12">
                <div className="flex justify-between items-start mb-10">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
                      <Sparkles className="text-primary-600 mr-3" size={28} /> Publish Innovation
                    </h2>
                    <p className="text-slate-500 font-medium">Define your project for the funding ecosystem.</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleAddInnovation} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Innovation Title</label>
                      <input 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold"
                        placeholder="e.g., Quantum Efficient Solar Cells"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Research Domain</label>
                      <input 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold"
                        placeholder="e.g., Renewable Energy"
                        required
                        value={formData.domain}
                        onChange={(e) => setFormData({...formData, domain: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Project Abstract</label>
                    <textarea 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold h-32 resize-none"
                      placeholder="Describe the problem, solution, and potential impact..."
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Readiness Stage</label>
                      <select 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold appearance-none"
                        value={formData.stage}
                        onChange={(e) => setFormData({...formData, stage: e.target.value})}
                      >
                        <option>Idea</option>
                        <option>Prototype</option>
                        <option>MVP</option>
                        <option>Deployed</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Tags (Comma separated)</label>
                      <input 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold"
                        placeholder="AI, Hardware, NetZero"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 btn-primary !py-4 flex items-center justify-center space-x-2"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <><span>Publish Innovation</span> <ArrowUpRight size={20} /></>}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="btn-secondary !bg-slate-100 !border-none !px-8"
                    >
                      Cancel
                    </button>
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

export default Innovations;
