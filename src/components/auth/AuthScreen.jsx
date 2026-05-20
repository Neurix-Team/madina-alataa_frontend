import React, { useEffect, useState, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaCalendarAlt,
  FaCheckCircle,
  FaStar,
  FaCoins,
  FaTasks,
  FaChevronRight,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaMedal,
  FaFire,
  FaBook,
  FaHandsHelping,
  FaBullhorn,
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import AudioManager from '../../services/AudioManager';
import { userLevelsService } from '../../services/userLevelsService';
import { availableMissionsService } from '../../services/availableMissionsService';
import bgImage from '../../assets/ChatGPT Image 19 مايو 2026، 12_04_35 م.png';

const loginSchema = Yup.object({
  email: Yup.string().email('البريد الإلكتروني غير صحيح').required('البريد الإلكتروني مطلوب'),
  password: Yup.string().min(6, 'الكلمة السرية لازم تكون 6 حروف على الأقل').required('الكلمة السرية مطلوبة'),
});

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
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'تأكيد كلمة المرور غير مطابق')
    .required('تأكيد كلمة المرور مطلوب'),
  birthDate: Yup.string()
    .required('تاريخ الميلاد مطلوب')
    .test('isValidDate', 'تاريخ الميلاد غير صالح', value => {
      if (!value) return false;
      const date = new Date(value);
      if (isNaN(date.getTime())) return false;
      const year = date.getFullYear();
      const currentYear = new Date().getFullYear();
      return year >= 1900 && year <= (currentYear - 5);
    }),
});

const AuthScreen = () => {
  const { login, register, logout, googleLogin, authError, setAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [levelData, setLevelData] = useState(null);
  const [missions, setMissions] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Default stats for when user is not logged in
  const defaultStats = {
    level: { levelNumber: 12, name: 'ساعي الخير' },
    xp: 2150,
    nextLevelXpRequired: 3000,
    kp: 1250,
  };

  const defaultMissions = [
    { id: 1, title: 'مساعدة محتاج', description: 'أكمل مهمة مساعدة واحدة', reward: 50, icon: FaHandsHelping, color: '#3ba2f8' },
    { id: 2, title: 'نشر رسالة خير', description: 'شارك رسالة إيجابية', reward: 25, icon: FaBullhorn, color: '#10b981' },
    { id: 3, title: 'تعلم شيئاً نافعاً', description: 'اقرأ مقالاً أو درساً مفيداً', reward: 25, icon: FaBook, color: '#8b5cf6' },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);

        // Only fetch if we have some sort of token, otherwise use defaults
        const token = localStorage.getItem('madina_access_token') ||
          localStorage.getItem('auth_token') ||
          localStorage.getItem('accessToken');

        if (token) {
          // Try to fetch real level data
          const levelRes = await userLevelsService.getMyLevel();
          if (levelRes && levelRes.item) {
            setLevelData(levelRes.item);
          } else {
            setLevelData(defaultStats);
          }

          // Fetch available missions
          const missionRes = await availableMissionsService.getAvailableMissions(1, 3);
          const missionItems = missionRes?.value?.items || missionRes?.items || [];
          if (missionItems.length > 0) {
            setMissions(missionItems.slice(0, 3));
          } else {
            setMissions(defaultMissions);
          }
        } else {
          // No token, just use defaults
          setLevelData(defaultStats);
          setMissions(defaultMissions);
        }
      } catch (err) {
        // Silently fail for 401s on login screen
        if (err.response?.status !== 401) {
          console.error('Failed to fetch stats for auth screen:', err);
        }
        setLevelData(defaultStats);
        setMissions(defaultMissions);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const goByRole = (user) => {
    if (!user) return;
    const roles = (user.roles || []).map(r => String(r).toLowerCase());
    if (roles.includes('admin')) {
      navigate('/admin');
    } else if (roles.includes('parent')) {
      navigate('/parents');
    } else if (roles.includes('volunteer')) {
      navigate('/map');
    } else {
      navigate('/cases');
    }
  };

  const loginFormik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        const user = await login(values);
        AudioManager.getInstance().play('win');
        const from = location.state?.from;
        if (from && from !== '/login') {
          navigate(from, { replace: true });
        } else {
          goByRole(user);
        }
      } catch (error) {
        AudioManager.getInstance().play('error');
      }
    },
  });

  const registerFormik = useFormik({
    initialValues: { fullname: '', email: '', password: '', confirmPassword: '', birthDate: '' },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      try {
        const user = await register(values);
        if (!user) return;
        await logout();
        AudioManager.getInstance().play('win');

        // Success! Switch to login mode instead of auto-logging in
        setIsLogin(true);
        // Pre-fill email for convenience
        loginFormik.setFieldValue('email', values.email);
      } catch (error) {
        AudioManager.getInstance().play('error');
      }
    },
  });

  useEffect(() => {
    if (authError) {
      setAuthError(null);
    }
  }, [loginFormik.values, registerFormik.values, isLogin, setAuthError]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await googleLogin();
    } catch (error) {
      console.error('Google Login Error:', error);
      setLoading(false);
    }
  };

  const currentLevel = levelData?.level?.levelNumber || defaultStats.level.levelNumber;
  const currentXp = levelData?.xp || defaultStats.xp;
  const nextXp = levelData?.level?.nextLevelXpRequired || defaultStats.nextLevelXpRequired;
  const xpProgress = (currentXp / nextXp) * 100;
  const currentKp = levelData?.kp || defaultStats.kp;

  const journeySteps = [
    { label: 'البداية', status: 'completed' },
    { label: 'المتعلم', status: 'completed' },
    { label: 'المساهم', status: 'current' },
    { label: 'المنجز', status: 'locked' },
    { label: 'القائد', status: 'locked' }
  ];

  return (
    <div dir="rtl" className="auth-page" style={styles.container}>
      <style>{CSS}</style>

      {/* Background with glowing elements */}
      <div className="bg-overlay" style={styles.bgOverlay} />
      <div className="bg-stars" style={styles.bgStars} />

      <div className="auth-wrapper" style={styles.wrapper}>
        {/* Left Side: Stats & Journey (Hidden on mobile) */}
        <div className="stats-section" style={styles.statsSection}>
          <div style={styles.header}>
            <h1 style={styles.title}>مدينة العطاء</h1>
            <p style={styles.subtitle}>رحلة من المهام والإنجازات تصنع أثراً جميلاً</p>
          </div>

          {/* Level Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={styles.statCard}
          >
            <div style={styles.levelBadge}>
              <FaMedal style={styles.levelIcon} />
              <span style={styles.levelNumber}>{currentLevel}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={styles.statHeader}>
                <span style={styles.statTitle}>المستوى {currentLevel}</span>
                <span style={styles.statValue}>✨ {levelData?.level?.name || defaultStats.level.name}</span>
              </div>
              <div style={styles.progressBarBg}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  style={styles.progressBarFill}
                />
              </div>
              <div style={styles.statFooter}>
                <span>{currentXp.toLocaleString()} / {nextXp.toLocaleString()} XP</span>
              </div>
            </div>
          </motion.div>

          {/* Points Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            style={styles.miniCard}
          >
            <div style={styles.coinIconWrapper}>
              <FaCoins style={styles.coinIcon} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={styles.statHeader}>
                <span style={styles.statTitle}>{currentKp.toLocaleString()}</span>
                <span style={styles.statValuePositive}>+ 120</span>
              </div>
              <div style={styles.statSubtitle}>نقطة العطاء</div>
            </div>
            <div style={styles.thisWeekLabel}>هذا الأسبوع</div>
          </motion.div>

          {/* Daily Tasks Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={styles.tasksCard}
          >
            <div style={styles.tasksHeader}>
              <FaTasks />
              <span>المهام اليومية</span>
            </div>
            <div style={styles.missionsList}>
              {missions.map((mission, idx) => {
                const Icon = mission.icon || FaHandsHelping;
                return (
                  <div key={mission.id || idx} style={styles.missionItem}>
                    <div style={styles.missionIconWrapper}>
                      <Icon style={styles.missionIcon} />
                    </div>
                    <div style={styles.missionInfo}>
                      <div style={styles.missionTitle}>{mission.title}</div>
                      <div style={styles.missionDesc}>{mission.description || 'أكمل مهمة مساعدة واحدة'}</div>
                    </div>
                    <div style={styles.missionReward}>+ {mission.xpReward || mission.reward || 25} ✨</div>
                  </div>
                );
              })}
            </div>
            <div style={styles.viewAllTasks}>
              عرض كل المهام <FaChevronRight size={10} />
            </div>
          </motion.div>

          {/* Journey Path */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={styles.journeySection}
          >
            <div style={styles.journeyHeader}>رحلتك في مدينة العطاء</div>
            <div style={styles.journeyPath}>
              {journeySteps.map((step, idx) => {
                const isCompleted = step.status === 'completed' || step.status === 'current';
                const isCurrent = step.status === 'current';
                return (
                  <div key={step.label} style={styles.journeyStep}>
                    <div style={{
                      ...styles.journeyNode,
                      backgroundColor: isCompleted ? '#10b981' : 'rgba(255,255,255,0.1)',
                      boxShadow: isCurrent ? '0 0 15px #10b981' : 'none',
                      border: isCurrent ? '2px solid #fff' : 'none'
                    }}>
                      {isCompleted ? (
                        isCurrent ? <FaStar size={12} color="#fff" /> : <FaCheckCircle size={12} color="#fff" />
                      ) : (
                        <FaLock size={10} color="rgba(255,255,255,0.3)" />
                      )}
                    </div>
                    <span style={{
                      ...styles.journeyLabel,
                      color: isCompleted ? '#fff' : 'rgba(255,255,255,0.5)',
                      fontWeight: isCurrent ? 800 : 400
                    }}>{step.label}</span>
                  </div>
                );
              })}
            </div>
            <div style={styles.nextRewardCard}>
              <div style={styles.rewardIconWrapper}>
                <FaFire color="#fbbf24" />
              </div>
              <div style={styles.rewardInfo}>
                <div style={styles.rewardTitle}>مكافأة قادمة</div>
                <div style={styles.rewardLevel}>عند المستوى 15</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Auth Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.formSection}
        >
          <div className="auth-card" style={styles.formCard}>
            {/* Logo */}
            <div style={styles.logoWrapper}>
              <div style={styles.logoIcon}>
                <div className="city-logo-inner" />
              </div>
              <h2 style={styles.formAppTitle}>مدينة العطاء</h2>
            </div>

            <div style={styles.formHeader}>
              <h3 style={styles.formTitle}>
                {isLogin ? 'سجّل الدخول إلى مدينة العطاء' : 'أنشئ حسابك في مدينة العطاء'}
              </h3>
              <p style={styles.formSubtitle}>أكمل المهام، اجمع النقاط، وارتقِ بمستواك</p>
            </div>

            <form onSubmit={isLogin ? loginFormik.handleSubmit : registerFormik.handleSubmit} style={styles.form}>
              {!isLogin && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>الاسم الكامل</label>
                  <div style={styles.inputWrapper}>
                    <FaUser style={styles.inputIcon} />
                    <input
                      name="fullname"
                      type="text"
                      placeholder="أدخل اسمك الكامل"
                      style={styles.input}
                      {...registerFormik.getFieldProps('fullname')}
                    />
                  </div>
                  {registerFormik.touched.fullname && registerFormik.errors.fullname && (
                    <span style={styles.error}>{registerFormik.errors.fullname}</span>
                  )}
                </div>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.label}>البريد الإلكتروني</label>
                <div style={styles.inputWrapper}>
                  <FaEnvelope style={styles.inputIcon} />
                  <input
                    name="email"
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    style={styles.input}
                    {...(isLogin ? loginFormik.getFieldProps('email') : registerFormik.getFieldProps('email'))}
                  />
                </div>
                {isLogin ? (
                  loginFormik.touched.email && loginFormik.errors.email && <span style={styles.error}>{loginFormik.errors.email}</span>
                ) : (
                  registerFormik.touched.email && registerFormik.errors.email && <span style={styles.error}>{registerFormik.errors.email}</span>
                )}
              </div>

              {!isLogin && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>تاريخ الميلاد</label>
                  <div style={styles.inputWrapper}>
                    <FaCalendarAlt style={styles.inputIcon} />
                    <input
                      name="birthDate"
                      type="date"
                      style={styles.input}
                      {...registerFormik.getFieldProps('birthDate')}
                    />
                  </div>
                  {registerFormik.touched.birthDate && registerFormik.errors.birthDate && (
                    <span style={styles.error}>{registerFormik.errors.birthDate}</span>
                  )}
                </div>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.label}>كلمة المرور</label>
                <div style={styles.inputWrapper}>
                  <FaLock style={styles.inputIcon} />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور"
                    style={styles.input}
                    {...(isLogin ? loginFormik.getFieldProps('password') : registerFormik.getFieldProps('password'))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {isLogin ? (
                  loginFormik.touched.password && loginFormik.errors.password && <span style={styles.error}>{loginFormik.errors.password}</span>
                ) : (
                  registerFormik.touched.password && registerFormik.errors.password && <span style={styles.error}>{registerFormik.errors.password}</span>
                )}
              </div>

              {!isLogin && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>تأكيد كلمة المرور</label>
                  <div style={styles.inputWrapper}>
                    <FaLock style={styles.inputIcon} />
                    <input
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="أعد إدخال كلمة المرور"
                      style={styles.input}
                      {...registerFormik.getFieldProps('confirmPassword')}
                    />
                  </div>
                  {registerFormik.touched.confirmPassword && registerFormik.errors.confirmPassword && (
                    <span style={styles.error}>{registerFormik.errors.confirmPassword}</span>
                  )}
                </div>
              )}

              {isLogin && (
                <div style={styles.formFooter}>
                  <label style={styles.rememberMe}>
                    <input type="checkbox" style={styles.checkbox} />
                    <span>تذكرني</span>
                  </label>
                  <button type="button" style={styles.forgotPassword}>نسيت كلمة المرور؟</button>
                </div>
              )}

              {authError && <div style={styles.authError}>{authError}</div>}

              <button
                type="submit"
                style={styles.submitBtn}
                disabled={isLogin ? loginFormik.isSubmitting : registerFormik.isSubmitting}
              >
                {isLogin
                  ? (loginFormik.isSubmitting ? 'جاري الدخول...' : 'تسجيل الدخول')
                  : (registerFormik.isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد')
                }
                <FaChevronRight size={12} style={{ marginRight: 8, transform: 'rotate(180deg)' }} />
              </button>

              <div style={styles.divider}>
                <span style={styles.dividerText}>أو</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                style={styles.googleBtn}
              >
                <FaGoogle color="#DB4437" />
                <span>متابعة باستخدام Google</span>
              </button>

              <div style={styles.switchAuth}>
                <span>{isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}</span>
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  style={styles.switchBtn}
                >
                  {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Cairo', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0a1a30',
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  bgOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(10, 26, 48, 0.8) 0%, rgba(10, 26, 48, 0.4) 100%)',
    zIndex: 1,
  },
  bgStars: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'radial-gradient(white, rgba(255,255,255,0.2) 2px, transparent 40px)',
    backgroundSize: '100px 100px',
    backgroundPosition: '0 0, 50px 50px',
    opacity: 0.1,
    zIndex: 0,
  },
  wrapper: {
    display: 'flex',
    width: '100%',
    maxWidth: '1100px',
    padding: '2rem',
    zIndex: 10,
    gap: '3rem',
    alignItems: 'flex-start',
  },
  statsSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    color: '#fff',
    maxWidth: '450px',
  },
  header: {
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 900,
    marginBottom: '0.5rem',
    textShadow: '0 0 20px rgba(255,255,255,0.3)',
  },
  subtitle: {
    fontSize: '1rem',
    opacity: 0.7,
    lineHeight: 1.6,
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '1.2rem',
    display: 'flex',
    gap: '1.2rem',
    alignItems: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  levelBadge: {
    width: '60px',
    height: '60px',
    borderRadius: '15px',
    background: 'linear-gradient(135deg, #1d6ed8, #3ba2f8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px rgba(29, 110, 216, 0.3)',
  },
  levelIcon: {
    fontSize: '1rem',
    marginBottom: '2px',
  },
  levelNumber: {
    fontSize: '1.4rem',
    fontWeight: 900,
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.6rem',
    alignItems: 'baseline',
  },
  statTitle: {
    fontSize: '1.1rem',
    fontWeight: 800,
  },
  statValue: {
    fontSize: '0.9rem',
    color: '#fbbf24',
    fontWeight: 700,
  },
  progressBarBg: {
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #10b981, #34d399)',
    borderRadius: '4px',
  },
  statFooter: {
    fontSize: '0.8rem',
    opacity: 0.5,
  },
  miniCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '1rem 1.2rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  coinIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(251, 191, 36, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fbbf24',
  },
  coinIcon: {
    fontSize: '1.2rem',
  },
  statValuePositive: {
    fontSize: '0.8rem',
    color: '#10b981',
    fontWeight: 700,
  },
  statSubtitle: {
    fontSize: '0.9rem',
    opacity: 0.7,
  },
  thisWeekLabel: {
    position: 'absolute',
    left: '1.2rem',
    bottom: '1rem',
    fontSize: '0.75rem',
    opacity: 0.4,
  },
  tasksCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '1.2rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  tasksHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontSize: '1rem',
    fontWeight: 800,
    marginBottom: '1rem',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  missionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  missionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    padding: '0.5rem 0',
  },
  missionIconWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#3ba2f8',
  },
  missionIcon: {
    fontSize: '0.9rem',
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
  },
  missionDesc: {
    fontSize: '0.75rem',
    opacity: 0.5,
  },
  missionReward: {
    fontSize: '0.85rem',
    color: '#fbbf24',
    fontWeight: 700,
  },
  viewAllTasks: {
    marginTop: '1.2rem',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#3ba2f8',
    cursor: 'pointer',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
  },
  journeySection: {
    marginTop: '1rem',
  },
  journeyHeader: {
    fontSize: '0.95rem',
    fontWeight: 800,
    marginBottom: '1.2rem',
    opacity: 0.9,
  },
  journeyPath: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: '1.5rem',
    padding: '0 0.5rem',
  },
  journeyStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.6rem',
    zIndex: 2,
  },
  journeyNode: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  journeyLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  nextRewardCard: {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '15px',
    padding: '0.8rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  rewardIconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: '0.85rem',
    opacity: 0.7,
  },
  rewardLevel: {
    fontSize: '0.9rem',
    fontWeight: 800,
  },
  formSection: {
    flex: 1,
    maxWidth: '500px',
    minWidth: '380px',
  },
  formCard: {
    background: '#fff',
    borderRadius: '30px',
    padding: '2.5rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  logoWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  logoIcon: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #1d6ed8, #3ba2f8)',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.8rem',
    boxShadow: '0 8px 16px rgba(29, 110, 216, 0.2)',
  },
  formAppTitle: {
    fontSize: '1.2rem',
    fontWeight: 900,
    color: '#0a1a30',
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  formTitle: {
    fontSize: '1.4rem',
    fontWeight: 900,
    color: '#0a1a30',
    marginBottom: '0.5rem',
  },
  formSubtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#475569',
    marginRight: '0.4rem',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    right: '1rem',
    color: '#94a3b8',
  },
  input: {
    width: '100%',
    padding: '0.8rem 2.8rem 0.8rem 1rem',
    borderRadius: '14px',
    border: '1.5px solid #e2e8f0',
    fontSize: '0.95rem',
    fontFamily: "'Cairo', sans-serif",
    transition: 'all 0.2s ease',
    outline: 'none',
    backgroundColor: '#f8fafc',
  },
  passwordToggle: {
    position: 'absolute',
    left: '1rem',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '0.2rem',
  },
  formFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '-0.5rem',
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: '#64748b',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#1d6ed8',
  },
  forgotPassword: {
    background: 'none',
    border: 'none',
    fontSize: '0.85rem',
    color: '#1d6ed8',
    fontWeight: 700,
    cursor: 'pointer',
  },
  submitBtn: {
    marginTop: '1rem',
    background: 'linear-gradient(135deg, #1d6ed8, #3ba2f8)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    padding: '1rem',
    fontSize: '1rem',
    fontWeight: 900,
    fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 20px rgba(29, 110, 216, 0.2)',
    transition: 'all 0.2s ease',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '1.5rem 0',
  },
  dividerText: {
    margin: '0 1rem',
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.8rem',
    padding: '0.8rem',
    borderRadius: '14px',
    border: '1.5px solid #e2e8f0',
    background: '#fff',
    fontSize: '0.95rem',
    fontWeight: 700,
    fontFamily: "'Cairo', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  switchAuth: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.9rem',
    color: '#64748b',
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#1d6ed8',
    fontWeight: 800,
    cursor: 'pointer',
    marginRight: '0.5rem',
    fontFamily: "'Cairo', sans-serif",
  },
  error: {
    fontSize: '0.75rem',
    color: '#ef4444',
    marginTop: '0.2rem',
    marginRight: '0.4rem',
  },
  authError: {
    background: '#fee2e2',
    color: '#ef4444',
    padding: '0.8rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    textAlign: 'center',
    fontWeight: 700,
  }
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');

  .auth-page {
    --bg-card: #ffffff;
    --bg-card-2: #f8fafc;
    --text-primary: #0a1a30;
    --text-secondary: #64748b;
    --border: #e2e8f0;
    --input-bg: #f8fafc;
    --input-border: #e2e8f0;
    --surface: #ffffff;
    --background: #f8fafc;
    --text: #0a1a30;
    --text-muted: #64748b;
    color: #0a1a30;
  }

  .auth-page h1,
  .auth-page h2,
  .auth-page h3,
  .auth-page h4,
  .auth-page p,
  .auth-page span,
  .auth-page label,
  .auth-page div {
    color: inherit;
  }

  .auth-page input,
  .auth-page select,
  .auth-page textarea {
    background-color: #f8fafc !important;
    color: #0a1a30 !important;
    border-color: #e2e8f0 !important;
  }

  .auth-page input:focus {
    border-color: #1d6ed8 !important;
    background-color: #fff !important;
    box-shadow: 0 0 0 4px rgba(29, 110, 216, 0.1);
  }

  .submitBtn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(29, 110, 216, 0.3);
  }

  .googleBtn:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
  }

  .city-logo-inner {
    width: 28px;
    height: 32px;
    background-color: #fff;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    position: relative;
  }

  .city-logo-inner::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    background-color: #1d6ed8;
    clip-path: path('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
  }

  .journeyPath::after {
    content: '';
    position: absolute;
    top: 12px;
    left: 1rem;
    right: 1rem;
    height: 2px;
    background: rgba(255, 255, 255, 0.1);
    z-index: 1;
  }

  @media (max-width: 950px) {
    .stats-section {
      display: none !important;
    }
    .auth-wrapper {
      justify-content: center !important;
    }
  }

  @media (max-width: 500px) {
    .auth-wrapper {
      padding: 1rem !important;
    }
    .form-card {
      padding: 1.5rem !important;
      border-radius: 20px !important;
    }
    .form-section {
      min-width: 100% !important;
    }
  }
`;

export default AuthScreen;
