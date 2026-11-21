import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzeTextPage } from './pages/AnalyzeTextPage';
import { AnalyzeFilesPage } from './pages/AnalyzeFilesPage';
import { RealTimeMonitoringPage } from './pages/RealTimeMonitoringPage';
import { ReportsPage } from './pages/ReportsPage';
import { HistoryPage } from './pages/HistoryPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPages } from './pages/AuthPages';

// Protected Route Wrapper
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<AuthPages initialMode="login" />} />
          <Route path="/register" element={<AuthPages initialMode="register" />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
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
