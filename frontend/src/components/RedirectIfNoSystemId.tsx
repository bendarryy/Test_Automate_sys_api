import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelectedSystemId } from 'shared/hooks/useSelectedSystemId';

// مكون يقوم بتحويل المستخدم إلى صفحة الأنظمة إذا لم يوجد systemId في localStorage
export default function RedirectIfNoSystemId() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSystemId] = useSelectedSystemId();

  useEffect(() => {
    // لا تعيد التوجيه إذا كان المستخدم بالفعل في /systems
    if (location.pathname.startsWith('/systems')) return;
    if (!selectedSystemId) {
      navigate('/systems', { replace: true });
    }
  }, [navigate, location, selectedSystemId]);

  return null;
}
