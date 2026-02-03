import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, query, limit, where } from 'firebase/firestore';
import {
  Search, Filter, Users, Award, Zap,
  ArrowUpRight, Target, ShieldCheck, Star,
  TrendingUp, Landmark
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LiveFundersShowcase from '../../components/innovator/LiveFundersShowcase';
import { useAuth } from '../../context/AuthContext';
import { seedDemoData } from '../../utils/seedData'; // Import seed utility
import { Database } from 'lucide-react';

const Funders = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [funders, setFunders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchFunders();
  }, []);

  const fetchFunders = async () => {
    setLoading(true);
    try {
      // Query "users" collection for users with role "funder"
      const q = query(collection(db, "users"), where("role", "==", "funder"), limit(100));
      const snap = await getDocs(q);

      if (snap.empty) {
        setFunders([]);
      } else {
        const allFunders = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          matchScore: doc.data().matchScore || Math.floor(Math.random() * (98 - 85 + 1)) + 85
        }));

        // Filter out anonymous entries
        setFunders(allFunders.filter(f => f.name && !f.name.toLowerCase().includes('anonymous')));

      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Extract unique domains and types for filter dropdowns
  const domains = ['All', ...new Set(funders.flatMap(f => f.focus || []))];
  const types = ['All', ...new Set(funders.map(f => f.type || 'Enterprise'))];

  const filteredFunders = funders.filter(f => {
    const matchesSearch = (f.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      f.focus?.some(focus => focus.toLowerCase().includes(search.toLowerCase()));

    const matchesDomain = selectedDomain === 'All' || f.focus?.includes(selectedDomain);
    const matchesType = selectedType === 'All' || (f.type || 'Enterprise') === selectedType;

    return matchesSearch && matchesDomain && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <header className="space-y-1 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Funder <span className="text-primary-600">Discovery</span></h1>
          <p className="text-slate-500 font-medium text-lg">Connect with global capital optimized for your research domain.</p>
        </div>

        {/* Helper Seed Button for Demo */}
        <button
          onClick={async () => {
            if (window.confirm("Populate 'Big Firm' demo data (Tata, Reliance, etc.)?")) {
              await seedDemoData();
              window.location.reload();
            }
          }}
          className="flex items-center text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors uppercase tracking-widest"
        >
          <Database size={14} className="mr-1" /> Load Demo Data
        </button>
      </header>

      {/* Live AI Showcase */}
      <section>
        <LiveFundersShowcase userProfile={userData} />
      </section>

      <div className="flex flex-col md:flex-row items-center gap-4 pt-10 border-t border-slate-200">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by organization name, investment focus, or domain..."
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-semibold shadow-sm text-slate-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {/* Domain Filter */}
          <div className="relative">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="appearance-none pl-6 pr-10 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all cursor-pointer outline-none focus:border-primary-500"
            >
              {domains.map(d => <option key={d} value={d}>{d === 'All' ? 'All Domains' : d}</option>)}
            </select>
            <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none pl-6 pr-10 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all cursor-pointer outline-none focus:border-primary-500"
            >
              {types.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
            </select>
            <Landmark size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 bg-slate-100 rounded-[2.5rem] animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {filteredFunders.map((funder, i) => (
            <motion.div
              key={funder.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/innovator/funders/${funder.id}`)}
              className="premium-card group cursor-pointer overflow-hidden relative"
            >
              {/* Match Badge */}
              <div className="absolute top-6 right-6 z-10">
                <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl flex items-center shadow-lg shadow-indigo-500/30">
                  <Zap size={12} className="mr-1 fill-white" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">{funder.matchScore}% Match</span>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="flex items-center space-x-5">
                  <div className="w-16 h-16 rounded-3xl bg-primary-100 flex items-center justify-center text-primary-600 font-black text-2xl shadow-inner group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                    {funder?.name?.charAt(0) || "?"}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors">{funder?.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Established Fund</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {funder.focus?.slice(0, 3).map(domain => (
                      <span key={domain} className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100 uppercase tracking-tight">{domain}</span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed italic">
                    "Specializing in {funder.focus?.[0]} R&D with a commitment to sustainable innovation and market disruption."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                      <TrendingUp size={10} className="mr-1" /> Capital Range
                    </p>
                    <p className="text-xs font-black text-slate-900">${funder.minBudget?.toLocaleString()}+</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                      <ShieldCheck size={10} className="mr-1" /> Risk Profile
                    </p>
                    <p className="text-xs font-black text-slate-900">{funder.riskAppetite || 'Balanced'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-4 bg-slate-50 text-slate-900 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                    View Profile
                  </button>
                  <button
                    onClick={() => navigate(`/innovator/funders/${funder.id}`, { state: { openRequest: true } })}
                    className="flex-1 py-4 bg-primary-600 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 relative z-20">
                    Request Fund <Zap size={14} className="ml-2 fill-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Funders;
