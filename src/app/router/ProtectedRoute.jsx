// src/app/router/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AppLoader from '../../components/common/AppLoader';
import { useAuth } from '../../hooks/useAuth';
import { needsRegistrationCompletion } from '../../utils/authRoutes.js';

export const ProtectedRoute = () => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return <AppLoader message="جاري تجهيز التطبيق..." fullPage />;
  }

  if (!isAuthenticated) {
    const returnUrl = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from: returnUrl }} />;
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
