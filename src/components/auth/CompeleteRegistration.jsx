import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CompleteRegistration = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('من فضلك أدخل كلمة مرور');
      return;
    }

    try {
      // إرسال كلمة المرور إلى الـ Backend
      const response = await axios.post('/api/auth/complete-registration', { password });
      navigate('/dashboard'); // توجيه المستخدم إلى لوحة التحكم
    } catch (err) {
      setError('حدث خطأ أثناء استكمال التسجيل');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>استكمال التسجيل</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="أدخل كلمة مرورك"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p>{error}</p>}
        <button type="submit">أكمل التسجيل</button>
      </form>
    </div>
  );
};

export default CompleteRegistration;