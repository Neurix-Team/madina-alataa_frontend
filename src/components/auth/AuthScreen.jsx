import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  FaGamepad,
  FaRocket,
  FaCrown,
  FaUserAstronaut,
  FaGithub,
  FaEnvelope,
  FaLock,
  FaUser,
  FaCalendarAlt,
  FaUserTag,
  FaMagic,
  FaArrowLeft,
  FaCheckCircle,
  FaHeart,
  FaShieldAlt,
  FaSignInAlt,
  FaUserPlus,
  FaStar,
} from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../hooks/useAuth'; // تأكد من أن المسار صحيح
import { useNavigate } from 'react-router-dom';
import AudioManager from '../../services/AudioManager'; // تأكد من أن الملف موجود في المسار
import { useAuthContext } from '../../app/providers/AuthProvider';

const loginSchema = Yup.object({
  email: Yup.string().email('البريد الإلكتروني غير صحيح').required('البريد الإلكتروني مطلوب'),
  password: Yup.string().min(6, 'الكلمة السرية لازم تكون 6 حروف على الأقل').required('الكلمة السرية مطلوبة'),
});

// const registerSchema = Yup.object({
//   name: Yup.string().min(3, 'الاسم لازم يكون 3 حروف على الأقل').required('الاسم مطلوب'),
//   email: Yup.string().required('البريد الإلكتروني مطلوب'),
//   password: Yup.string().min(6, 'الكلمة السرية لازم تكون 6 حروف على الأقل').required('الكلمة السرية مطلوبة'),
//   age: Yup.number().min(1, 'العمر لازم يكون أكبر من 0').max(120, 'العمر لازم يكون أقل من 120').required('العمر مطلوب'),
//   role: Yup.string().oneOf(['donor', 'parent', 'volunteer', 'reviewer', 'admin'], 'اختار دور صحيح').required('الدور مطلوب'),
// });

const registerSchema = Yup.object({
  fullname: Yup.string()
    .min(3, 'الاسم لازم يكون 3 حروف على الأقل')
    .required('الاسم مطلوب'),

  email: Yup.string()
    .email('البريد الإلكتروني غير صحيح')
    .required('البريد الإلكتروني مطلوب'),

  password: Yup.string()
    .min(8, 'الكلمة السرية لازم تكون 8 حروف على الأقل مع حرف كبير ورقم')
    .required('الكلمة السرية مطلوبة'),

  birthDate: Yup.string()
    .required('تاريخ الميلاد مطلوب'),
});


function InputField({ label, placeholder, name, type = 'text', formik, icon: Icon }) {
  const hasError = formik.touched[name] && formik.errors[name];

  return (
    <div style={FIELD_GROUP_STYLE}>
      <label htmlFor={name} style={FIELD_LABEL_STYLE}>{label}</label>
      <div className={`auth-input-shell${hasError ? ' auth-input-shell--error' : ''}`}>
        <span className="auth-input-icon">
          {Icon ? <Icon size={16} /> : null}
        </span>
        <input
          id={name}
          type={type}
          name={name}
          placeholder={placeholder}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          style={INPUT_STYLE}
        />
      </div>
    </div>
  );
}

function SelectField({ label, name, formik, icon: Icon, children }) {
  const hasError = formik.touched[name] && formik.errors[name];

  return (
    <div style={FIELD_GROUP_STYLE}>
      <label htmlFor={name} style={FIELD_LABEL_STYLE}>{label}</label>
      <div className={`auth-input-shell${hasError ? ' auth-input-shell--error' : ''}`}>
        <span className="auth-input-icon">
          {Icon ? <Icon size={16} /> : null}
        </span>
        <select
          id={name}
          name={name}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          style={SELECT_STYLE}
        >
          {children}
        </select>
      </div>
    </div>
  );
}

function FeatureBadge({ icon: Icon, text }) {
  return (
    <div className="auth-feature-badge">
      <span className="auth-feature-badge__icon">
        <Icon size={13} />
      </span>
      <span>{text}</span>
    </div>
  );
}

const AuthScreen = () => {
  const [loading, setLoading] = useState(false);
  const { 
    user, 
    login, 
    register, 
    guestLogin, 
    googleLogin, 
     continueRegistration, 
     authError,
     setAuthError
   } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState(false);

  const goByRole = (user) => {
    // التأكد من فحص الأدوار بغض النظر عن حالة الأحرف (Admin أو admin)
    const roles = user.roles.map(r => r.toLowerCase());
    
    if (roles.includes('admin')) {
      navigate('/admin');
    } else if (roles.includes('parent')) {
      navigate('/parents');
    } else {
      navigate('/profile-v2');
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  
  const handleSwitch = (toLogin) => {
    if (toLogin === isLogin) return;
    AudioManager.getInstance().play('click');
    setAnimating(true);
    setSuccess(false);
    setTimeout(() => {
      setIsLogin(toLogin);
      setAnimating(false);
    }, 260);
  };

  const loginFormik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        const user = await login(values);
        AudioManager.getInstance().unlock();
        AudioManager.getInstance().play('win');
        goByRole(user);
      } catch (error) {
        AudioManager.getInstance().play('error');
      }
    },
  });

  const registerFormik = useFormik({
    // initialValues: { name: '', email: '', password: '', age: '', role: 'donor' },
initialValues: {
  fullname: '',
  email: '',
  password: '',
  birthDate: '',
},
    validationSchema: registerSchema,
    // onSubmit: async (values) => {
    //   try {
    //     const user = await register(values);
    //     setSuccess(true);
    //     AudioManager.getInstance().unlock();
    //     AudioManager.getInstance().play('win');
    //     setTimeout(() => {
    //       goByRole(user);
    //     }, 700);
    //   } catch (error) {
    //     AudioManager.getInstance().play('error');
    //   }
    // },

    onSubmit: async (values) => {
  try {
    console.log('REGISTER FORM VALUES:', values);

    const user = await register(values);

    console.log('REGISTER FINAL USER:', user);

    if (!user) return;

    setSuccess(true);
    AudioManager.getInstance().unlock();
    AudioManager.getInstance().play('win');

    setTimeout(() => {
      goByRole(user);
    }, 700);
  } catch (error) {
    console.error('REGISTER SUBMIT ERROR:', error);
    AudioManager.getInstance().play('error');
  }
},
  });

  // Auto-adjust role based on age
  // useEffect(() => {
  //   const age = parseInt(registerFormik.values.age);
  //   if (age < 19 && registerFormik.values.role === 'parent') {
  //     registerFormik.setFieldValue('role', 'donor');
  //   }
  // }, [registerFormik.values.age, registerFormik.values.role]);

  const handleGuest = async () => {
    AudioManager.getInstance().unlock();
    AudioManager.getInstance().play('click');

    try {
      const guestUser = await guestLogin();
      AudioManager.getInstance().play('win');
      goByRole(guestUser);
    } catch (error) {
      AudioManager.getInstance().play('error');
    }
  };

const handleLogin = async (values) => {
  try {
    const user = await login(values); // إرسال البيانات إلى الدالة المعدلة في AuthProvider

    // إذا تم تسجيل الدخول بنجاح، سيتم التعامل مع النتيجة هنا
    if (user) {
      console.log('User logged in successfully:', user);
      // هنا يمكنك التعامل مع الانتقال أو إجراء أي عملية أخرى بعد تسجيل الدخول
    } else {
      console.error('Login failed');
    }
  } catch (error) {
    console.error('Error during login:', error);
  }
};

  
  //continue registration with google
  // const handleGoogleLogin = async () => {
  // setLoading(true);
  // await googleLogin();

  // // إذا كان المستخدم بحاجة لإتمام التسجيل عبر جوجل
  // if (user?.needsPasswordUpdate) {
  //   // اطلب من المستخدم إدخال كلمة مرور جديدة
  //   const newPassword = prompt('الرجاء إدخال كلمة مرور جديدة:');
    
  //   if (newPassword) {
  //     const updatedUser = await continueRegistration(user.id, newPassword);
  //     if (updatedUser) {
  //       // بعد إتمام التحديث، قم بالتوجيه أو بإجراء آخر
  //       navigate('/profile-v2');
  //     }
  //   } else {
  //     setAuthError('لم يتم إدخال كلمة مرور جديدة');
  //   }
  // }

  // const handleGoogleLogin = async () => {
  //   try {
  //     setLoading(true);

  //     const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  //     const apiBase = import.meta.env.VITE_API_BASE_URL || '';

  //     // If we have a client id configured, build Google OAuth URL and redirect the browser
  //     if (GOOGLE_CLIENT_ID) {
  //       const redirectUri = `${window.location.origin}/auth/callback`;
  //       const scope = encodeURIComponent('openid email profile');
  //       const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&prompt=select_account&access_type=offline`;
  //       window.location.href = loginUrl;
  //       return;
  //     }

  //     // Fallback: call existing backend redirect (keeps previous behavior)
  //     await googleLogin();
  //     // Page will redirect by backend
  //   } catch (error) {
  //     console.error('Google Login Error:', error);
  //     setLoading(false);
  //   }
  // };

  const handleGoogleLogin = async () => {
  try {
    setLoading(true);
    await googleLogin();
  } catch (error) {
    console.error('Google Login Error:', error);
    setLoading(false);
  }
};

  const handleGithubLogin = async () => {
    AudioManager.getInstance().play('click');
    // TODO: Implement GitHub OAuth login
    console.log('GitHub login clicked');
  };

  const heroOnRight = isLogin;
  const heroTitle = isLogin ? 'مرحباً بعودتك أيها البطل!' : 'ابدأ رحلتك البطولية الآن';
  const heroSubtitle = isLogin
    ? 'سجل دخولك للوصول إلى المهام، التحديات، والإنجازات في تجربة أكثر احترافية.'
    : 'أنشئ حسابك خلال لحظات وادخل إلى عالم مليء بالأثر، التطوع، والتفاعل الممتع.';

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
        @keyframes authOrbPulse {
          0%,100% { transform: scale(1) translateY(0); opacity: 0.35; }
          50% { transform: scale(1.08) translateY(-10px); opacity: 0.58; }
        }
        @keyframes authGlowSweep {
          0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
          20% { opacity: 0.32; }
          100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
        }
        @keyframes authPanelFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        input::placeholder { color:#cbd5e1; }
        .auth-box {
          position: relative;
          isolation: isolate;
        }
        .auth-box::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 28px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.08), rgba(255,255,255,0.45));
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0.75;
        }
        .auth-input-shell {
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
          border: 1.5px solid #dbe7f3;
          border-radius: 16px;
          padding: 0 14px;
          transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
        }
        .auth-input-shell:focus-within {
          border-color: #3ba2f8;
          box-shadow: 0 0 0 4px rgba(59,162,248,0.12), 0 12px 32px rgba(59,162,248,0.12);
          transform: translateY(-1px);
        }
        .auth-input-shell--error {
          border-color: rgba(239, 68, 68, 0.55);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.08);
        }
        .auth-input-icon {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #eaf4ff, #eef8ff);
          color: #1d6ed8;
          flex-shrink: 0;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.85);
        }
        .auth-submit-btn,
        .auth-social-btn,
        .auth-switch-btn {
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
        }
        .auth-submit-btn:hover,
        .auth-social-btn:hover,
        .auth-switch-btn:hover {
          transform: translateY(-2px);
        }
        .auth-submit-btn {
          position: relative;
          overflow: hidden;
        }
        .auth-submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.28) 50%, transparent 80%);
          transform: translateX(-120%) skewX(-18deg);
          animation: authGlowSweep 3.8s ease-in-out infinite;
        }
        .auth-feature-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, #f8fbff, #eef6ff);
          border: 1px solid #d9e8f8;
          color: #3f546e;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
        }
        .auth-feature-badge__icon {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3ba2f8, #1d6ed8);
          color: #fff;
          box-shadow: 0 4px 10px rgba(29,110,216,0.22);
        }
        @media (max-width: 900px) {
          .auth-container { padding: 1rem !important; }
          .auth-box { flex-direction: row !important; }
          .auth-form { padding: 2rem 1.5rem !important; }
          .auth-hero { flex: 0 0 38% !important; padding: 1.8rem 1.2rem !important; }
          .auth-feature-row { justify-content: center !important; }
        }
        @media (max-width: 640px) {
          .auth-container { padding: 0.8rem !important; }
          .auth-box { flex-direction: column !important; min-height: auto !important; }
          .auth-form { padding: 1.8rem 1.2rem !important; }
          .auth-hero { flex: 1 !important; padding: 1.4rem 1rem !important; min-height: 240px; }
          .auth-hero h3 { font-size: 1.4rem !important; }
          .auth-hero-icon { font-size: 3.2rem !important; }
          .auth-form input, .auth-form select { font-size: 15px; }
          .auth-social-row { flex-direction: column !important; }
          .auth-feature-row { justify-content: center !important; }
          .auth-hero-highlights { grid-template-columns: 1fr !important; width: 100% !important; }
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
            background: 'linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)',
            padding: '2.6rem 2.3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }} className="auth-form">
            <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 12px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, #eff6ff, #f8fbff)',
                color: '#1d6ed8',
                fontSize: 12,
                fontWeight: 900,
                border: '1px solid #dbeafe',
                marginBottom: 14,
                boxShadow: '0 10px 26px rgba(59,162,248,0.08)',
              }}>
                <FaMagic size={12} />
                تجربة دخول احترافية
              </div>
              <div>
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
                animation: 'authPanelFloat 4s ease-in-out infinite',
              }}>
                <FaCrown size={30} />
              </div>
              </div>
            </div>

            <h1 style={{ textAlign: 'center', fontSize: 22, fontWeight: 900, color: '#1e293b', marginBottom: 6 }}>
              بطل العطاء
            </h1>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', fontWeight: 600, marginBottom: 24 }}>
              انضم إلينا لنصنع عالماً أفضل!
            </p>

            <div className="auth-feature-row" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              justifyContent: 'center',
              marginBottom: 22,
            }}>
              <FeatureBadge icon={FaShieldAlt} text="حساب آمن" />
              <FeatureBadge icon={FaHeart} text="أثر حقيقي" />
              <FeatureBadge icon={FaStar} text="تجربة تفاعلية" />
            </div>

            <div style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: 14,
              padding: 4,
              marginBottom: 20,
              gap: 4,
              boxShadow: 'inset 0 1px 3px rgba(15,23,42,0.06)',
            }}>
              {[{ label: 'تسجيل الدخول', val: true }, { label: 'حساب جديد', val: false }].map(({ label, val }) => {
                const active = isLogin === val;
                return (
                  <button
                    key={label}
                    className="auth-switch-btn"
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

            {/* Social Login Buttons */}
            {isLogin && (
              <div style={{ marginBottom: 20 }}>
                <div className="auth-social-row" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <button
                    type="button"
                    className="auth-social-btn"
                     onClick={handleGoogleLogin}
                     disabled={loading}
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: 14,
                      background: '#fff',
                      color: '#334155',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: "'Cairo',sans-serif",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.18s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <FcGoogle size={18} />
                   {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول باستخدام جوجل'}
                  </button>
                  <button
                    type="button"
                    className="auth-social-btn"
                    onClick={handleGithubLogin}
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: 14,
                      background: '#fff',
                      color: '#334155',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: "'Cairo',sans-serif",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.18s',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <FaGithub size={18} />
                    جيت هاب
                  </button>
                </div>
                <div style={{
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#94a3b8',
                  fontWeight: 600,
                  marginBottom: 16,
                  position: 'relative',
                }}>
                  <span style={{
                    background: '#fff',
                    padding: '0 12px',
                    position: 'relative',
                    zIndex: 1,
                  }}>
                    أو
                  </span>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: 1,
                    background: '#e2e8f0',
                    zIndex: 0,
                  }} />
                </div>
              </div>
            )}

            <div style={{ animation: animating ? 'formFadeOut 0.24s ease forwards' : 'formSlideIn 0.32s ease both' }}>
              {isLogin ? (
                <form onSubmit={loginFormik.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <InputField type="email" name="email" label="البريد الإلكتروني" placeholder="أدخل بريدك الإلكتروني" formik={loginFormik} icon={FaEnvelope} />
                  {loginFormik.touched.email && loginFormik.errors.email && <p style={ERROR_STYLE}>⚠️ {loginFormik.errors.email}</p>}
                  <InputField type="password" name="password" label="كلمة المرور" placeholder="أدخل كلمة المرور" formik={loginFormik} icon={FaLock} />
                  {loginFormik.touched.password && loginFormik.errors.password && <p style={ERROR_STYLE}>⚠️ {loginFormik.errors.password}</p>}
                  {authError && <p style={ERROR_STYLE}>⚠️ {authError}</p>}
                  <button className="auth-submit-btn" type="submit" style={BTN_STYLE} disabled={loginFormik.isSubmitting}>
                    <FaSignInAlt size={18} />
                    {loginFormik.isSubmitting ? 'جاري التحميل...' : 'دخول إلى الحساب'}
                  </button>
                </form>
              ) : (
                <form onSubmit={registerFormik.handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                  

  <InputField
  type="text"
  name="fullname"
  label="الاسم الكامل"
  placeholder="الاسم الكامل"
  formik={registerFormik}
  icon={FaUser}
/>

{registerFormik.touched.fullname && registerFormik.errors.fullname && (
  <p style={ERROR_STYLE}>⚠️ {registerFormik.errors.fullname}</p>
)}

                  <InputField type="email" name="email" label="البريد الإلكتروني" placeholder="أدخل بريدك الإلكتروني" formik={registerFormik} icon={FaEnvelope} />
                  {registerFormik.touched.email && registerFormik.errors.email && <p style={ERROR_STYLE}>⚠️ {registerFormik.errors.email}</p>}

                  {/* <InputField type="number" name="age" label="العمر" placeholder="أدخل عمرك" formik={registerFormik} icon={FaCalendarAlt} />
                  {registerFormik.touched.age && registerFormik.errors.age && <p style={ERROR_STYLE}>⚠️ {registerFormik.errors.age}</p>}
                   */}

                   <InputField
  type="date"
  name="birthDate"
  label="تاريخ الميلاد"
  placeholder="اختر تاريخ الميلاد"
  formik={registerFormik}
  icon={FaCalendarAlt}
/>

{registerFormik.touched.birthDate && registerFormik.errors.birthDate && (
  <p style={ERROR_STYLE}>⚠️ {registerFormik.errors.birthDate}</p>
)}

                  <InputField type="password" name="password" label="كلمة المرور" placeholder="أنشئ كلمة مرور قوية" formik={registerFormik} icon={FaLock} />
                  {registerFormik.touched.password && registerFormik.errors.password && <p style={ERROR_STYLE}>⚠️ {registerFormik.errors.password}</p>}
                  {/* <SelectField name="role" label="نوع الحساب" formik={registerFormik} icon={FaUserTag}>
                    <option value="donor">متبرع</option>
                    {parseInt(registerFormik.values.age) >= 19 && <option value="parent">ولي أمر</option>}
                    <option value="volunteer">متطوع</option>
                    <option value="reviewer">مراجع</option>
                    <option value="admin">مدير</option>
                  </SelectField> */}
                  {registerFormik.touched.role && registerFormik.errors.role && <p style={ERROR_STYLE}>⚠️ {registerFormik.errors.role}</p>}
                  {authError && <p style={ERROR_STYLE}>⚠️ {authError}</p>}
                  <button className="auth-submit-btn" type="submit" style={BTN_STYLE} disabled={registerFormik.isSubmitting}>
                    {success ? <FaCheckCircle size={18} /> : <FaUserPlus size={18} />}
                    {success ? '✓ جاري الدخول...' : registerFormik.isSubmitting ? 'جاري التحميل...' : 'إنشاء الحساب'}
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
            <div style={{
              position: 'absolute',
              top: 26,
              right: 24,
              width: 84,
              height: 84,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.02) 70%)',
              animation: 'authOrbPulse 6s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute',
              bottom: 42,
              left: 26,
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(251,191,36,0.32) 0%, rgba(251,191,36,0.04) 72%)',
              animation: 'authOrbPulse 7s ease-in-out infinite',
              animationDelay: '0.8s',
            }} />
            <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

            <div className="auth-hero-icon" style={{ animation: 'heroFloat 3.5s ease-in-out infinite', zIndex: 1, fontSize: '5rem', color: '#fff' }}>
              <FaUserAstronaut size={92} />
            </div>
            <div style={{ textAlign: 'center', zIndex: 1, marginTop: '0.7rem', color: '#fff' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: 12,
                fontWeight: 900,
                marginBottom: '1rem',
                backdropFilter: 'blur(10px)',
              }}>
                <FaMagic size={12} />
                تصميم عصري وحركات ناعمة
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.45rem', lineHeight: 1.2 }}>
                {heroTitle}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.84)', fontSize: '0.95rem', lineHeight: 1.9, maxWidth: 300, margin: '0 auto' }}>
                {heroSubtitle}
              </p>
              <div className="auth-hero-highlights" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 12,
                marginTop: '1.4rem',
                width: '100%',
                maxWidth: 320,
              }}>
                {[
                  { icon: FaShieldAlt, label: 'أمان وثقة' },
                  { icon: FaHeart, label: 'أثر ومهام' },
                  { icon: FaGamepad, label: 'تجربة ممتعة' },
                  { icon: FaArrowLeft, label: 'وصول سريع' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      borderRadius: 16,
                      padding: '12px 10px',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      textAlign: 'right',
                    }}
                  >
                    <span style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.16)',
                      flexShrink: 0,
                    }}>
                      <Icon size={15} />
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const INPUT_STYLE = {
  width: '100%',
  padding: '15px 0',
  border: 'none',
  borderRadius: 0,
  fontFamily: "'Cairo',sans-serif",
  fontSize: 14,
  fontWeight: 600,
  color: '#334155',
  background: 'transparent',
  direction: 'rtl',
  transition: 'all 0.18s',
  outline: 'none',
};

const SELECT_STYLE = {
  ...INPUT_STYLE,
  appearance: 'none',
  cursor: 'pointer',
};

const FIELD_GROUP_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 7,
};

const FIELD_LABEL_STYLE = {
  fontSize: 12,
  fontWeight: 800,
  color: '#475569',
  paddingRight: 4,
};

const BTN_STYLE = {
  width: '100%',
  marginTop: '10px',
  padding: '14px 16px',
  background: 'linear-gradient(135deg, #3ba2f8 0%, #1d6ed8 55%, #233f91 100%)',
  border: 'none',
  borderRadius: '16px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: 900,
  cursor: 'pointer',
  fontFamily: "'Cairo',sans-serif",
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  boxShadow: '0 16px 32px rgba(29,110,216,0.32)',
};

const ERROR_STYLE = {
  color: '#ef4444',
  fontSize: 12,
  fontWeight: 800,
  textAlign: 'right',
  marginTop: -2,
  paddingRight: 4,
};

export default AuthScreen;
