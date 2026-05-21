import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AppLoader from '../../components/common/AppLoader';
import { useAuth } from '../../hooks/useAuth';
import {
  getPostLoginRoute,
  needsRegistrationCompletion,
} from '../../utils/authRoutes.js';

export const GuestRoute = () => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return <AppLoader message="جاري تجهيز التطبيق..." fullPage />;
  }

  if (isAuthenticated && needsRegistrationCompletion(user)) {
    const returnUrl = `${location.pathname}${location.search}${location.hash}`;
    return (
      <Navigate
        to="/continue-registration"
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
    return <Navigate to={getPostLoginRoute(user, state?.from)} replace />;
  }

  return <Outlet />;
};
