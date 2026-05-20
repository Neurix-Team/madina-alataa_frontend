//authentication related routes and logic to determine default route based on user roles and checking if user needs to complete registration
export const getDefaultRouteByUser = (user) => {
  const roles = user?.roles || [];

  if (roles.includes('admin')) return '/admin';
  if (roles.includes('parent')) return '/parents';
  if (roles.includes('reviewer')) return '/incoming-requests';
  if (roles.includes('donor')) return '/cases';
  if (roles.includes('volunteer')) return '/map';

  return '/cases';
};

export const needsRegistrationCompletion = (user) => {
  return Boolean(
    user?.requiresRegistrationCompletion ||
    user?.mustCreatePassword ||
    user?.registrationStatus === 'pending_password' ||
    user?.isRegistrationCompleted === false
  );
};