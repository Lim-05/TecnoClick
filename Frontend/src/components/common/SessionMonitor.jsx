import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// The server determines expiry; authFetch renews the short-lived JWT.
export default function SessionMonitor() {
  const navigate = useNavigate();
  useEffect(() => {
    const expired = () => navigate('/login', { replace: true });
    window.addEventListener('sessionExpired', expired);
    return () => window.removeEventListener('sessionExpired', expired);
  }, [navigate]);
  return null;
}
