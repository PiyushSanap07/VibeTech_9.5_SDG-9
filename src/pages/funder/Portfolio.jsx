import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

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
    fetchInvestments();
  }, [currentUser]);

  const fetchInvestments = async () => {
    try {
      const q = query(collection(db, 'investments'), where('funderId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvestments(docs);

      // Calculate Stats
      const projects = {};
      docs.forEach(i => {
        const title = i.innovationTitle || i.title || "Unknown Project";
        projects[title] = (projects[title] || 0) + (Number(i.amount) || 0);
      });
      const projectData = Object.entries(projects).map(([name, value]) => ({ name, value }));
      setStats({ projectDistribution: projectData });

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const runAIAnalytics = async () => {
    // ... (same as before)
  };

  if (loading) return <div>Loading portfolio...</div>;

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

      {/* Existing List */}
      <div className="grid grid-cols-1 gap-6">
        {investments.map(project => {
          // ... (rest of list logic)
          const projectInsight = aiInsights?.projects?.find(p => p.id === project.id);
          return (
            <div key={project.id} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-6 hover:shadow-2xl transition-all border-l-4 border-l-primary-500">
              {/* ... (content same as before, just ensuring mapping is correct) */}
              {/* I will use the original card content in next chunk if needed or just replacing wrapper */}
              {/* Since I am replacing the whole file's logic blocks, I need to be careful. */}
              {/* Actually, replace_file_content is block-based. The instruction above is replacing imports and top logic. I should target specific blocks. */}
            </div>
          );
        })}
      </div>
    </div>
  );
};
// To minimize error, I will do a Full File replacement or large chunk replacement since structure changed significantly with imports.
// I'll select the whole file content to be safe.
export default Portfolio;
