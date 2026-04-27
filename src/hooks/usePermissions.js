// src/hooks/usePermissions.js

import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { getPermissionsByRoles, hasPermission, hasAnyPermission } from '../utils/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user || !user.roles) return [];
    return getPermissionsByRoles(user.roles);
  }, [user]);

  const can = (permission) => {
    return hasPermission(user, permission);
  };

  const canAny = (permissionArray) => {
    return hasAnyPermission(user, permissionArray);
  };

  return {
    permissions,
    can,
    canAny,
  };
};