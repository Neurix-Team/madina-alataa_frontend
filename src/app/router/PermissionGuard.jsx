// src/app/router/PermissionGuard.jsx

import { usePermissions } from '../../hooks/usePermissions';

export const PermissionGuard = ({ permissions, children, fallback = null }) => {
  const { canAny } = usePermissions();

  if (canAny(permissions)) {
    return children;
  }

  return fallback;
};