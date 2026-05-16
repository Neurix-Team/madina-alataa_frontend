// src/app/router/ProtectedRoute.jsx
// for handling protected routes that require authentication, it checks if the user is authenticated and if they need to complete registration after social login. If the user is not authenticated, it redirects them to the login page and preserves the intended destination in the state. If the user is authenticated but needs to complete registration, it redirects them to the continue registration page with the necessary user data in the state. If the user is authenticated and doesn't need to complete registration, it renders the child routes using <Outlet />.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { needsRegistrationCompletion } from '../../utils/authRoutes.js';

export const ProtectedRoute = () => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <div style={{ fontFamily: 'Cairo', fontWeight: 700, color: '#1e293b' }}>جاري التحميل...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve full URL: pathname + search + hash
    const returnUrl = `${location.pathname}${location.search}${location.hash}`;
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: returnUrl }}
      />
    );
  }

  if (needsRegistrationCompletion(user)) {
    return (
      <Navigate
        to="/auth/social/continue-registration"
        replace
        state={{
          userId: user?.id,
          email: user?.email,
          provider: user?.provider,
          tempToken: user?.tempToken,
          from: `${location.pathname}${location.search}`,
        }}
      />
    );
  }

  return <Outlet />;
};
