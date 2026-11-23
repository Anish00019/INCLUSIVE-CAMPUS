import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, ROLE_HOME } from '../../context/AuthContext';
import { LoadingScreen } from '../common/ui';

export default function ProtectedRoute({ allow }) {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-navy-950"><LoadingScreen /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (allow && !allow.includes(role)) return <Navigate to={ROLE_HOME[role] || '/dashboard'} replace />;

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, loading, role } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-navy-950"><LoadingScreen /></div>;
  if (user) return <Navigate to={ROLE_HOME[role] || '/dashboard'} replace />;
  return <Outlet />;
}
