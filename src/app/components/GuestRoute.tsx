import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router';
import { useAuth } from '../lib/AuthContext';

interface GuestRouteProps {
  children?: React.ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return <>{children || <Outlet />}</>;
}
