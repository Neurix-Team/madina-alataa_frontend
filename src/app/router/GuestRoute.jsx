import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  getDefaultRouteByUser,
  needsRegistrationCompletion,
} from '../../utils/authRoutes.js';

export const GuestRoute = () => {
  const { user, isAuthenticated, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <div>جاري التحميل...</div>;
  }

  if (isAuthenticated && needsRegistrationCompletion(user)) {
    return (
      <Navigate
        to="/auth/social/continue-registration"
        replace
        state={{
          userId: user?.id,
          email: user?.email,
          provider: user?.provider,
          tempToken: user?.tempToken,
        }}
      />
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getDefaultRouteByUser(user)} replace />;
  }

  return <Outlet />;
};