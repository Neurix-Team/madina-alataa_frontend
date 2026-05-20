import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AppLoader from '../../components/common/AppLoader';
import { useAuth } from '../../hooks/useAuth';
import { needsRegistrationCompletion } from '../../utils/authRoutes.js';

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

export const RoleGuard = ({ allowedRoles = [], allowAdmin = true }) => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return <AppLoader message="جاري تجهيز التطبيق..." fullPage />;
  }

  if (!isAuthenticated || !user) {
    const returnUrl = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from: returnUrl }} />;
  }

  if (needsRegistrationCompletion(user)) {
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

  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map(normalizeRole)
    : [normalizeRole(user?.roles)];

  if (allowAdmin && userRoles.includes('admin')) {
    return <Outlet />;
  }

  const isAllowed = allowedRoles.some((role) => userRoles.includes(normalizeRole(role)));
  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
