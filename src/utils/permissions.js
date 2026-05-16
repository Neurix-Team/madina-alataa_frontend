// src/utils/permissions.js

// All possible permissions in the system
export const PERMISSIONS = {
  VIEW_CASES: 'view_cases',
  VIEW_MAP: 'view_map',
  VIEW_IMPACT: 'view_impact',
  VIEW_BADGES: 'view_badges',
  VIEW_LEADERBOARD: 'view_leaderboard',
  VIEW_ORDERS: 'view_orders',
  VIEW_NOTIFICATIONS: 'view_notifications',
  VIEW_MY_DONATIONS: 'view_my_donations',
  VIEW_PARENTS: 'view_parents',
  VIEW_ADMIN: 'view_admin',
  CREATE_REQUEST: 'create_request',
  MANAGE_USERS: 'manage_users',
  REVIEW_CASES: 'review_cases',
  VIEW_DAILY_TASKS: 'view_daily_tasks',
  VIEW_GEO_QUESTS: 'view_geo_quests',
  VIEW_TEAM_CHALLENGES: 'view_team_challenges',
  VIEW_CHILDREN: 'view_children',
  VIEW_VOLUNTEER_FEATURES: 'view_volunteer_features',
  VIEW_DONOR_FEATURES: 'view_donor_features',
};

// Permissions for each role
export const ROLE_PERMISSIONS = {
  user: [
    PERMISSIONS.VIEW_CASES,
    PERMISSIONS.VIEW_MAP,
    PERMISSIONS.VIEW_IMPACT,
    PERMISSIONS.VIEW_BADGES,
    PERMISSIONS.VIEW_LEADERBOARD,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.VIEW_GEO_QUESTS,
    PERMISSIONS.VIEW_CHILDREN,
  ],
  donor: [
    PERMISSIONS.VIEW_CASES,
    PERMISSIONS.VIEW_MAP,
    PERMISSIONS.VIEW_IMPACT,
    PERMISSIONS.VIEW_BADGES,
    PERMISSIONS.VIEW_LEADERBOARD,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.VIEW_MY_DONATIONS,
    PERMISSIONS.VIEW_GEO_QUESTS,
    PERMISSIONS.VIEW_CHILDREN,
    PERMISSIONS.VIEW_DONOR_FEATURES,
  ],
  parent: [
    PERMISSIONS.VIEW_CASES,
    PERMISSIONS.VIEW_MAP,
    PERMISSIONS.VIEW_IMPACT,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.VIEW_PARENTS,
    PERMISSIONS.CREATE_REQUEST,
    PERMISSIONS.VIEW_GEO_QUESTS,
    PERMISSIONS.VIEW_CHILDREN,
  ],
  volunteer: [
    PERMISSIONS.VIEW_CASES,
    PERMISSIONS.VIEW_MAP,
    PERMISSIONS.VIEW_IMPACT,
    PERMISSIONS.VIEW_BADGES,
    PERMISSIONS.VIEW_LEADERBOARD,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_DAILY_TASKS,
    PERMISSIONS.VIEW_GEO_QUESTS,
    PERMISSIONS.VIEW_TEAM_CHALLENGES,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.VIEW_CHILDREN,
    PERMISSIONS.VIEW_VOLUNTEER_FEATURES,
  ],
  reviewer: [
    PERMISSIONS.VIEW_CASES,
    PERMISSIONS.VIEW_IMPACT,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.REVIEW_CASES,
    PERMISSIONS.VIEW_GEO_QUESTS,
  ],
  admin: Object.values(PERMISSIONS).filter(p => 
    p !== PERMISSIONS.VIEW_CHILDREN && 
    p !== PERMISSIONS.VIEW_VOLUNTEER_FEATURES && 
    p !== PERMISSIONS.VIEW_DONOR_FEATURES &&
    p !== PERMISSIONS.VIEW_MY_DONATIONS
  ), // All permissions except user-specific features not supported for admin account
};

// Get all permissions for an array of roles
export const getPermissionsByRoles = (roles) => {
  const permissions = new Set();
  roles.forEach(role => {
    if (ROLE_PERMISSIONS[role]) {
      ROLE_PERMISSIONS[role].forEach(permission => permissions.add(permission));
    }
  });
  return Array.from(permissions);
};

// Check if user has a specific permission
export const hasPermission = (user, permission) => {
  if (!user || !user.roles) return false;
  const userPermissions = getPermissionsByRoles(user.roles);
  return userPermissions.includes(permission);
};

// Check if user has any of the permissions in the array
export const hasAnyPermission = (user, permissions) => {
  if (!user || !user.roles) return false;
  const userPermissions = getPermissionsByRoles(user.roles);
  return permissions.some(permission => userPermissions.includes(permission));
};
