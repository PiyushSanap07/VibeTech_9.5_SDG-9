import React, { useState, useEffect } from 'react';
import { db, functions } from '../../firebase/config';
import { collection, getDocs, query, where, updateDoc, doc, addDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../../context/AuthContext';
import { seedDemoData } from '../../utils/seedData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, PieChart as PieIcon, BarChart3, Database, Users } from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalInvested: 0,
    activeProjects: 0,
    successRate: 0,
    domainDistribution: []
  });
  const [aiInsights, setAiInsights] = useState("");
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

  const [fundingRequests, setFundingRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();

    // Listen for incoming requests
    if (currentUser?.uid) {
      const q = query(
        collection(db, 'funding_requests'),
        where('funderId', '==', currentUser.uid),
        where('status', '==', 'Pending')
      );
      const unsub = onSnapshot(q, (snap) => {
        setFundingRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }
  }, [currentUser]);

  const handleRequestAction = async (request, status) => {
    try {
      // 1. Update Request Status
      // Status 'Approved' will trigger the Innovator's NotificationContext listener
      await updateDoc(doc(db, "funding_requests", request.id), {
        status: status
      });

      // 2. If Approved, Start Conversation
      if (status === 'Approved') {
        const conversationId = [currentUser.uid, request.userId].sort().join('_');
        const convRef = doc(db, 'conversations', conversationId);

        // Create/Update Conversation
        await setDoc(convRef, {
          participants: [currentUser.uid, request.userId],
          funderId: currentUser.uid,
          funderName: currentUser.displayName || "Funder",
          innovatorId: request.userId,
          innovatorName: request.userName || "Innovator",
          lastMessage: `Funding Request Approved for ${request.innovationTitle}`,
          lastUpdate: serverTimestamp(),
          online: true
        }, { merge: true });

        // Add System Message
        await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
          text: `System: Funding Request Approved for "${request.innovationTitle}". Discussion opened.`,
          senderId: 'system',
          timestamp: serverTimestamp()
        });

        // 3. Create Investment Record (for Dashboard Stats)
        await addDoc(collection(db, 'investments'), {
          funderId: currentUser.uid,
          innovatorId: request.userId,
          innovationId: request.innovationId,
          innovationTitle: request.innovationTitle,
          amount: request.requestedAmount || 0,
          status: 'active', // This triggers the "Active Projects" count
          domain: request.innovationDomain || 'General',
          createdAt: serverTimestamp()
        });
      }

      alert(`Request has been ${status.toLowerCase()}.`);
    } catch (err) {
      console.error("Error updating request:", err);
      alert("Action failed. Try again.");
    }
  };

  const fetchDashboardData = async () => {
    try {
      const q = query(collection(db, 'investments'), where('funderId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const investments = snap.docs.map(doc => doc.data());

      const total = investments.reduce((acc, curr) => acc + curr.amount, 0);
      const active = investments.filter(i => i.status === 'active').length;

      // Domain Distribution
      const domains = {};
      investments.forEach(i => {
        domains[i.domain] = (domains[i.domain] || 0) + i.amount;
      });
      const domainData = Object.entries(domains).map(([name, value]) => ({ name, value }));

      setStats({
        totalInvested: total,
        activeProjects: active,
        successRate: 85, // Mock
        domainDistribution: domainData
      });

      // Get AI Insights
      const predictFundUtilization = httpsCallable(functions, 'predictFundUtilization');
      const result = await predictFundUtilization({ escrowData: { total }, milestones: [] });
      setAiInsights(result.data.timingWarnings?.[0] || "AI projects show 30% higher completion rate in this portfolio.");

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, Funder</h1>
          <p className="text-slate-500">Here's an AI-powered overview of your R&D investments.</p>
        </div>
        <button
          onClick={async () => {
            await seedDemoData();
            alert('Demo proposals seeded!');
            fetchDashboardData();
          }}
          className="btn-secondary flex items-center gap-2 border-slate-200"
        >
          <Database className="w-4 h-4" />
          Seed Demo Proposals
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Invested', value: `$${(stats.totalInvested / 1000000).toFixed(1)}M`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Projects', value: stats.activeProjects, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Avg. Success Rate', value: `${stats.successRate}%`, icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Risk Alert', value: 'Low', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className={`${stat.bg} p-3 rounded-xl`}>
              <stat.icon className={`${stat.color} w-6 h-6`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights Card */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-primary-200 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary-300" />
            <h2 className="text-lg font-bold">AI Portfolio Analyst</h2>
          </div>
          <p className="text-2xl font-medium text-primary-50 leading-snug">
            "{aiInsights}"
          </p>
        </div>
        <button className="relative z-10 bg-white text-primary-700 px-6 py-3 rounded-2xl font-bold hover:bg-primary-50 transition-all shadow-lg">
          Generate Full Insight Report
        </button>
      </div>

      {/* Incoming Funding Requests */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" /> Incoming Proposals
        </h2>
        {fundingRequests.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
            No pending requests.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fundingRequests.map(req => (
              <div key={req.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">New Request</span>
                    <h3 className="font-bold text-slate-900 mt-2">{req.innovationTitle || `Innovation #${req.innovationId.substring(0, 5)}`}</h3>
                    <p className="text-xs font-bold text-emerald-600 mt-1">Requested: ${Number(req.requestedAmount || 0).toLocaleString()}</p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                    {req.createdAt?.toDate ? new Date(req.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                  </span>
                </div>

                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl italic border border-slate-100">
                  "{req.lastMessage}"
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleRequestAction(req, 'Approved')}
                    className="flex-1 btn-primary py-2 text-xs flex items-center justify-center gap-1"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => handleRequestAction(req, 'Rejected')}
                    className="flex-1 py-2 rounded-xl border border-slate-200 font-bold text-slate-500 hover:bg-slate-50 text-xs"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-primary-600" />
              Domain Allocation
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.domainDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.domainDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Investment Growth
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.domainDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
