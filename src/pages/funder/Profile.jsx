import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, functions } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { Sparkles, Save, Shield, DollarSign, Target } from 'lucide-react';
import { getMockInvestmentStrategy } from '../../utils/aiFallback';

const Profile = () => {
  const { currentUser, userData } = useAuth();
  const [preferences, setPreferences] = useState({
    domains: [],
    budgetRange: { min: 50000, max: 500000 },
    riskAppetite: 'Medium'
  });
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userData) {
      setPreferences(userData.preferences || preferences);
    }
  }, [userData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log("Saving preferences:", preferences);
      const funderRef = doc(db, 'users', currentUser.uid);

      await setDoc(funderRef, {
        email: currentUser.email,
        preferences: preferences,
        updatedAt: new Date()
      }, { merge: true });

      alert('Profile updated successfully!');
    } catch (error) {
      console.error("Save Error:", error);
      alert(`Error saving profile: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getAiAssistance = async () => {
    try {
      setLoading(true);
      const suggestInvestmentStrategy = httpsCallable(functions, 'suggestInvestmentStrategy');
      const result = await suggestInvestmentStrategy({ preferences });
      setAiSuggestions(result.data);
    } catch (error) {
      console.error(error);
      // Fallback to mock data
      console.warn("AI service failed, using fallback data.");
      const mockSuggestions = getMockInvestmentStrategy(preferences);
      setAiSuggestions(mockSuggestions);
      alert('AI service currently unavailable - showing simulation based on your preferences.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Investment Profile</h1>
        <p className="text-slate-500">Define your preferences and get AI-powered insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <section className="glass-card p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Target className="text-primary-600 w-5 h-5" />
              <h2 className="font-semibold text-lg">Target Domains</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {['AI & ML', 'BioTech', 'CleanTech', 'Quantum Computing', 'SpaceTech', 'FinTech', 'CyberSecurity'].map(domain => (
                <button
                  key={domain}
                  onClick={() => {
                    const domains = preferences.domains.includes(domain)
                      ? preferences.domains.filter(d => d !== domain)
                      : [...preferences.domains, domain];
                    setPreferences({ ...preferences, domains });
                  }}
                  className={clsx(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    preferences.domains.includes(domain)
                      ? "bg-primary-600 text-white shadow-md shadow-primary-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {domain}
                </button>
              ))}
            </div>
          </section>

          <section className="glass-card p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <DollarSign className="text-primary-600 w-5 h-5" />
              <h2 className="font-semibold text-lg">Budget Range ($)</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Minimum</label>
                <input
                  type="number"
                  value={preferences.budgetRange.min}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    budgetRange: { ...preferences.budgetRange, min: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Maximum</label>
                <input
                  type="number"
                  value={preferences.budgetRange.max}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    budgetRange: { ...preferences.budgetRange, max: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
          </section>

          <section className="glass-card p-6 rounded-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Shield className="text-primary-600 w-5 h-5" />
              <h2 className="font-semibold text-lg">Risk Appetite</h2>
            </div>

            <div className="flex gap-4">
              {['Low', 'Medium', 'High'].map(risk => (
                <label key={risk} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="risk"
                    className="hidden peer"
                    checked={preferences.riskAppetite === risk}
                    onChange={() => setPreferences({ ...preferences, riskAppetite: risk })}
                  />
                  <div className="text-center p-4 border border-slate-200 rounded-xl peer-checked:border-primary-600 peer-checked:bg-primary-50 transition-all">
                    <span className="text-sm font-medium">{risk}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full btn-primary py-4 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        {/* AI Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl shadow-primary-100">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold">AI Strategist</h3>
            </div>
            <p className="text-sm text-primary-100 mb-6">
              Get personalized recommendations based on current R&D trends and your risk profile.
            </p>
            <button
              onClick={getAiAssistance}
              disabled={loading}
              className="w-full bg-white text-primary-700 hover:bg-primary-50 px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Analyzing...' : 'Analyze My Strategy'}
            </button>
          </div>

          {aiSuggestions && (
            <div className="glass-card p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary-600" />
                Recommended Domains
              </h4>
              <ul className="space-y-2 mb-6">
                {aiSuggestions.domains.map(domain => (
                  <li key={domain} className="text-sm text-slate-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    {domain}
                  </li>
                ))}
              </ul>

              <h4 className="font-bold text-slate-900 mb-2">AI Rationale</h4>
              <p className="text-xs text-slate-500 italic">{aiSuggestions.rationale}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const clsx = (...args) => args.filter(Boolean).join(' ');

export default Profile;
