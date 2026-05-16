import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  getDefaultRouteByUser,
  needsRegistrationCompletion,
} from '../../utils/authRoutes.js';

export const GuestRoute = () => {
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

  if (isAuthenticated && needsRegistrationCompletion(user)) {
    const returnUrl = `${location.pathname}${location.search}${location.hash}`;
    return (
      <Navigate
        to="/auth/social/continue-registration"
        replace
        state={{
          userId: user?.id,
          email: user?.email,
          provider: user?.provider,
          tempToken: user?.tempToken,
          from: returnUrl,
        }}
      />
    );
  }

  if (isAuthenticated) {
    const state = location.state;
    const from = state?.from || getDefaultRouteByUser(user);
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
};