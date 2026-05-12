//  // src/router/AppRouter.jsx

// import { Routes, Route, Navigate } from 'react-router-dom';
// import { ProtectedRoute } from '../app/router/ProtectedRoute';
// import { RoleGuard } from '../app/router/RoleGuard';

// // Auth
// import AuthScreen from '../components/auth/AuthScreen';

// // Layout
// import Layout from '../components/layout/Layout';

// // Pages
// import UnauthorizedPage from '../pages/UnauthorizedPage';
// import MyDonationsPage from '../pages/MyDonationsPage';
// import MyChildrenPage from '../pages/MyChildrenPage';
// import AvatarPage from '../pages/AvatarPage';
// import NotificationsPage from '../pages/NotificationsPage';
// import ProfileV2Page from '../pages/ProfileV2Page';
// import CasesPage from '../pages/CasesPage/CasesPage';
// import CaseDetailsPage from '../pages/CaseDetailsPage';
// import DonationCheckoutPage from '../pages/DonationCheckoutPage';
// import CreateRequestPage from '../pages/CreateRequestPage';
// import IncomingRequestsPage from '../pages/IncomingRequestsPage';

// // Tabs
// import ProfileTab from '../components/tabs/ProfileTab';
// import ImpactTab from '../components/tabs/ImpactTab';
// import MapTab from '../components/tabs/MapTab';
// import BadgesTab from '../components/tabs/BadgesTab';
// import LeaderboardTab from '../components/tabs/LeaderboardTab';
// import OrdersTab from '../components/tabs/OrdersTab';
// import DailyTasksTab from '../components/tabs/DailyTasksTab';
// import GeoQuestsTab from '../components/tabs/GeoQuestsTab';
// import TeamChallengesTab from '../components/tabs/TeamChallengesTab';
// import CityExplorationTab from '../components/tabs/CityExplorationTab';
// import CityMapTab from '../components/tabs/CityMapTab';
// import ParentsTab from '../components/tabs/ParentsTab';
// import AdminTab from '../components/tabs/AdminTab';

// export const AppRouter = () => {
//   return (
//     <Routes>
//       {/* Public routes */}
//       <Route path="/login" element={<AuthScreen />} />
//       <Route path="/unauthorized" element={<UnauthorizedPage />} />

//       {/* <Route path="/auth/social/callback" element={<SocialCallbackPage />} />
// <Route path="/auth/social/continue-registration" element={<SocialContinueRegistrationPage />} /> */}

//       {/* Standalone pages */}
//       <Route path="/profile-v2" element={<ProfileV2Page />} />
//       <Route path="/cases" element={<CasesPage />} />
//       <Route path="/cases/:id" element={<CaseDetailsPage />} />
//       <Route path="/donate/:id" element={<DonationCheckoutPage />} />

//       {/* Protected routes */}
//       <Route element={<ProtectedRoute />}>
//         <Route  element={<Layout />}>
//           <Route index element={<Navigate to="/profile-v2" replace />} />
//           <Route path="/profile" element={<ProfileTab />} />
//           <Route path="/impact" element={<ImpactTab />} />
//           <Route path="/map" element={<MapTab />} />
//           <Route path="/badges" element={<BadgesTab />} />
//           <Route path="/leaderboard" element={<LeaderboardTab />} />
//           <Route path="/orders" element={<OrdersTab />} />
//           <Route path="/daily-tasks" element={<DailyTasksTab />} />
//           <Route path="/geo-quests" element={<GeoQuestsTab />} />
//           <Route path="/city-exploration" element={<CityExplorationTab />} />
//           <Route path="/city-map" element={<CityMapTab />} />
//           <Route path="/create-request" element={<CreateRequestPage />} />
//           <Route path="/team-challenges" element={<TeamChallengesTab />} />
//           <Route path="/my-donations" element={<MyDonationsPage />} />
//           <Route path="/notifications" element={<NotificationsPage />} />
//           <Route path="/avatar" element={<AvatarPage />} />

//           {/* Parent routes */}
//           <Route element={<RoleGuard allowedRoles={['parent']} />}>
//             <Route path="/parents" element={<ParentsTab />} />
//             <Route path="/my-children" element={<MyChildrenPage />} />
//           </Route>

//           {/* Admin routes */}
//           <Route element={<RoleGuard allowedRoles={['admin']} />}>
//             <Route path="/admin" element={<AdminTab />} />
//             <Route path="/incoming-requests" element={<IncomingRequestsPage />} />
//           </Route>
//         </Route>
//       </Route>

//       {/* Catch all */}
//       <Route path="*" element={<Navigate to="/profile-v2" replace />} />
//     </Routes>
//   );
// };

// src/router/AppRouter.jsx

import { Routes, Route, Navigate } from 'react-router-dom';

import { ProtectedRoute } from '../app/router/ProtectedRoute';
import { RoleGuard } from '../app/router/RoleGuard';
import { GuestRoute } from '../app/router/GuestRoute';
import { CompleteRegistrationRoute } from '../app/router/CompleteRegistrationRoute';

// Auth
import AuthScreen from '../components/auth/AuthScreen';

// Layout
import Layout from '../components/layout/Layout';

// Pages
import UnauthorizedPage from '../pages/UnauthorizedPage';
import MyDonationsPage from '../pages/MyDonationsPage';
import MyChildrenPage from '../pages/MyChildrenPage';
import AvatarPage from '../pages/AvatarPage';
import NotificationsPage from '../pages/NotificationsPage';
import ProfileV2Page from '../pages/ProfileV2Page';
import CasesPage from '../pages/CasesPage/CasesPage';
import CaseDetailsPage from '../pages/CaseDetailsPage';
import DonationCheckoutPage from '../pages/DonationCheckoutPage';
import CreateRequestPage from '../pages/CreateRequestPage';
import IncomingRequestsPage from '../pages/IncomingRequestsPage';
import ContinueRegistrationPage from '../pages/ContinueRegistrationPage';
import AuthCallback from '../components/auth/AuthCallback';
import DonationRequestsPage from '../pages/DonationRequestsPage';
import UserDonationRequestsPage from '../pages/UserDonationRequestsPage';
import CreateDonationRequestPage from '../pages/CreateDonationRequestPage';
import UpdateProfilePage from '../pages/UpdateProfilePage';
import AvatarEditPage from '../pages/AvatarEditPage';
import DonationOrdersPage from '../pages/DonationOrdersPage';
import DonationRequestPage from '../pages/DonationRequestPage';
import MyDonationOrdersPage from '../pages/MyDonationOrdersPage';
import DonorDonationOrdersPage from '../pages/DonorDonationOrdersPage';
import VolunteerRequestsPage from '../pages/VolunteerRequestsPage';
import VolunteerOrdersPage from '../pages/VolunteerOrdersPage';
import CertificatesPage from '../pages/CertificatesPage';

// Social Auth Pages
// اعملي الصفحتين دول بعدين أو سيبيهم commented لحد ما تجهزيهم
// import SocialCallbackPage from '../pages/auth/SocialCallbackPage';
// import SocialContinueRegistrationPage from '../pages/auth/SocialContinueRegistrationPage';

// Tabs
import ProfileTab from '../components/tabs/ProfileTab';
import ImpactTab from '../components/tabs/ImpactTab';
import MapTab from '../components/tabs/MapTab';
import BadgesTab from '../components/tabs/BadgesTab';
import ActivitiesTab from '../components/tabs/ActivitiesTab';
import LevelsTab from '../components/tabs/LevelsTab';
import LeaderboardTab from '../components/tabs/LeaderboardTab';
import OrdersTab from '../components/tabs/OrdersTab';
import DailyTasksTab from '../components/tabs/DailyTasksTab';
import GeoQuestsTab from '../components/tabs/GeoQuestsTab';
import TeamChallengesTab from '../components/tabs/TeamChallengesTab';
import CityExplorationTab from '../components/tabs/CityExplorationTab';
import CityMapTab from '../components/tabs/CityMapTab';
import ParentsTab from '../components/tabs/ParentsTab';
import AdminTab from '../components/tabs/AdminTab';
import MissionsTab from '../components/tabs/MissionsTab';
import AvailableMissionsTab from '../components/tabs/AvailableMissionsTab';
import LocationsTab from '../components/tabs/LocationsTab';

export const AppRouter = () => {
  return (
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

      {/* Social auth routes - فعليهم لما تعملي الصفحات */}
      {/*
      <Route path="/auth/social/callback" element={<SocialCallbackPage />} />

      <Route element={<CompleteRegistrationRoute />}>
        <Route
          path="/auth/social/continue-registration"
          element={<SocialContinueRegistrationPage />}
        />
      </Route>
      */}

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/profile-v2" replace />} />

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

          {/* Available missions for users */}
          <Route path="/available-missions" element={<AvailableMissionsTab />} />

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
            <Route path="/locations" element={<LocationsTab />} />
            <Route path="/incoming-requests" element={<IncomingRequestsPage />} />
            <Route path="/donation-orders" element={<DonationOrdersPage />} />
            <Route path="/donation-requests" element={<DonationRequestsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/profile-v2" replace />} />
    </Routes>
  );
};
