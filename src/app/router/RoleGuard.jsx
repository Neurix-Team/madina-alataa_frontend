// src/app/router/RoleGuard.jsx
// for handling role-based access control to routes, it checks if the user is authenticated and has the required roles to access the route. If the user is not authenticated, it redirects them to the login page. If the user is authenticated but needs to complete registration, it redirects them to the continue registration page. If the user is authenticated but doesn't have the required roles, it redirects them to an unauthorized page. If the user has the required roles, it renders the child routes using <Outlet />.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { needsRegistrationCompletion } from '../../utils/authRoutes.js';

export const RoleGuard = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return <div>جاري التحميل...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
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
          from: location.pathname,
        }}
      />
    );
  }

  const userRoles = user?.roles || [];

  // الأدمن يدخل أي RoleGuard
  if (userRoles.includes('admin')) {
    return <Outlet />;
  }

  const isAllowed = allowedRoles.some((role) => userRoles.includes(role));

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};