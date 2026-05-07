import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import Layout from './Layout';
import { Loading } from './ui';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();
  if (isLoading) return <Loading text="Authenticating..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin()) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

export function AuthRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <Loading text="Loading..." />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}
