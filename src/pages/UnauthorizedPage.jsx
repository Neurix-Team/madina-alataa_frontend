import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaShieldAlt, FaArrowRight, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { getPostLoginRoute } from '../utils/authRoutes';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const state = location.state || {};
  const targetPath = state.from || '';
  const fallbackRoute = state.fallback || getPostLoginRoute(user);

  useEffect(() => {
    document.title = 'غير مصرح لك بالوصول | مدينة العطاء';
    return () => {
      document.title = 'مدينة العطاء';
    };
  }, []);

  const handleBack = () => {
    navigate(isAuthenticated ? fallbackRoute : '/login', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'linear-gradient(135deg, #fff5f7 0%, #ffe5ec 50%, #fff0f3 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(220, 38, 38, 0.12)',
          filter: 'blur(24px)',
          top: '-100px',
          right: '-100px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.10)',
          filter: 'blur(24px)',
          bottom: '-80px',
          left: '-80px',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(254, 202, 202, 0.9)',
          borderRadius: '32px',
          boxShadow: '0 32px 80px rgba(220, 38, 38, 0.15)',
          padding: '48px 36px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '28px',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 28px',
            background: 'linear-gradient(135deg, #fecaca, #fca5a5)',
            color: '#dc2626',
            boxShadow: '0 16px 40px rgba(220, 38, 38, 0.20)',
          }}
        >
          <FaExclamationTriangle size={44} />
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: '2.05rem',
            fontWeight: 900,
            color: '#991b1b',
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
          }}
        >
          غير مصرح لك بالوصول
        </h1>

        <p
          style={{
            margin: '14px auto 0',
            maxWidth: '460px',
            color: '#7f1d1d',
            lineHeight: 1.9,
            fontSize: '1.05rem',
            fontWeight: 500,
          }}
        >
          ليس لديك صلاحية لعرض هذه الصفحة حالياً. إذا كنت تتوقع الوصول إليها، ارجع للصفحة المناسبة لحسابك أو سجّل دخول بحساب يملك الصلاحية.
        </p>

        <div
          style={{
            marginTop: '34px',
            padding: '20px 24px',
            borderRadius: '20px',
            background: 'rgba(254, 226, 226, 0.85)',
            border: '1px solid rgba(252, 165, 165, 0.7)',
            textAlign: 'right',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <FaShieldAlt color="#dc2626" size={18} />
            <strong style={{ color: '#dc2626', fontSize: '1rem' }}>معلومات الوصول</strong>
          </div>
          <div
            style={{
              color: '#991b1b',
              lineHeight: 1.8,
              fontSize: '0.95rem',
            }}
          >
            <div style={{ marginBottom: '8px' }}>
              <strong>المسار المطلوب:</strong> {targetPath || 'غير معروف'}
            </div>
            <div>
              <strong>الحالة:</strong> غير مصرح
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '12px',
            marginTop: '34px',
          }}
        >
          <button
            onClick={handleBack}
            style={{
              border: 'none',
              borderRadius: '18px',
              padding: '16px 28px',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 12px 32px rgba(220, 38, 38, 0.32)',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(220, 38, 38, 0.40)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(220, 38, 38, 0.32)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FaArrowRight size={18} />
            العودة للصفحة المناسبة
          </button>

          <button
            onClick={() => navigate('/login', { replace: true })}
            style={{
              border: '2px solid #dc2626',
              borderRadius: '18px',
              padding: '16px 28px',
              background: 'rgba(220, 38, 38, 0.08)',
              color: '#dc2626',
              fontWeight: 700,
              fontSize: '1.05rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.14)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FaSignOutAlt size={18} />
            تسجيل دخول جديد
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default UnauthorizedPage;
