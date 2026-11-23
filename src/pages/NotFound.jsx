import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { useAuth, ROLE_HOME } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  const { user, role } = useAuth();
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-navy-950 px-4">
      <div className="text-center max-w-md">
        <span className="mx-auto grid place-items-center h-16 w-16 rounded-2xl bg-navy-800 text-white shadow-lg"><Compass className="h-7 w-7" aria-hidden="true" /></span>
        <p className="mt-5 text-5xl font-extrabold tracking-tight text-navy-900 dark:text-white">404</p>
        <h1 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">This page is not on the campus map</h1>
        <p className="mt-1.5 text-sm muted">The page you are looking for may have moved, or you may not have access to it with your current role.</p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-2">
          <Link to={user ? ROLE_HOME[role] : '/'} className="btn-primary"><Home className="h-4 w-4" aria-hidden="true" /> Go to dashboard</Link>
          <button onClick={() => history.back()} className="btn-secondary"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Go back</button>
        </div>
      </div>
    </div>
  );
}
