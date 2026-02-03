import React, { useState, useEffect } from 'react';
import { db, functions } from '../../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, AlertTriangle, CheckCircle, TrendingUp, Sparkles, Clock, ShieldCheck, ChevronRight, FileText, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import MilestoneModal from '../../components/funder/MilestoneModal';
import { getMockPortfolioAnalytics } from '../../utils/aiFallback';

const Portfolio = () => {
  const { currentUser } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [stats, setStats] = useState({ projectDistribution: [] });

  const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

  useEffect(() => {
    if (currentUser) {
      fetchInvestments();
    }
  }, [currentUser]);

  const fetchInvestments = async () => {
    try {
      const q = query(collection(db, 'investments'), where('funderId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvestments(docs);

      // Calculate Stats: Project Allocation
      const projects = {};
      docs.forEach(i => {
        const title = i.innovationTitle || i.title || "Unknown Project";
        projects[title] = (projects[title] || 0) + (Number(i.amount) || 0);
      });
      const projectData = Object.entries(projects).map(([name, value]) => ({ name, value }));
      setStats({ projectDistribution: projectData });

    } catch (error) {
      console.error("Error fetching investments:", error);
    } finally {
      setLoading(false);
    }
  };

  const runAIAnalytics = async () => {
    try {
      setAnalyzing(true);
      const getPortfolioInsights = httpsCallable(functions, 'getPortfolioInsights');
      const result = await getPortfolioInsights({ investments });
      setAiInsights(result.data);
    } catch (error) {
      console.error("Error running AI analytics:", error);
      // Fallback to mock data
      console.warn("AI service failed, using fallback data.");
      const mockInsights = getMockPortfolioAnalytics(investments);
      setAiInsights(mockInsights);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading portfolio...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Investment Portfolio</h1>
          <p className="text-slate-500">Track your active R&D projects and AI success predictions.</p>
        </div>
        <button
          onClick={runAIAnalytics}
          disabled={analyzing || investments.length === 0}
          className="btn-primary flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {analyzing ? 'Analyzing Portfolio...' : 'Predict Project Success'}
        </button>
      </div>

      {/* AI Insights Banner */}
      {aiInsights && (
        <div className="bg-primary-900 text-white p-6 rounded-2xl shadow-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="bg-primary-700 p-3 rounded-xl shrink-0">
            <Sparkles className="w-6 h-6 text-primary-300" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">AI Portfolio Insight</h3>
            <p className="text-primary-100 text-sm italic">"{aiInsights.generalInsight}"</p>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      {investments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-primary-600" />
                Project Allocation
              </h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.projectDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.projectDistribution.map((entry, index) => (
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
                <BarChart data={stats.projectDistribution}>
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
      )}

      {/* Investments List */}
      <div className="grid grid-cols-1 gap-6">
        {investments.map(project => {
          const projectInsight = aiInsights?.projects?.find(p => p.id === project.id);
          return (
            <div key={project.id} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-6 hover:shadow-2xl transition-all border-l-4 border-l-primary-500">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">{project.domain || 'General'}</span>
                    <h3 className="text-xl font-bold text-slate-900">{project.innovationTitle || project.title}</h3>
                  </div>
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                    project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                  )}>
                    {project.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Invested</p>
                    <p className="font-bold text-slate-900">${Number(project.amount).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-600" style={{ width: `${project.progress || 0}%` }} />
                      </div>
                      <span className="text-xs font-bold">{project.progress || 0}%</span>
                    </div>
                  </div>
                  {projectInsight && (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] text-primary-500 font-bold uppercase flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Success Prob.
                        </p>
                        <p className="font-black text-primary-700">{projectInsight.successProbability}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-amber-500 font-bold uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          AI Risk Level
                        </p>
                        <p className={clsx(
                          "font-bold",
                          projectInsight.isAtRisk ? "text-red-600" : "text-green-600"
                        )}>
                          {projectInsight.isAtRisk ? 'High Risk' : 'Low Risk'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[180px]">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="w-full btn-secondary py-2 flex items-center justify-center gap-2 text-sm"
                >
                  <Clock className="w-4 h-4" />
                  Milestones
                </button>
                <button className="w-full btn-primary py-2 flex items-center justify-center gap-2 text-sm bg-slate-900 border-none">
                  <FileText className="w-4 h-4" />
                  Full Report
                </button>
              </div>
            </div>
          );
        })}

        {investments.length === 0 && (
          <div className="text-center py-20 glass-card rounded-2xl">
            <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No active investments yet.</p>
            <p className="text-slate-400 text-sm">Accept proposals to start your portfolio.</p>
          </div>
        )}
      </div>

      {selectedProject && (
        <MilestoneModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdate={fetchInvestments}
        />
      )}
    </div>
  );
};

const clsx = (...args) => args.filter(Boolean).join(' ');

export default Portfolio;
