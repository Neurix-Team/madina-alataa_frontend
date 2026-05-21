import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPostLoginRoute } from '../utils/authRoutes';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleBack = () => {
    navigate(isAuthenticated ? getPostLoginRoute(user) : '/login', { replace: true });
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>غير مصرح لك بالوصول</h1>
      <p>ليس لديك صلاحية لعرض هذه الصفحة.</p>
      <button onClick={handleBack}>العودة للرئيسية</button>
    </div>
  );
};

export default UnauthorizedPage;
