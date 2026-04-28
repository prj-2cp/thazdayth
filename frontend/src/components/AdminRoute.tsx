import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/Context/AuthContext";

/**
 * ADMIN ROUTE PROTECTOR
 * This component wraps any route that should only be accessible by the owner.
 * It checks if the user is authenticated and has the 'owner' role.
 */

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "owner") {
    // If not admin, redirect to home
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
