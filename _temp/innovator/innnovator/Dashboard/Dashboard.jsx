import React, { useState, useEffect } from 'react';
import { db, auth, seedDemoData } from '../../firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { 
  Plus, Search, Filter, ArrowUpRight, BarChart3, Clock, 
  Database, Sparkles, TrendingUp, Lightbulb, Users, 
  MessageSquare, ChevronRight, Award, FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProposalForm from './ProposalForm';

const Dashboard = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [innovations, setInnovations] = useState([]);
  const [funders, setFunders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const uid = auth.currentUser.uid;

    // 1. Real-time Proposals
    const qP = query(collection(db, "proposals"), where("userId", "==", uid));
    const unsubP = onSnapshot(qP, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProposals(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setLoading(false);
    });

    // 2. Real-time Innovations
    const qI = query(collection(db, "innovations"), where("userId", "==", uid));
    const unsubI = onSnapshot(qI, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInnovations(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });

    // 3. Recommended Funders (Static fetch is fine for discovery)
    const fetchFunders = async () => {
      const qF = query(collection(db, "funders"));
      const snapF = await getDocs(qF);
      setFunders(snapF.docs.slice(0, 3).map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchFunders();

    // 4. Real-time Pending Requests
    const qR = query(collection(db, "funding_requests"), where("userId", "==", uid));
    const unsubR = onSnapshot(qR, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });

    return () => {
      unsubP();
      unsubI();
      unsubR();
    };
  }, []);

  const fetchAllData = async () => {
    // This is now handled by onSnapshot, but we keep the name for handleSeed compatibility
    // or we can remove it if we update handleSeed.
  };

  const handleSeed = async () => {
    if (confirm("This will seed mock funders, innovations, and chat data. Continue?")) {
      try {
        setLoading(true);
        await seedDemoData();
        await fetchAllData();
        alert("Demo ecosystem seeded successfully!");
      } catch (err) {
        console.error(err);
        alert("Seeding failed. Make sure Cloud Functions are deployed and reachable.");
      } finally {
        setLoading(false);
      }
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

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Innovator <span className="text-primary-600 font-black">Control Center</span>
          </motion.h1>
          <p className="text-slate-500 font-medium">Elevate your R&D projects through intelligence.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleSeed} className="btn-secondary flex items-center">
            <Database size={18} className="mr-2 text-slate-400" /> Seed Demo
          </button>
          <Link to="/innovations" className="btn-primary flex items-center bg-indigo-600 shadow-indigo-500/20">
            <Plus size={20} className="mr-2" /> Publish Innovation
          </Link>
        </div>
      </header>

      {/* Primary Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Platform Portfolio', value: innovations.length, sub: 'Published Innovations', icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Capital Requests', value: requests.length, sub: 'Active Funder Dialogues', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Pipeline', value: proposals.length, sub: 'Proposals in Review', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="premium-card p-8 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{stat.sub}</p>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content: Innovations & Proposals */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Recent Innovations Widget */}
          <div className="premium-card overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center">
                <Lightbulb size={20} className="mr-2 text-amber-500" /> Recent Innovations
              </h2>
              <Link to="/innovations" className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline">View All</Link>
            </div>
            <div className="p-2">
              {loading ? (
                <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Portfolio...</div>
              ) : innovations.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <p className="text-slate-400 text-sm font-medium">Showcase your R&D work to attract funders.</p>
                  <Link to="/innovations" className="btn-secondary !text-xs !py-2 inline-block">Create Innovation Card</Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {innovations.slice(0, 3).map(inn => (
                    <Link key={inn.id} to={`/innovations/${inn.id}`} className="flex items-center justify-between p-6 hover:bg-slate-50/80 transition-all group">
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{inn.title}</h3>
                        <p className="text-xs text-slate-500 font-medium">{inn.domain} • {inn.stage}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Engagement</p>
                          <p className="text-sm font-bold text-slate-700">{inn.views || 0} Views</p>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Proposals Widget */}
          <div className="premium-card overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center">
                <FileText size={20} className="mr-2 text-primary-600" /> Active Proposals
              </h2>
              <Link to="/proposals" className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline">Manage All</Link>
            </div>
            <div className="p-2">
              {loading ? (
                <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Accessing Intel...</div>
              ) : proposals.length === 0 ? (
                <div className="p-12 text-center space-y-4">
                  <p className="text-slate-400 text-sm font-medium">No formal proposals active in the pipeline.</p>
                  <button onClick={() => setIsFormOpen(true)} className="btn-secondary !text-xs !py-2">Submit New Proposal</button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {proposals.slice(0, 5).map(p => (
                    <Link key={p.id} to={`/proposal/${p.id}`} className="flex items-center justify-between p-6 hover:bg-slate-50/80 transition-all group">
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{p.title}</h3>
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">${parseFloat(p.budget).toLocaleString()}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${p.status === 'Funded' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>{p.status}</span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Recommended Funders & Requests */}
        <aside className="lg:col-span-4 space-y-10">
          
          {/* Recommended Funders Widget */}
          <div className="premium-card p-8 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 flex items-center">
                <Award size={18} className="mr-2 text-indigo-600" /> Funder Intel
              </h3>
              <Link to="/funders" className="text-[10px] font-black text-primary-600 uppercase hover:underline">Scan All</Link>
            </div>
            
            <div className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />)}
                </div>
              ) : funders.length === 0 ? (
                <p className="text-center text-slate-400 text-xs font-bold italic py-4 uppercase">Initializing Match Engine...</p>
              ) : (
                funders.map(f => (
                  <motion.div key={f.id} whileHover={{ x: 5 }} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/funders/${f.id}`)}>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary-600 font-black text-xs group-hover:bg-primary-600 group-hover:text-white transition-all">
                        {f?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-tight">{f?.name || "Anonymous Funder"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{f?.focus?.[0]} • {f?.minBudget ? `$${f?.minBudget / 1000}k+` : 'Seed'}</p>
                      </div>
                    </div>
                    <div className="bg-primary-50 text-primary-600 px-2 py-1 rounded-lg text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity">MATCH</div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Pending Requests Widget */}
          <div className="premium-card p-8 space-y-8 bg-slate-900 text-white shadow-2xl shadow-slate-950/40 border-none">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary-400 flex items-center">
                <MessageSquare size={18} className="mr-2" /> Live Requests
              </h3>
              <Link to="/messages" className="text-[10px] font-black text-slate-400 uppercase hover:text-white transition-colors">Inbox</Link>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="space-y-4 opacity-20">
                  {[1,2].map(i => <div key={i} className="h-12 bg-white rounded-2xl animate-pulse" />)}
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-white/20">
                    <MessageSquare size={24} />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">No active outreach</p>
                </div>
              ) : (
                requests.slice(0, 3).map(r => (
                  <Link key={r.id} to="/messages" className="flex items-center space-x-4 group border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-white group-hover:text-primary-400 transition-colors truncate">{r.funderName}</p>
                      <p className="text-[10px] font-bold text-slate-500 truncate">{r.lastMessage}</p>
                    </div>
                    <span className="text-[9px] font-black text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded uppercase">{r.status}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

        </aside>
      </div>

      {isFormOpen && (
        <ProposalForm onClose={() => setIsFormOpen(false)} onRefresh={fetchAllData} />
      )}
    </div>
  );
};

export default Dashboard;
