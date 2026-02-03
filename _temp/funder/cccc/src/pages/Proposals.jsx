import React, { useState, useEffect } from 'react';
import { db, functions } from '../firebase/config';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Sparkles, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import ProposalDetailModal from '../components/ProposalDetailModal';

const Proposals = () => {
  const { funderData } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [aiMatches, setAiMatches] = useState({});
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'proposals'));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProposals(docs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIMatch = async () => {
    if (!funderData || !funderData.preferences) {
      alert('Please set your investment preferences in the Profile page first!');
      return;
    }
    try {
      setMatching(true);
      const rankProposals = httpsCallable(functions, 'rankProposals');
      const result = await rankProposals({ 
        funderPrefs: funderData.preferences,
        proposals: proposals.map(p => ({ id: p.id, title: p.title, description: p.description, domain: p.domain, budget: p.budget }))
      });
      
      if (!result.data || result.data.length === 0) {
        alert('AI could not find matches. Try adjusting your preferences.');
        return;
      }

      const matchMap = {};
      result.data.forEach(match => {
        matchMap[match.id] = match;
      });
      setAiMatches(matchMap);
      alert('AI Matching complete!');
    } catch (error) {
      console.error("Match Error:", error);
      alert(`AI Matching failed: ${error.message}`);
    } finally {
      setMatching(false);
    }
  };

  if (loading) return <div>Loading proposals...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recommended Proposals</h1>
          <p className="text-slate-500">AI-ranked opportunities based on your profile.</p>
        </div>
        <button
          onClick={handleAIMatch}
          disabled={matching}
          className="btn-primary flex items-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 border-none shadow-lg shadow-primary-100"
        >
          <Sparkles className="w-4 h-4" />
          {matching ? 'AI Matching...' : 'Run AI Matchmaker'}
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search proposals..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {proposals.map(proposal => {
          const match = aiMatches[proposal.id];
          return (
            <div 
              key={proposal.id} 
              onClick={() => setSelectedProposal(proposal)}
              className="glass-card p-6 rounded-2xl hover:ring-2 hover:ring-primary-500 transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  {proposal.domain}
                </span>
                {match && (
                  <div className="text-right">
                    <span className="block text-2xl font-black text-primary-600">{match.matchScore}%</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Match Score</span>
                  </div>
                )}
              </div>

              <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                {proposal.title}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                {proposal.description}
              </p>

              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">Funding Needed</p>
                  <p className="font-bold text-slate-900">${proposal.budget.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1 text-primary-600 font-semibold text-sm">
                  Review
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedProposal && (
        <ProposalDetailModal 
          proposal={selectedProposal} 
          onClose={() => setSelectedProposal(null)}
          aiMatch={aiMatches[selectedProposal.id]}
        />
      )}
    </div>
  );
};

export default Proposals;
