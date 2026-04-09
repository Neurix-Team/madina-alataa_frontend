// src/pages/UnauthorizedPage.jsx

import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>غير مصرح لك بالوصول</h1>
      <p>ليس لديك صلاحية لعرض هذه الصفحة.</p>
      <button onClick={() => navigate('/')}>العودة للرئيسية</button>
    </div>
  );
};

export default UnauthorizedPage;