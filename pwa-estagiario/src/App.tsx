import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import AuthCallbackPage from './pages/AuthCallbackPage.tsx';
import HomePage from './pages/HomePage.tsx';
import ScanPage from './pages/ScanPage.tsx';
import HistoryPage from './pages/HistoryPage.tsx';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" theme="dark" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
