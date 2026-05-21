import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { ProtectedRoute } from '../app/router/ProtectedRoute';
import { RoleGuard } from '../app/router/RoleGuard';
import { GuestRoute } from '../app/router/GuestRoute';
import { CompleteRegistrationRoute } from '../app/router/CompleteRegistrationRoute';
import { useAuth } from '../hooks/useAuth';
import { getPostLoginRoute } from '../utils/authRoutes';
import AppLoader from '../components/common/AppLoader';

// Auth
const AuthScreen = lazy(() => import('../components/auth/AuthScreen'));

// Layout
const Layout = lazy(() => import('../components/layout/Layout'));

// Pages
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));
const MyDonationsPage = lazy(() => import('../pages/MyDonationsPage'));
const MyChildrenPage = lazy(() => import('../pages/MyChildrenPage'));
const AvatarPage = lazy(() => import('../pages/AvatarPage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const ProfileV2Page = lazy(() => import('../pages/ProfileV2Page'));
const CasesPage = lazy(() => import('../pages/CasesPage/CasesPage'));
const CaseDetailsPage = lazy(() => import('../pages/CaseDetailsPage'));
const DonationCheckoutPage = lazy(() => import('../pages/DonationCheckoutPage'));
const CreateRequestPage = lazy(() => import('../pages/CreateRequestPage'));
const IncomingRequestsPage = lazy(() => import('../pages/IncomingRequestsPage'));
const ContinueRegistrationPage = lazy(() => import('../pages/ContinueRegistrationPage'));
const AuthCallback = lazy(() => import('../components/auth/AuthCallback'));
const DonationRequestsPage = lazy(() => import('../pages/DonationRequestsPage'));
const UserDonationRequestsPage = lazy(() => import('../pages/UserDonationRequestsPage'));
const CreateDonationRequestPage = lazy(() => import('../pages/CreateDonationRequestPage'));
const UpdateProfilePage = lazy(() => import('../pages/UpdateProfilePage'));
const AvatarEditPage = lazy(() => import('../pages/AvatarEditPage'));
const DonationOrdersPage = lazy(() => import('../pages/DonationOrdersPage'));
const DonationRequestPage = lazy(() => import('../pages/DonationRequestPage'));
const MyDonationOrdersPage = lazy(() => import('../pages/MyDonationOrdersPage'));
const DonorDonationOrdersPage = lazy(() => import('../pages/DonorDonationOrdersPage'));
const VolunteerRequestsPage = lazy(() => import('../pages/VolunteerRequestsPage'));
const VolunteerOrdersPage = lazy(() => import('../pages/VolunteerOrdersPage'));
const CertificatesPage = lazy(() => import('../pages/CertificatesPage'));

// Tabs
const ProfileTab = lazy(() => import('../components/tabs/ProfileTab'));
const ImpactTab = lazy(() => import('../components/tabs/ImpactTab'));
const MapTab = lazy(() => import('../components/tabs/MapTab'));
const BadgesTab = lazy(() => import('../components/tabs/BadgesTab'));
const ActivitiesTab = lazy(() => import('../components/tabs/ActivitiesTab'));
const LevelsTab = lazy(() => import('../components/tabs/LevelsTab'));
const LeaderboardTab = lazy(() => import('../components/tabs/LeaderboardTab'));
const OrdersTab = lazy(() => import('../components/tabs/OrdersTab'));
const DailyTasksTab = lazy(() => import('../components/tabs/DailyTasksTab'));
const GeoQuestsTab = lazy(() => import('../components/tabs/GeoQuestsTab'));
const TeamChallengesTab = lazy(() => import('../components/tabs/TeamChallengesTab'));
const CityExplorationTab = lazy(() => import('../components/tabs/CityExplorationTab'));
const CityMapTab = lazy(() => import('../components/tabs/CityMapTab'));
const ParentsTab = lazy(() => import('../components/tabs/ParentsTab'));
const AdminTab = lazy(() => import('../components/tabs/AdminTab'));
const MissionsTab = lazy(() => import('../components/tabs/MissionsTab'));
const AvailableMissionsTab = lazy(() => import('../components/tabs/AvailableMissionsTab'));
const LocationsTab = lazy(() => import('../components/tabs/LocationsTab'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <div style={{ fontFamily: 'Cairo', fontWeight: 700, color: '#1e293b' }}>جاري تحميل الصفحة...</div>
  </div>
);

const RouteLoadingFallback = () => <AppLoader message="جاري تحميل الصفحة..." fullPage />;

const HomeRedirect = () => {
  const { user, isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return <RouteLoadingFallback />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getPostLoginRoute(user)} replace />;
};

export const AppRouter = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Guest only routes */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<AuthScreen />} />
        </Route>

        {/* Public route */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/signin-google" element={<Navigate to="/auth/callback" replace />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/continue-registration" element={<ContinueRegistrationPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<HomeRedirect />} />

            {/* General protected pages */}
            <Route path="/profile-v2" element={<UpdateProfilePage />} />
            <Route path="/profile" element={<ProfileTab />} />
            <Route path="/impact" element={<ImpactTab />} />
            <Route path="/map" element={<MapTab />} />
            <Route path="/badges" element={<BadgesTab />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/activities" element={<ActivitiesTab />} />
            <Route path="/levels" element={<LevelsTab />} />
            <Route path="/leaderboard" element={<LeaderboardTab />} />
            <Route path="/orders" element={<OrdersTab />} />
            <Route path="/daily-tasks" element={<DailyTasksTab />} />
            <Route path="/geo-quests" element={<GeoQuestsTab />} />
            <Route path="/city-exploration" element={<CityExplorationTab />} />
            <Route path="/city-map" element={<CityMapTab />} />
            <Route path="/team-challenges" element={<TeamChallengesTab />} />
            <Route path="/avatar" element={<AvatarEditPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/locations" element={<LocationsTab />} />

            {/* Available missions for user, volunteer, and donor only */}
            <Route element={<RoleGuard allowedRoles={['user', 'volunteer', 'donor']} allowAdmin={false} />}>
              <Route path="/available-missions" element={<AvailableMissionsTab />} />
            </Route>

            {/* Cases & Donations */}
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/cases/:id" element={<CaseDetailsPage />} />
            <Route path="/donate/:id" element={<DonationCheckoutPage />} />
            <Route path="/my-donations" element={<MyDonationsPage />} />

            {/* Donation Orders */}
            <Route path="/donation-request" element={<DonationRequestPage />} />
            <Route path="/my-donation-orders" element={<MyDonationOrdersPage />} />
            <Route path="/donation-orders-donor" element={<DonorDonationOrdersPage />} />
            <Route path="/my-donation-requests" element={<UserDonationRequestsPage />} />
            <Route path="/approved-donation-requests" element={<UserDonationRequestsPage />} />
            <Route path="/volunteer-requests" element={<VolunteerRequestsPage />} />
            <Route path="/volunteer-orders" element={<VolunteerOrdersPage />} />

            {/* Request creation */}
            <Route path="/create-request" element={<CreateRequestPage />} />

            {/* My Children - available for donors, volunteers, and parents (not admin) */}
            <Route path="/my-children" element={<MyChildrenPage />} />

            {/* Parent routes */}
            <Route element={<RoleGuard allowedRoles={['parent']} />}>
              <Route path="/parents" element={<ParentsTab />} />
            </Route>

            {/* Admin routes */}
            <Route element={<RoleGuard allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminTab />} />
              <Route path="/missions" element={<MissionsTab />} />
              <Route path="/incoming-requests" element={<IncomingRequestsPage />} />
              <Route path="/donation-orders" element={<DonationOrdersPage />} />
              <Route path="/donation-requests" element={<DonationRequestsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </Suspense>
  );
};
