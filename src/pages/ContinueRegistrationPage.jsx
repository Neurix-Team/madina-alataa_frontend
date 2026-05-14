import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FaLock, FaCheckCircle, FaRocket } from 'react-icons/fa';
import AnimatedBackground from '../components/common/AnimatedBackground';
import AudioManager from '../services/AudioManager';

const ContinueRegistrationPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, continueRegistration, setAuthError, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get user info from location state or current user context
  // Handle Google OAuth response structure
  const googleResponseData = location.state;
  const userId = location.state?.userId || 
                location.state?.UserId || 
                location.state?.user?.id || 
                location.state?.data?.user?.id ||
                user?.id;
  const email = location.state?.email || 
               location.state?.Email || 
               location.state?.user?.email || 
               location.state?.data?.user?.email ||
               user?.email;
  
  // Log the received data for debugging
  console.log('Continue Registration - Location State:', location.state);
  console.log('Continue Registration - Extracted userId:', userId);
  console.log('Continue Registration - Extracted email:', email);

  React.useEffect(() => {
    return () => setAuthError(null);
  }, [setAuthError]);

  // حفظ userId في localStorage لتسهيل الوصول لاحقًا
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && userId) {
        window.localStorage.setItem('madina_continue_user_id', String(userId));
        console.log('Saved madina_continue_user_id:', window.localStorage.getItem('madina_continue_user_id'));
      }
    } catch (e) {
      console.warn('Failed to save madina_continue_user_id to localStorage', e);
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setAuthError('الرجاء إدخال كلمة المرور وتأكيدها');
      return;
    }
    if (newPassword !== confirmPassword) {
      setAuthError('كلمات المرور غير متطابقة');
      return;
    }
    if (newPassword.length < 8) {
      setAuthError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await continueRegistration(userId, newPassword, googleResponseData);
      if (updatedUser) {
        AudioManager.getInstance().play('win');
        navigate('/profile-v2');
      }
    } catch (error) {
      AudioManager.getInstance().play('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-modal-overlay" style={{ minHeight: '100vh', padding: '2rem' }}>
      <AnimatedBackground variant="rocket" />
      
      <div className="app-modal-card" style={{ maxWidth: '450px' }}>
        <div className="app-modal-header" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <FaRocket size={40} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h2 className="app-modal-title">أهلاً بك في مدينة العطاء!</h2>
          <p className="app-modal-subtitle">بما أنك قمت بتسجيل الدخول عبر جوجل، يرجى تعيين كلمة مرور لحسابك لإكمال التسجيل.</p>
        </div>

        {authError && (
          <div style={{
            backgroundColor: 'var(--error-light)',
            color: 'var(--error)',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '1rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            border: '1px solid var(--error)',
          }}>
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="app-form">
          <div className="app-form-group">
            <label className="app-form-label">البريد الإلكتروني</label>
            <input 
              type="text" 
              value={email || ''} 
              disabled 
              className="app-form-input"
              style={{ backgroundColor: 'var(--bg-card-2)', cursor: 'not-allowed', opacity: 0.7 }} 
            />
          </div>

          <div className="app-form-group">
            <label className="app-form-label">كلمة المرور الجديدة</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="password"
                placeholder="أدخل كلمة مرور قوية"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="app-form-input w-full pr-10"
              />
            </div>
          </div>

          <div className="app-form-group">
            <label className="app-form-label">تأكيد كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <FaCheckCircle style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="password"
                placeholder="أعد إدخال كلمة المرور"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="app-form-input w-full pr-10"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="app-btn-primary w-full py-4 text-lg mt-4"
          >
            {loading ? 'جاري الحفظ...' : 'إكمال التسجيل والدخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContinueRegistrationPage;
