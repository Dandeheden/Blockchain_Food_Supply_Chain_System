import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Show spinner while auth loads
export const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-green-700 font-medium">Loading FoodTrace...</p>
    </div>
  </div>
);

// Redirect to login if not authenticated
export const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
};

// Redirect to dashboard if already authenticated
export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

// Restrict to specific roles
export const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};
