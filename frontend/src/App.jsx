import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { SuperAdminDashboardPage } from './pages/SuperAdminDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AnalyzeTextPage } from './pages/AnalyzeTextPage';
import { AnalyzeFilesPage } from './pages/AnalyzeFilesPage';
import { RealTimeMonitoringPage } from './pages/RealTimeMonitoringPage';
import { ReportsPage } from './pages/ReportsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPages } from './pages/AuthPages';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

// Authenticated Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F7FF]">
        <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Role-Based Access Guard
const RoleRouteGuard = ({ allowedRoles, children }) => {
  const { user, normRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F7FF]">
        <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
      </div>
    );
  }

  const role = normRole || (user?.role === 'Super Admin' ? 'SUPER_ADMIN' : user?.role === 'Admin' ? 'ADMIN' : 'USER');

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Smart Default Redirect based on user role
const RootRedirect = () => {
  const { user, getDashboardRoute, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F7FF]">
        <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
      </div>
    );
  }

  return <Navigate to={getDashboardRoute(user)} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/login" element={<AuthPages initialMode="login" />} />
          <Route path="/register" element={<AuthPages initialMode="register" />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Application Layout & Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dynamic Root Index: redirects to user's assigned role dashboard */}
            <Route index element={<RootRedirect />} />

            {/* Role Dashboards */}
            <Route
              path="super-admin/dashboard"
              element={
                <RoleRouteGuard allowedRoles={['SUPER_ADMIN']}>
                  <SuperAdminDashboardPage />
                </RoleRouteGuard>
              }
            />
            <Route
              path="admin/dashboard"
              element={
                <RoleRouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                  <AdminDashboardPage />
                </RoleRouteGuard>
              }
            />
            <Route
              path="user/dashboard"
              element={
                <RoleRouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'USER']}>
                  <UserDashboardPage />
                </RoleRouteGuard>
              }
            />

            {/* Analysis Modules & Tools */}
            <Route path="analyze-text" element={<AnalyzeTextPage />} />
            <Route path="analyze-files" element={<AnalyzeFilesPage />} />
            <Route path="monitoring" element={<RealTimeMonitoringPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="insights" element={<AIInsightsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
