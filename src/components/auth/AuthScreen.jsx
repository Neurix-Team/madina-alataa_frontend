import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaGamepad, FaRocket, FaCrown, FaUserAstronaut } from 'react-icons/fa';
import AudioManager from '../../services/AudioManager';

const loginSchema = Yup.object({
  email: Yup.string().email('البريد الإلكتروني غير صحيح').required('البريد الإلكتروني مطلوب'),
  password: Yup.string().min(6, 'الكلمة السرية لازم تكون 6 حروف على الأقل').required('الكلمة السرية مطلوبة'),
});

const registerSchema = Yup.object({
  email: Yup.string().email('البريد الإلكتروني غير صحيح').required('البريد الإلكتروني مطلوب'),
  age: Yup.number().min(6, 'السن لازم يكون 6 سنين على الأقل').max(99, 'السن لازم يكون أقل من 100').required('السن مطلوب').typeError('ادخل رقم صحيح'),
  heroName: Yup.string().min(3, 'اسم البطل لازم يكون 3 حروف على الأقل').required('اسم البطل مطلوب'),
  role: Yup.string().oneOf(['admin', 'user', 'parent', 'child', 'donor'], 'اختار دور صحيح').required('الدور مطلوب'),
  password: Yup.string().min(6, 'الكلمة السرية لازم تكون 6 حروف على الأقل').required('الكلمة السرية مطلوبة'),
});

function createToken(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const sig = btoa('superhero-secret');
  return `${header}.${body}.${sig}`;
}

function decodeToken(token) {
  try {
    const body = token.split('.')[1];
    return JSON.parse(atob(body));
  } catch {
    return null;
  }
}

function InputField({ placeholder, name, type = 'text', formik }) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      style={INPUT_STYLE}
    />
  );
}

const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authError, setAuthError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleSwitch = (toLogin) => {
    if (toLogin === isLogin) return;
    AudioManager.getInstance().play('click');
    setAnimating(true);
    setAuthError('');
    setSuccess(false);
    setTimeout(() => {
      setIsLogin(toLogin);
      setAnimating(false);
    }, 260);
  };

  const loginFormik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: (values) => {
      setAuthError('');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const found = users.find((u) => u.email === values.email);

      if (!found) {
        setAuthError('مفيش حساب مسجل، اعمل حساب جديد الأول');
        AudioManager.getInstance().play('error');
        return;
      }

      const token = found.token || localStorage.getItem('token');
      const userData = decodeToken(token);
      if (!userData) {
        setAuthError('حصل خطأ في التحقق، جرب تسجل من جديد');
        AudioManager.getInstance().play('error');
        return;
      }

      if (userData.email === values.email && userData.password === values.password) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ email: userData.email, heroName: userData.heroName, role: userData.role }));
        AudioManager.getInstance().unlock();
        AudioManager.getInstance().play('win');
        onLogin({ name: userData.heroName || 'البطل الشجاع', email: userData.email, role: userData.role });
      } else {
        setAuthError('الإيميل أو كلمة المرور خطأ');
        AudioManager.getInstance().play('error');
      }
    },
  });

  const registerFormik = useFormik({
    initialValues: { email: '', age: '', heroName: '', role: 'user', password: '' },
    validationSchema: registerSchema,
    onSubmit: (values) => {
      setAuthError('');
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const exists = users.some((u) => u.email === values.email);

      if (exists) {
        setAuthError('الحساب مستخدم بالفعل');
        AudioManager.getInstance().play('error');
        return;
      }

      const payload = {
        email: values.email,
        password: values.password,
        heroName: values.heroName,
        age: values.age,
        role: values.role,
      };

      const token = createToken(payload);
      const updatedUsers = [...users, { ...payload, token }];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ email: payload.email, heroName: payload.heroName, role: payload.role }));

      setSuccess(true);
      AudioManager.getInstance().unlock();
      AudioManager.getInstance().play('win');

      setTimeout(() => {
        onLogin({ name: payload.heroName || 'البطل الشجاع', email: payload.email, role: payload.role });
      }, 700);
    },
  });

  const handleGuest = () => {
    AudioManager.getInstance().unlock();
    AudioManager.getInstance().play('click');
    onLogin({ name: 'زائر شجاع' });
  };

  const heroOnRight = isLogin;

  return (
    <>
      <style>{`
        @keyframes pageMount {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes formSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes formFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes heroFloat {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-12px); }
        }
        @keyframes authCloudFloat {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-14px); }
        }
        @keyframes authStarPulse {
          0%,100% { opacity:0.2; transform:scale(1); }
          50%     { opacity:0.55; transform:scale(1.25); }
        }
        input::placeholder { color:#cbd5e1; }
        input:focus, select:focus {
          outline:none;
          border-color:#3ba2f8 !important;
          box-shadow:0 0 0 3px rgba(59,162,248,0.15) !important;
        }
        @media (max-width: 900px) {
          .auth-container { padding: 1rem !important; }
          .auth-box { flex-direction: row !important; }
          .auth-form { padding: 2rem 1.5rem !important; }
          .auth-hero { flex: 0 0 38% !important; padding: 1.8rem 1.2rem !important; }
        }
        @media (max-width: 640px) {
          .auth-container { padding: 0.8rem !important; }
          .auth-box { flex-direction: column !important; min-height: auto !important; }
          .auth-form { padding: 1.8rem 1.2rem !important; }
          .auth-hero { flex: 1 !important; padding: 1.4rem 1rem !important; min-height: 240px; }
          .auth-hero h3 { font-size: 1.4rem !important; }
          .auth-hero-icon { font-size: 3.2rem !important; }
          .auth-form input, .auth-form select { font-size: 15px; padding: 11px 14px; }
          input::placeholder { color: #cbd5e1; }
        }
      `}</style>

      <div dir="rtl" className="auth-container" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg,#3ba2f8 0%,#1d6ed8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cairo',sans-serif",
        position: 'relative',
        overflow: 'hidden',
        padding: '1.4rem',
      }}>
        {[
          { top: '6%', left: '4%', size: 70, op: 0.18, dur: '9s', dl: '0s' },
          { top: '12%', right: '6%', size: 90, op: 0.12, dur: '11s', dl: '1.5s' },
          { top: '55%', left: '2%', size: 55, op: 0.1, dur: '8s', dl: '3s' },
          { top: '70%', right: '3%', size: 65, op: 0.08, dur: '10s', dl: '1s' },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: c.top,
              left: c.left,
              right: c.right,
              fontSize: c.size,
              opacity: c.op,
              pointerEvents: 'none',
              animation: `authCloudFloat ${c.dur} ease-in-out infinite`,
              animationDelay: c.dl,
            }}
          >
            ☁️
          </div>
        ))}

        {[
          { top: '30%', left: '8%', size: 28, dl: '0s' },
          { top: '80%', left: '20%', size: 20, dl: '1s' },
          { top: '20%', right: '15%', size: 18, dl: '2s' },
          { top: '65%', right: '10%', size: 24, dl: '0.5s' },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              right: s.right,
              fontSize: s.size,
              color: 'rgba(255,255,255,0.55)',
              pointerEvents: 'none',
              animation: 'authStarPulse 3s ease-in-out infinite',
              animationDelay: s.dl,
            }}
          >
            ✦
          </div>
        ))}

        <div className="auth-box" style={{
          display: 'flex',
          flexDirection: heroOnRight ? 'row' : 'row-reverse',
          width: '100%',
          maxWidth: 900,
          minHeight: 560,
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.18)',
          animation: mounted ? 'pageMount 0.6s cubic-bezier(0.22,1,0.36,1) both' : 'none',
          transition: 'flex-direction 0.5s ease',
          background: '#fff',
          zIndex: 1,
        }}>
          <div style={{
            flex: 1,
            background: '#fff',
            padding: '2.6rem 2.3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }} className="auth-form">
            <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <div style={{
                width: 64, height: 64,
                background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(245,158,11,0.35)',
              }}>
                <FaCrown size={30} />
              </div>
            </div>

            <h1 style={{ textAlign: 'center', fontSize: 22, fontWeight: 900, color: '#1e293b', marginBottom: 6 }}>
              بطل العطاء
            </h1>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600, marginBottom: 24 }}>
              انضم إلينا لنصنع عالماً أفضل!
            </p>

            <div style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: 14,
              padding: 4,
              marginBottom: 20,
              gap: 4,
            }}>
              {[{ label: 'تسجيل الدخول', val: true }, { label: 'حساب جديد', val: false }].map(({ label, val }) => {
                const active = isLogin === val;
                return (
                  <button
                    key={label}
                    onClick={() => handleSwitch(val)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: "'Cairo',sans-serif",
                      fontSize: 13,
                      fontWeight: active ? 900 : 700,
                      background: active ? '#fff' : 'transparent',
                      color: active ? '#1d6ed8' : '#94a3b8',
                      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div style={{ animation: animating ? 'formFadeOut 0.24s ease forwards' : 'formSlideIn 0.32s ease both' }}>
              {isLogin ? (
                <form onSubmit={loginFormik.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <InputField type="email" name="email" placeholder="البريد الإلكتروني" formik={loginFormik} />
                  <InputField type="password" name="password" placeholder="الكلمة السرية السحرية" formik={loginFormik} />
                  {authError && <p style={ERROR_STYLE}>⚠️ {authError}</p>}
                  <button type="submit" style={BTN_STYLE}>
                    <FaGamepad size={18} />
                    ابدأ اللعب!
                  </button>
                </form>
              ) : (
                <form onSubmit={registerFormik.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <InputField type="email" name="email" placeholder="البريد الإلكتروني" formik={registerFormik} />
                  <InputField type="number" name="age" placeholder="كم عمرك؟ (السن)" formik={registerFormik} />
                  <InputField type="text" name="heroName" placeholder="اسم البطل" formik={registerFormik} />
                  <select name="role" value={registerFormik.values.role} onChange={registerFormik.handleChange} onBlur={registerFormik.handleBlur} style={INPUT_STYLE}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="parent">Parent</option>
                    <option value="child">Child</option>
                    <option value="donor">Donor</option>
                  </select>
                  <InputField type="password" name="password" placeholder="الكلمة السرية السحرية" formik={registerFormik} />
                  {authError && <p style={ERROR_STYLE}>⚠️ {authError}</p>}
                  <button type="submit" style={BTN_STYLE}>
                    <FaRocket size={18} />
                    {success ? '✓ جاري الدخول...' : '🚀 انضم للأبطال!'}
                  </button>
                </form>
              )}

              <p
                onClick={handleGuest}
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#94a3b8',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'color 0.18s',
                  marginTop: 12,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#3ba2f8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
              >
                تخطي واللعب كزائر مؤقتاً
              </p>
            </div>
          </div>

          <div style={{
            flex: '0 0 42%',
            background: 'linear-gradient(160deg,#3ba2f8 0%,#1d6ed8 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5rem 2rem',
            position: 'relative',
            overflow: 'hidden',
            transition: 'opacity 0.35s ease',
          }} className="auth-hero">
            <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

            <div className="auth-hero-icon" style={{ animation: 'heroFloat 3.5s ease-in-out infinite', zIndex: 1, fontSize: '5rem', color: '#fff' }}>
              <FaUserAstronaut size={92} />
            </div>
            <div style={{ textAlign: 'center', zIndex: 1, marginTop: '0.7rem', color: '#fff' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.45rem', lineHeight: 1.2 }}>
                {isLogin ? 'مرحباً بك!' : 'مرحباً بالبطل!'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                {isLogin ? 'سجل دخولك لتبدأ رحلة العطاء اليوم' : 'كن جزءاً من مجتمعنا الرائع اليوم'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const INPUT_STYLE = {
  width: '100%',
  padding: '13px 16px',
  border: '2px solid #e2e8f0',
  borderRadius: 14,
  fontFamily: "'Cairo',sans-serif",
  fontSize: 14,
  fontWeight: 600,
  color: '#334155',
  background: '#f8fafc',
  direction: 'rtl',
  transition: 'all 0.18s',
  outline: 'none',
};

const BTN_STYLE = {
  width: '100%',
  marginTop: '6px',
  padding: '12px',
  background: 'linear-gradient(135deg, #4A90D9, #2C3E8C)',
  border: 'none',
  borderRadius: '14px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: "'Cairo',sans-serif",
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  boxShadow: '0 8px 24px rgba(74,144,217,0.4)',
};

const ERROR_STYLE = {
  color: '#ef4444',
  fontSize: 12,
  fontWeight: 700,
  textAlign: 'center',
};

export default AuthScreen;
