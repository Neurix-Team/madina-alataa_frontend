//authentication related routes and logic to determine default route based on user roles and checking if user needs to complete registration
const LAST_ROUTE_PREFIX = 'madina_last_route_';

const normalizeRoles = (roles) => {
  if (!roles) return [];
  return Array.isArray(roles)
    ? roles.map((role) => String(role).toLowerCase())
    : [String(roles).toLowerCase()];
};

const normalizePath = (path) => {
  if (!path || typeof path !== 'string') return '';
  const [withoutHash] = path.split('#');
  const [withoutQuery] = withoutHash.split('?');
  return withoutQuery || '';
};

const ADMIN_ONLY_PATHS = [
  '/admin',
  '/missions',
  '/incoming-requests',
  '/donation-orders',
  '/donation-requests',
  '/activities',
  '/levels',
];

const PARENT_PATHS = ['/parents'];

const NON_RESTORE_PATHS = [
  '',
  '/',
  '/login',
  '/auth/callback',
  '/signin-google',
  '/continue-registration',
  '/unauthorized',
  '/cases',
];

const roleKeyForUser = (user) => {
  const roles = normalizeRoles(user?.roles || user?.role || user?.user?.roles);
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('parent')) return 'parent';
  if (roles.includes('reviewer')) return 'reviewer';
  if (roles.includes('volunteer')) return 'volunteer';
  if (roles.includes('donor')) return 'donor';
  return 'user';
};

export const getDefaultRouteByUser = (user) => {
  const roles = normalizeRoles(user?.roles || user?.role || user?.user?.roles);

  if (roles.includes('admin')) return '/admin';
  if (roles.includes('parent')) return '/parents';
  if (roles.includes('reviewer')) return '/incoming-requests';
  if (roles.includes('donor')) return '/profile-v2';
  if (roles.includes('volunteer')) return '/map';

  return '/profile-v2';
};

export const canUserAccessRoute = (user, path) => {
  const cleanPath = normalizePath(path);
  const roles = normalizeRoles(user?.roles || user?.role || user?.user?.roles);

  if (!cleanPath || NON_RESTORE_PATHS.includes(cleanPath) || cleanPath.startsWith('/cases/')) return false;

  if (ADMIN_ONLY_PATHS.some((adminPath) => cleanPath === adminPath || cleanPath.startsWith(`${adminPath}/`))) {
    return roles.includes('admin');
  }

  if (PARENT_PATHS.some((parentPath) => cleanPath === parentPath || cleanPath.startsWith(`${parentPath}/`))) {
    return roles.includes('parent') || roles.includes('admin');
  }

  if (cleanPath === '/available-missions') {
    return !roles.includes('admin');
  }

  return true;
};

export const rememberLastRouteForUser = (user, path) => {
  const cleanPath = normalizePath(path);
  if (!user || !canUserAccessRoute(user, cleanPath)) return;
  localStorage.setItem(`${LAST_ROUTE_PREFIX}${roleKeyForUser(user)}`, cleanPath);
};

export const getLastRouteForUser = (user) => {
  if (!user) return null;
  const route = localStorage.getItem(`${LAST_ROUTE_PREFIX}${roleKeyForUser(user)}`);
  return canUserAccessRoute(user, route) ? route : null;
};

export const getPostLoginRoute = (user, requestedRoute = null) => {
  if (canUserAccessRoute(user, requestedRoute)) {
    return normalizePath(requestedRoute);
  }

  return getLastRouteForUser(user) || getDefaultRouteByUser(user);
};

export const needsRegistrationCompletion = (user) => {
  return Boolean(
    user?.requiresRegistrationCompletion ||
    user?.mustCreatePassword ||
    user?.registrationStatus === 'pending_password' ||
    user?.isRegistrationCompleted === false
  );
};
