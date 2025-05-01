import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// مكون يقوم بتحويل المستخدم إلى صفحة الأنظمة إذا لم يوجد systemId في localStorage
export default function RedirectIfNoSystemId() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // لا تعيد التوجيه إذا كان المستخدم بالفعل في /systems
    if (location.pathname.startsWith('/systems')) return;
    const systemId = localStorage.getItem('selectedSystemId');
    if (!systemId) {
      navigate('/systems', { replace: true });
    }
  }, [navigate, location]);

  return null;
}
