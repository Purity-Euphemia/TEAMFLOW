import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  return (
    <Routes>
      {/* Public Landing Page Route */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      {/* Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tasks" element={<div style={{padding: '2rem'}}><h2>My Tasks</h2><p>Coming soon...</p></div>} />
          <Route path="/projects" element={<div style={{padding: '2rem'}}><h2>Projects</h2><p>Coming soon...</p></div>} />
          <Route path="/team" element={<div style={{padding: '2rem'}}><h2>Team</h2><p>Coming soon...</p></div>} />
          <Route path="/notifications" element={<div style={{padding: '2rem'}}><h2>Notifications</h2><p>Coming soon...</p></div>} />
          <Route path="/settings" element={<div style={{padding: '2rem'}}><h2>Settings</h2><p>Coming soon...</p></div>} />
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
