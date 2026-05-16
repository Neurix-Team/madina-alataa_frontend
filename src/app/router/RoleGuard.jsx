import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { needsRegistrationCompletion } from '../../utils/authRoutes.js';

const normalizeRole = (role) => String(role || '').trim().toLowerCase();

export const RoleGuard = ({ allowedRoles = [] }) => {
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

  if (!isAuthenticated || !user) {
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

  // الأدمن يدخل أي RoleGuard
  if (userRoles.includes('admin')) {
    return <Outlet />;
  }

  const isAllowed = allowedRoles.some((role) => userRoles.includes(normalizeRole(role)));

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
