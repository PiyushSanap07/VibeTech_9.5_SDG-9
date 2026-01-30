import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Sparkles, Save, Plus, X, User, Briefcase, Globe, Award, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    domain: '',
    skills: [],
    experience: '',
    bio: '',
    portfolio: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile({ ...profile, ...docSnap.data() });
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(docRef, profile);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const generateAIHelp = async () => {
    if (!profile.domain || profile.skills.length === 0) {
      alert("Please enter a domain and at least one skill first.");
      return;
    }
    setAiLoading(true);
    try {
      const result = await generateProfileAI({
        domain: profile.domain,
        skills: profile.skills,
        experience: profile.experience
      });
      const { bio, suggestedSkills: suggestions } = result.data;
      setProfile({ ...profile, bio });
      setSuggestedSkills(suggestions);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !profile.skills.includes(s)) {
      setProfile({ ...profile, skills: [...profile.skills, s] });
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    const updated = [...profile.skills];
    updated.splice(index, 1);
    setProfile({ ...profile, skills: updated });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full" />
      <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Accessing Profile...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Professional <span className="text-primary-600">Identity</span></h1>
          <p className="text-slate-500 font-medium text-lg">Define how funders and partners see your innovation expertise.</p>
        </div>
        <button
          onClick={handleSave}
          className="btn-primary flex items-center shadow-2xl shadow-primary-500/40"
        >
          <Save size={20} className="mr-2" />
          Commit Changes
        </button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-50 text-emerald-700 p-6 rounded-[2rem] border border-emerald-100 font-bold flex items-center shadow-xl shadow-emerald-500/5"
          >
            <Award size={24} className="mr-3" />
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-10">
          <div className="premium-card p-10 space-y-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-slate-100 p-2.5 rounded-2xl text-slate-600">
                <User size={22} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Core Information</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Primary Domain</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold"
                    placeholder="e.g. Deep Tech, BioTech"
                    value={profile.domain}
                    onChange={(e) => setProfile({ ...profile, domain: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Professional Experience</label>
                  <span className="text-[10px] font-bold text-slate-300">Brief summary of career path</span>
                </div>
                <textarea
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-32 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium resize-none"
                  value={profile.experience}
                  onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Portfolio & Socials</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold"
                    placeholder="GitHub, LinkedIn, Personal Site..."
                    value={profile.portfolio}
                    onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-10">
          <div className="premium-card p-10 space-y-8 bg-slate-50/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-50 p-2.5 rounded-2xl text-primary-600">
                  <Award size={22} />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">Skill Graph</h2>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 p-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-semibold shadow-sm"
                  placeholder="New skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill(newSkill)}
                />
                <button
                  onClick={() => addSkill(newSkill)}
                  className="bg-primary-600 text-white p-4 rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
                >
                  <Plus size={24} />
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                <AnimatePresence>
                  {profile.skills.map((skill, i) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-white text-slate-700 px-4 py-2.5 rounded-2xl text-sm font-black flex items-center border border-slate-200 shadow-sm group hover:border-primary-300 transition-colors"
                    >
                      {skill}
                      <X size={16} className="ml-2 cursor-pointer text-slate-300 group-hover:text-red-500 transition-colors" onClick={() => removeSkill(i)} />
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>

              {suggestedSkills.length > 0 && (
                <div className="bg-indigo-600/5 p-6 rounded-[2rem] border border-indigo-100 space-y-4">
                  <h3 className="text-xs font-black text-indigo-800 uppercase tracking-[0.2em] flex items-center">
                    <Sparkles size={14} className="mr-2" /> AI Suggestions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => addSkill(skill)}
                        className="bg-white text-indigo-600 px-3 py-1.5 rounded-xl text-xs font-black border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 space-y-4">
              <div className="flex justify-between items-center mb-1 ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Professional Bio</label>
                <button
                  onClick={generateAIHelp}
                  disabled={aiLoading}
                  className="flex items-center text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-all disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 size={12} className="mr-1.5 animate-spin" /> : <Sparkles size={12} className="mr-1.5" />}
                  Generate with AI
                </button>
              </div>
              <textarea
                className="w-full p-6 bg-white border border-slate-100 rounded-[2rem] h-52 text-sm font-medium leading-relaxed focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm resize-none"
                placeholder="Describe your vision and technical strengths..."
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
