// src/app/router/RoleGuard.jsx

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const RoleGuard = ({ allowedRoles = [] }) => {
  const { user, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <div>جاري التحميل...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRoles = user?.roles || [];

  // ✅ الأدمن يدخل أي RoleGuard تلقائيًا
  if (userRoles.includes('admin')) {
    return <Outlet />;
  }

  const isAllowed = allowedRoles.some((role) => userRoles.includes(role));

  if (!isAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};