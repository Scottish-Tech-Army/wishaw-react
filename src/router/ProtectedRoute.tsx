import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { isSessionTokenValid } from '../utils/auth'
import type { Role } from '../types/domain'

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { token, role } = useAuthStore()

  if (!token || !isSessionTokenValid(token)) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
