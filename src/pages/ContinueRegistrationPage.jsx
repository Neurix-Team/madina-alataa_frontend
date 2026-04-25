import React, { useState } from 'react';
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
    <div style={PAGE_STYLE}>
      <AnimatedBackground variant="rocket" />
      
      <div style={CARD_STYLE}>
        <div style={HEADER_STYLE}>
          <FaRocket size={40} color="#00bcd4" style={{ marginBottom: '1rem' }} />
          <h2 style={TITLE_STYLE}>أهلاً بك في مدينة العطاء!</h2>
          <p style={SUBTITLE_STYLE}>بما أنك قمت بتسجيل الدخول عبر جوجل، يرجى تعيين كلمة مرور لحسابك لإكمال التسجيل.</p>
        </div>

        {authError && <div style={ERROR_STYLE}>{authError}</div>}

        <form onSubmit={handleSubmit} style={FORM_STYLE}>
          <div style={FIELD_GROUP_STYLE}>
            <label style={LABEL_STYLE}>البريد الإلكتروني</label>
            <input 
              type="text" 
              value={email || ''} 
              disabled 
              style={{ ...INPUT_STYLE, backgroundColor: '#f0f0f0', cursor: 'not-allowed' }} 
            />
          </div>

          <div style={FIELD_GROUP_STYLE}>
            <label style={LABEL_STYLE}>كلمة المرور الجديدة</label>
            <div style={INPUT_WRAPPER_STYLE}>
              <FaLock style={ICON_STYLE} />
              <input
                type="password"
                placeholder="أدخل كلمة مرور قوية"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={INPUT_STYLE}
              />
            </div>
          </div>

          <div style={FIELD_GROUP_STYLE}>
            <label style={LABEL_STYLE}>تأكيد كلمة المرور</label>
            <div style={INPUT_WRAPPER_STYLE}>
              <FaCheckCircle style={ICON_STYLE} />
              <input
                type="password"
                placeholder="أعد إدخال كلمة المرور"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={INPUT_STYLE}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={BUTTON_STYLE}
          >
            {loading ? 'جاري الحفظ...' : 'إكمال التسجيل والدخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Styles
const PAGE_STYLE = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  direction: 'rtl',
  fontFamily: 'Tajawal, sans-serif',
};

const CARD_STYLE = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '24px',
  padding: '2.5rem',
  width: '100%',
  maxWidth: '450px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  zIndex: 10,
  animation: 'slideUp 0.5s ease-out',
};

const HEADER_STYLE = {
  textAlign: 'center',
  marginBottom: '2rem',
};

const TITLE_STYLE = {
  fontSize: '1.75rem',
  fontWeight: 'bold',
  color: '#2d3748',
  marginBottom: '0.5rem',
};

const SUBTITLE_STYLE = {
  fontSize: '0.95rem',
  color: '#718096',
  lineHeight: '1.5',
};

const FORM_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const FIELD_GROUP_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const LABEL_STYLE = {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#4a5568',
};

const INPUT_WRAPPER_STYLE = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const ICON_STYLE = {
  position: 'absolute',
  right: '12px',
  color: '#a0aec0',
};

const INPUT_STYLE = {
  width: '100%',
  padding: '12px 40px 12px 12px',
  borderRadius: '12px',
  border: '2px solid #e2e8f0',
  fontSize: '1rem',
  outline: 'none',
  transition: 'all 0.2s',
};

const BUTTON_STYLE = {
  backgroundColor: '#00bcd4',
  color: 'white',
  padding: '14px',
  borderRadius: '12px',
  border: 'none',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.3s',
  marginTop: '1rem',
  boxShadow: '0 4px 12px rgba(0,188,212,0.3)',
};

const ERROR_STYLE = {
  backgroundColor: '#fff5f5',
  color: '#c53030',
  padding: '12px',
  borderRadius: '10px',
  marginBottom: '1rem',
  textAlign: 'center',
  fontSize: '0.9rem',
  border: '1px solid #feb2b2',
};

export default ContinueRegistrationPage;
