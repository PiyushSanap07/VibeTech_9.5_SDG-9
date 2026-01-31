import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';

// Layouts
import FunderLayout from './components/funder/Layout';
import InnovatorLayout from './components/layout/InnovatorLayout';

// Funder Pages
import FunderDashboard from './pages/funder/Dashboard';
import FunderProposals from './pages/funder/Proposals';
import FunderPortfolio from './pages/funder/Portfolio';
import FunderProfile from './pages/funder/Profile';

// Innovator Pages
import InnovatorDashboard from './pages/innovator/Dashboard';
import InnovatorProfile from './pages/innovator/Profile';
import InnovatorInnovations from './pages/innovator/Innovations';
import InnovatorFunders from './pages/innovator/Funders';
import InnovatorFunderProfile from './pages/innovator/FunderProfile';
import InnovatorMilestones from './pages/innovator/Milestones';
import InnovatorWallet from './pages/innovator/Wallet';

// Auth Redirect Component
const AuthRedirect = () => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LandingPage />;
  }

  // Redirect based on role
  if (userRole === 'innovator') {
    return <Navigate to="/innovator/dashboard" replace />;
  } else if (userRole === 'funder') {
    return <Navigate to="/funder/dashboard" replace />;
  }

  return <LandingPage />;
};

import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<AuthRedirect />} />

            {/* Innovator Auth Routes */}
            <Route path="/innovator/login" element={<Login role="innovator" />} />
            <Route path="/innovator/register" element={<Register role="innovator" />} />

            {/* Funder Auth Routes */}
            <Route path="/funder/login" element={<Login role="funder" />} />
            <Route path="/funder/register" element={<Register role="funder" />} />

            {/* Funder Routes */}
            <Route
              path="/funder"
              element={
                <ProtectedRoute allowedRole="funder">
                  <FunderLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/funder/dashboard" replace />} />
              <Route path="dashboard" element={<FunderDashboard />} />
              <Route path="proposals" element={<FunderProposals />} />
              <Route path="portfolio" element={<FunderPortfolio />} />
              <Route path="profile" element={<FunderProfile />} />
            </Route>

            {/* Innovator Routes */}
            <Route
              path="/innovator"
              element={
                <ProtectedRoute allowedRole="innovator">
                  <InnovatorLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/innovator/dashboard" replace />} />
              <Route path="dashboard" element={<InnovatorDashboard />} />
              <Route path="profile" element={<InnovatorProfile />} />
              <Route path="innovations" element={<InnovatorInnovations />} />
              <Route path="funders" element={<InnovatorFunders />} />
              <Route path="funders/:id" element={<InnovatorFunderProfile />} />
              <Route path="milestones" element={<InnovatorMilestones />} />
              <Route path="wallet" element={<InnovatorWallet />} />
            </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
