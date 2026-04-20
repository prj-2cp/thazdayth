import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/Context/AuthContext';

/**
 * PROTECTED ROUTE COMPONENT
 * Simple wrapper that redirects to /connexion if the user is not authenticated.
 * It also saves the current location to redirect back after login.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return null; // Or a loading spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/connexion" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
