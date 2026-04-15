import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/auth-context';
import { ThemeProvider } from './components/layout/ThemeProvider';
import { Toaster } from './components/ui/toaster';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import BugsPage from './pages/BugsPage';
import CreateBugPage from './pages/CreateBugPage';
import BugDetailPage from './pages/BugDetailPage';
import EditBugPage from './pages/EditBugPage';
import UsersManagementPage from './pages/UsersManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReleaseNotesPage from './pages/ReleaseNotesPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="bugs" element={<BugsPage />} />
        <Route path="bugs/new" element={<CreateBugPage />} />
        <Route path="bugs/:id" element={<BugDetailPage />} />
        <Route path="bugs/:id/edit" element={<EditBugPage />} />
        <Route path="users" element={<UsersManagementPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="release-notes" element={<ReleaseNotesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
