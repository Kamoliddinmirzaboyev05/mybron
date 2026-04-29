import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
}
