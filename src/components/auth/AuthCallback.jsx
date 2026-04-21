import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // استخراج الـ code من الرابط
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const needsRegistration = urlParams.get('needsregistration') === 'true';

    if (code) {
      // استبدال الشفرة بـ JWT من الـ Backend
      axios
        .post('/api/auth/exchange-code', { code })
        .then((response) => {
          const { token, user } = response.data;

          // تخزين التوكن في LocalStorage
          localStorage.setItem('auth_token', token);

          // إذا كان يحتاج استكمال التسجيل
          if (needsRegistration) {
            navigate('/complete-registration'); // توجيه المستخدم لصفحة استكمال التسجيل
          } else {
            navigate('/dashboard'); // توجيه المستخدم إلى لوحة التحكم
          }
        })
        .catch((err) => {
          setError('حدث خطأ أثناء تسجيل الدخول');
          console.error(err);
        })
        .finally(() => setLoading(false));
    } else {
      setError('الشفرة غير صالحة أو مفقودة');
      setLoading(false);
    }
  }, [navigate]);

  if (loading) return <div>جاري معالجة الطلب...</div>;

  return (
    <div>
      {error && <p>{error}</p>}
      <p>تم تسجيل الدخول بنجاح!</p>
    </div>
  );
};

export default AuthCallback;