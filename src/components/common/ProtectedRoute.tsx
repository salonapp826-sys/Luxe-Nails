import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // During auth initialization, show the loading spinner/state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-600 mx-auto" />
          <p className="text-xs text-slate-500 font-medium animate-pulse">Checking security privileges...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated user -> redirect to login preserving destination
  if (!isAuthenticated || !user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/admin/login?redirect=${returnUrl}`} replace />;
  }

  // Special exception: If authenticated user is accessing Customizer & Subdomains,
  // allow them through directly
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');
  const isCustomizerTab =
    (location.pathname === '/admin/dashboard' && (currentTab === 'customizer' || currentTab === 'template')) ||
    location.pathname === '/admin/customizer';

  if (isCustomizerTab) {
    return <>{children}</>;
  }

  // If specific roles are required, check the user's role
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If a customer tries to access admin, redirect them to public profile
    if (role === 'customer') {
      return <Navigate to="/profile" replace />;
    }
    // Default fallback redirect to homepage
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
