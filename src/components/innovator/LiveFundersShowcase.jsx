
import React, { useState, useEffect } from 'react';
import { db, functions, auth } from '../../firebase/config';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, Users, DollarSign, Clock,
    Sparkles, ArrowRight, Building2, Target, CheckCircle2, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LiveFundersShowcase = () => {
    const { userData } = useAuth();
    const navigate = useNavigate();
    const [funders, setFunders] = useState([]);
    const [metrics, setMetrics] = useState({ count: 0, capital: 0 });
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);

    // New State for Active Matching
    const [innovations, setInnovations] = useState([]);
    const [selectedInnovation, setSelectedInnovation] = useState('profile'); // 'profile' or innovationId

    useEffect(() => {
        fetchInnovations();
        fetchFunders();
    }, [userData]); // Refresh if user profile changes

    const fetchInnovations = async () => {
        if (!userData?.id) return; // Wait for full user data if needed, or use auth.currentUser
        try {
            const q = query(collection(db, "innovations"), where("userId", "==", auth.currentUser.uid));
            const snap = await getDocs(q);
            setInnovations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) { console.error("Error fetching innovations for match:", err); }
    };

    const fetchFunders = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'funders'));
            const snap = await getDocs(q);
            // Filter out anonymous or invalid entries
            const validData = snap.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(f => f.name && f.name !== 'Anonymous' && f.name !== 'Anonymous Funder');

            // Sort by budget desc to show "Big Firms" first
            validData.sort((a, b) => (Number(b.minBudget) || 0) - (Number(a.minBudget) || 0));

            setFunders(validData);

            // Calculate Metrics
            const capital = validData.reduce((acc, curr) => acc + (Number(curr.minBudget) || 0), 0);
            setMetrics({
                count: validData.length,
                capital: capital
            });

            // Trigger AI Recommendations (Default to Profile based first)
            // if (validData.length > 0) {
            //     fetchAIRecommendations(validData, 'profile');
            // } else {
            setLoading(false);
            // }

        } catch (err) {
            console.error("Error fetching funders:", err);
            setLoading(false);
        }
    };

    const handleMatchChange = (val) => {
        setSelectedInnovation(val);
        fetchAIRecommendations(funders, val);
    };

    const fetchAIRecommendations = async (fundersList, contextId) => {
        try {
            setAiLoading(true);
            const recommendFn = httpsCallable(functions, 'recommendFunders');

            const lightweightFunders = fundersList.map(f => ({
                id: f.id,
                name: f.name,
                focus: f.focus,
                type: f.type,
                details: f.details
            }));

            let payload = {
                availableFunders: lightweightFunders
            };

            if (contextId === 'profile') {
                payload.innovatorProfile = {
                    domain: userData?.domain || 'General',
                    skills: userData?.skills || [],
                    bio: userData?.bio || ''
                };
            } else {
                const inn = innovations.find(i => i.id === contextId);
                if (inn) {
                    payload.innovation = {
                        title: inn.title,
                        description: inn.description,
                        domain: inn.domain
                    };
                }
            }

            const result = await recommendFn(payload);

            if (result.data.recommendations) {
                setRecommendations(result.data.recommendations);
            }
        } catch (err) {
            console.error("AI Recommendation error:", err);
        } finally {
            setLoading(false);
            setAiLoading(false);
        }
    };

    const getMatchScore = (funderId) => {
        const match = recommendations.find(r => r.funderId === funderId);
        return match ? match : null;
    };

    return (
        <div className="space-y-6">
            {/* Header & Metrics */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <h2 className="text-sm font-black text-emerald-600 uppercase tracking-widest">Live Capital Feed</h2>
                    </div>

                    <div className="flex items-center gap-4 mb-1">
                        <h1 className="text-3xl font-black text-slate-900">Active Strategic Partners</h1>
                        {/* Innovation Selector for Active Matching */}
                        <div className="relative z-10">
                            <select
                                value={selectedInnovation}
                                onChange={(e) => handleMatchChange(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold rounded-xl text-xs uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                            >
                                <option value="profile">Match for: My Profile</option>
                                {innovations.map(inn => (
                                    <option key={inn.id} value={inn.id}>Match for: {inn.title.substring(0, 20)}...</option>
                                ))}
                            </select>
                            <Sparkles size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium mt-1">Real-time institutions deploying capital in your sector.</p>
                </div>

                {/* Live Ticker */}
                <div className="flex items-center gap-6 bg-slate-900 text-white p-4 rounded-2xl shadow-xl shadow-slate-900/10">
                    <div className="text-center px-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Partners</p>
                        <p className="text-xl font-black">{metrics.count}</p>
                    </div>
                    <div className="w-px h-8 bg-slate-700"></div>
                    <div className="text-center px-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Capital</p>
                        <p className="text-xl font-black text-emerald-400">${(metrics.capital / 1000000).toFixed(1)}M+</p>
                    </div>
                    <div className="w-px h-8 bg-slate-700"></div>
                    <div className="text-center px-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                        <p className="text-xl font-black flex items-center justify-center">
                            <Clock size={16} className="mr-1 text-primary-400" /> 24h
                        </p>
                    </div>
                </div>
            </div>

            {/* Horizontal Scroll Feed */}
            <div className="relative group">
                <div className="overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide flex gap-6">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="min-w-[320px] h-64 bg-slate-100 rounded-3xl animate-pulse" />
                        ))
                    ) : funders.length === 0 ? (
                        <div className="w-full text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold">No public funders listed yet.</p>
                        </div>
                    ) : (
                        funders.map((funder, i) => {
                            const match = getMatchScore(funder.id);

                            return (
                                <motion.div
                                    key={funder.id}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -5 }}
                                    className={`min-w-[340px] p-1 rounded-[2rem] bg-gradient-to-br ${match ? 'from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/20' : 'from-slate-100 to-slate-200'}`}
                                >
                                    <div className="bg-white h-full rounded-[1.8rem] p-6 flex flex-col justify-between relative overflow-hidden">
                                        {match && (
                                            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-bl-xl flex items-center">
                                                <Sparkles size={12} className="mr-1" /> {match.matchScore}% Match
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${match ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {funder.name?.charAt(0) || "?"}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{funder.name || "Anonymous Funder"}</h3>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{funder.type || "Enterprise"}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg">
                                                    <Target size={14} className="mr-2 text-slate-400" />
                                                    <span className="truncate">{funder.focus?.join(", ") || "General Tech"}</span>
                                                </div>
                                                <div className="flex items-center text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg">
                                                    <DollarSign size={14} className="mr-2 text-slate-400" />
                                                    <span>${(Number(funder.minBudget) || 0).toLocaleString()} Min. Ticket</span>
                                                </div>
                                            </div>

                                            {match && (
                                                <div className="bg-indigo-50 p-3 rounded-xl">
                                                    <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest mb-1 flex items-center">
                                                        <Sparkles size={10} className="mr-1" /> AI Insight
                                                    </p>
                                                    <p className="text-xs text-indigo-700 leading-snug font-medium italic">"{match.matchReason}"</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 flex gap-2">
                                            <button
                                                onClick={() => navigate(`/innovator/funders/${funder.id}`)}
                                                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${match ? 'bg-slate-900 text-white hover:bg-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                <span>View Profile</span>
                                            </button>
                                            <button
                                                onClick={() => navigate(`/innovator/funders/${funder.id}`, { state: { openRequest: true } })}
                                                className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200"
                                            >
                                                <Zap size={14} className="fill-primary-600" />
                                                <span>Request Fund</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveFundersShowcase;
