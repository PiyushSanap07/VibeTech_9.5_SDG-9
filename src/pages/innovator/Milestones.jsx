import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ListChecks, Plus, Calendar, DollarSign, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Milestones = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(null); // For modal
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [newTitile, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [excludeDate, setExcludeDate] = useState(''); // We'll just use string for simplicity or date input

  useEffect(() => {
    const fetchProjects = async () => {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, "investments"),
        where("innovatorId", "==", auth.currentUser.uid),
        where("status", "==", "active")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(projs);
        setLoading(false);
      });
      return unsubscribe;
    };
    fetchProjects();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <header className="space-y-1">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Execution <span className="text-primary-600">Milestones</span></h1>
        <p className="text-slate-500 font-medium text-lg">Define success metrics and unlock tranches of your approved funding.</p>
      </header>

      {loading ? (
        <div className="p-20 text-center animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Active Contracts...</div>
      ) : projects.length === 0 ? (
        <div className="premium-card p-20 text-center space-y-4">
          <ListChecks size={48} className="mx-auto text-slate-200" />
          <p className="text-slate-500 font-bold">No active funded projects found.</p>
          <p className="text-xs text-slate-400">Once a funder approves your request, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {projects.map(project => (
            <ProjectMilestoneCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectMilestoneCard = ({ project }) => {
  const [milestones, setMilestones] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    // Listen to subcollection 'milestones'
    const q = collection(db, "investments", project.id, "milestones");
    const unsubscribe = onSnapshot(q, (snap) => {
      setMilestones(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, [project.id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    try {
      await addDoc(collection(db, "investments", project.id, "milestones"), {
        title,
        amount: Number(amount),
        dueDate: date,
        status: 'Pending', // Pending, In Progress, verified
        createdAt: serverTimestamp()
      });
      setIsFormOpen(false);
      setTitle('');
      setAmount('');
      setDate('');
    } catch (err) {
      console.error(err);
      alert("Failed to add milestone.");
    }
  };

  return (
    <div className="premium-card overflow-hidden">
      <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary-400">{project.domain}</span>
          <h3 className="text-xl font-bold">{project.innovationTitle}</h3>
          <p className="text-xs text-slate-400 mt-1">Total Grant: ${Number(project.amount).toLocaleString()}</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary bg-white text-slate-900 hover:bg-slate-100 border-none flex items-center text-xs"
        >
          <Plus size={16} className="mr-2" /> Add Milestone
        </button>
      </div>

      <div className="p-6">
        {milestones.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-xl">
            No milestones defined yet.
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map(m => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${m.status === 'Verified' ? 'bg-green-100 text-green-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                    {m.status === 'Verified' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{m.title}</p>
                    <p className="text-xs text-slate-500 font-medium">Due: {m.dueDate || 'flexible'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">${m.amount?.toLocaleString()}</p>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {isFormOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <form onSubmit={handleCreate} className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">New Milestone Definition</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    className="input-field"
                    placeholder="Milestone Title (e.g., prototype)"
                    value={title} onChange={e => setTitle(e.target.value)} required
                  />
                  <input
                    type="number" className="input-field"
                    placeholder="Tranche Amount ($)"
                    value={amount} onChange={e => setAmount(e.target.value)} required
                  />
                  <input
                    type="date" className="input-field"
                    value={date} onChange={e => setDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="text-xs font-bold text-slate-500 hover:text-slate-900">Cancel</button>
                  <button type="submit" className="btn-primary py-2 text-xs">Save Milestone</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Milestones;
