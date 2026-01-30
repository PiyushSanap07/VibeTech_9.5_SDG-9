import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute component for role-based access control.
 * @param {React.ReactNode} children - The component to render if authorized.
 * @param {string} allowedRole - The role allowed to access this route ('innovator' or 'funder').
 */
const ProtectedRoute = ({ children, allowedRole }) => {
    const { currentUser, userRole, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Not logged in
    if (!currentUser) {
        return <Navigate to={`/${allowedRole}/login`} state={{ from: location }} replace />;
    }

    // Logged in but role doesn't match
    if (allowedRole && userRole !== allowedRole) {
        // Redirect to the correct dashboard based on actual role
        if (userRole === 'innovator') {
            return <Navigate to="/innovator/dashboard" replace />;
        } else if (userRole === 'funder') {
            return <Navigate to="/funder/dashboard" replace />;
        } else {
            // No role assigned, go to role-specific login
            return <Navigate to={`/${allowedRole}/login`} replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
