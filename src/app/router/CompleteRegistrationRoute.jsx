// for handling routes that require users to complete their registration after social login, it checks if the user has the necessary social data and if they are authenticated but still need to complete registration, it redirects them to the appropriate page. If they don't have the required social data, it redirects them to the login page. If they are authenticated and don't need to complete registration, it redirects them to their default route based on their roles.
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AppLoader from '../../components/common/AppLoader';
import { useAuth } from '../../hooks/useAuth';
import {
  getDefaultRouteByUser,
  needsRegistrationCompletion,
} from '../../utils/authRoutes.js';

export const CompleteRegistrationRoute = () => {
  const { user, isAuthenticated, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return <AppLoader message="جاري تجهيز التسجيل..." fullPage />;
  }

  const state = location.state || {};
  const searchParams = new URLSearchParams(location.search);

  const hasSocialData =
    state.userId ||
    searchParams.get('userId') ||
    user?.id;

  if (!hasSocialData) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && !needsRegistrationCompletion(user)) {
    return <Navigate to={getDefaultRouteByUser(user)} replace />;
  }

  return <Outlet />;
};
