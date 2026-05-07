import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Role } from '../types';
import { useAuth } from '../store/authContextCore';

interface Props {
  readonly children: ReactNode;
  readonly requiredRole?: Role;
}

function hasRequiredRole(userRole: Role, required: Role): boolean {
  if (required === 'user') return true;
  if (required === 'admin') return userRole === 'admin' || userRole === 'superadmin';
  return userRole === 'superadmin';
}

function roleHome(role: Role): string {
  if (role === 'superadmin') return '/superadmin';
  if (role === 'admin') return '/admin';
  return '/';
}

export default function ProtectedRoute({ children, requiredRole = 'user' }: Props) {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!hasRequiredRole(currentUser.role, requiredRole)) {
    return <Navigate to={roleHome(currentUser.role)} replace />;
  }

  return <>{children}</>;
}
