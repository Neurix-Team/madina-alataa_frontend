import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBaby,
  FaHeart,
  FaStar,
  FaChild,
} from 'react-icons/fa';
import RocketBackground from '../components/common/RocketBackground';
import CanvasBackground from '../components/common/CanvasBackground';
import { getAvatarImageUrl } from '../utils/avatarProfile';

const CHILDREN_STORAGE_KEY = 'children_settings_v1';

const initialChildrenData = [
  {
    id: 1,
    name: 'أحمد محمد',
    age: 9,
    city: 'القاهرة',
    needs: ['علاج دوري', 'أدوية شهرية', 'تحليل كل 3 شهور'],
    requestStatus: 'قيد المراجعة',
    fundingPercent: 62,
  },
  {
    id: 2,
    name: 'سارة علي',
    age: 7,
    city: 'الجيزة',
    needs: ['جلسات علاج طبيعي', 'مستلزمات مدرسية'],
    requestStatus: 'مقبول',
    fundingPercent: 84,
  },
  {
    id: 3,
    name: 'يوسف حسن',
    age: 11,
    city: 'الإسكندرية',
    needs: ['عملية جراحية', 'متابعة بعد العملية'],
    requestStatus: 'معلق',
    fundingPercent: 37,
  },
];

const statusColor = (status) => {
  if (status === 'مقبول') return '#22c55e';
  if (status === 'قيد المراجعة') return '#f59e0b';
  return '#ef4444';
};

const CSS = `
  @keyframes parentsFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes parentsPulse {
    0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(29,110,216,0.25); }
    50% { transform: scale(1.02); box-shadow: 0 0 0 8px rgba(29,110,216,0.0); }
  }
  @keyframes parentsGlow {
    0%,100% { box-shadow: 0 0 0 rgba(34,197,94,0); }
    50% { box-shadow: 0 0 16px rgba(34,197,94,0.25); }
  }

  .children-layout {
    direction: rtl;
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 14px;
    align-items: start;
  }

  .children-sidebar {
    position: sticky;
    top: 0;
    min-height: 100vh;
    background: linear-gradient(180deg, #060f1e 0%, #0a1a30 20%, #0d2040 50%, #0f2744 75%, #122d52 100%);
    border: 1px solid rgba(29,110,216,0.22);
    border-radius: 24px;
    padding: 20px 12px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(29,110,216,0.15), inset 0 1px 0 rgba(255,255,255,0.06);
    animation: parentsFadeUp .45s ease both;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: hidden;
  }

  .children-sidebar-logo {
    text-align: center;
    margin-bottom: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(29,110,216,0.2);
    color: #fff;
    font-weight: 900;
  }

  .children-sidebar-title {
    margin: 4px 0 0;
    font-size: 16px;
    font-weight: 900;
    color: #fff;
  }

  .children-sidebar-subtitle {
    font-size: 10px;
    color: rgba(14,165,233,0.8);
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .children-user-card {
    background: linear-gradient(135deg, rgba(29,110,216,0.22) 0%, rgba(14,165,233,0.12) 100%);
    border-radius: 18px;
    padding: 12px;
    border: 1px solid rgba(29,110,216,0.3);
    box-shadow: 0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .children-sidebar-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: block;
    margin: 0 auto 10px;
    border: 2px solid rgba(255,255,255,0.35);
    object-fit: cover;
    cursor: pointer;
    box-shadow: 0 8px 22px rgba(0,0,0,0.28);
  }

  .children-user-meta {
    text-align: center;
    color: #fff;
    font-weight: 800;
    font-size: 12px;
    margin-bottom: 8px;
  }

  .children-xp-wrap {
    margin-bottom: 8px;
  }

  .children-xp-bar {
    height: 7px;
    background: rgba(0,0,0,0.3);
    border-radius: 99px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.06);
  }

  .children-xp-fill {
    height: 100%;
    width: 64%;
    background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fde68a 100%);
    border-radius: 99px;
  }

  .children-kp {
    background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08));
    border: 1px solid rgba(251,191,36,0.3);
    border-radius: 12px;
    padding: 6px 10px;
    text-align: center;
    font-size: 12px;
    font-weight: 900;
    color: #fbbf24;
  }

  .children-sidebar-list {
    display: grid;
    gap: 8px;
    margin-top: 2px;
  }

  .children-side-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    border: 1px solid transparent;
    border-radius: 14px;
    padding: 10px 12px;
    background: transparent;
    color: rgba(255,255,255,0.6);
    font-weight: 900;
    font-family: 'Cairo', sans-serif;
    cursor: pointer;
    text-align: right;
    transition: all .25s ease;
  }

  .children-side-btn:hover {
    color: #fff;
    border-color: rgba(29,110,216,0.25);
    transform: translateX(-4px);
    background: linear-gradient(135deg, rgba(29,110,216,0.25) 0%, rgba(14,165,233,0.12) 100%);
  }

  .children-side-btn--primary {
    background: linear-gradient(135deg, rgba(29,110,216,0.55) 0%, rgba(14,165,233,0.35) 100%);
    border-color: rgba(14,165,233,0.4);
    color: #fff;
  }

  .children-side-btn--danger {
    background: linear-gradient(135deg,#dc2626,#ef4444);
    border-color: #dc2626;
    color: #fff;
    margin-top: 6px;
  }

  .children-wrap {
    direction: rtl;
    display: grid;
    gap: 14px;
    animation: parentsFadeUp .45s ease both;
    position: relative;
    z-index: 1;
  }

  .children-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 14px;
  }

  .children-card {
    background: var(--bg-card);
    border: 1.5px solid var(--border);
    border-radius: 20px;
    padding: 16px;
    box-shadow: var(--shadow-sm);
    animation: parentsFadeUp .45s ease both;
    transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
  }

  .children-card:hover {
    transform: translateY(-2px);
    border-color: rgba(29,110,216,.45);
    box-shadow: 0 10px 24px rgba(2,8,23,.18);
  }

  .children-title {
    margin: 0 0 10px;
    font-size: 16px;
    font-weight: 900;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 8px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
  }

  .children-muted {
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
  }

  .children-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 800;
    border: 1px solid transparent;
  }

  .children-chip--ok {
    background: rgba(34,197,94,.14);
    color: #15803d;
    border-color: rgba(34,197,94,.3);
    animation: parentsGlow 2.8s ease-in-out infinite;
  }

  .children-chip--warn {
    background: rgba(245,158,11,.14);
    color: #b45309;
    border-color: rgba(245,158,11,.35);
  }

  .children-chip--danger {
    background: rgba(239,68,68,.14);
    color: #b91c1c;
    border-color: rgba(239,68,68,.35);
  }

  .children-list {
    display: grid;
    gap: 8px;
    margin-top: 10px;
  }

  .children-list-item {
    border: 1px solid var(--border);
    background: var(--bg-card-2);
    border-radius: 12px;
    padding: 10px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 800;
    font-size: 13px;
    color: var(--text-primary);
  }

  .children-progress {
    height: 10px;
    border-radius: 999px;
    background: var(--border);
    overflow: hidden;
    border: 1px solid rgba(148,163,184,.25);
  }

  .children-progress-bar {
    height: 100%;
    border-radius: 999px;
    transition: width 1s ease-out;
    animation: parentsPulse 2.5s ease-in-out infinite;
  }

  .children-analytics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0,1fr));
    gap: 12px;
  }

  .children-analytics-card {
    border-radius: 14px;
    padding: 12px;
    border: 1px solid rgba(29,110,216,.32);
    box-shadow: 0 10px 20px rgba(2,8,23,.14);
    animation: parentsFadeUp .5s ease both, analyticsPulse 2.8s ease-in-out infinite;
    transition: transform .25s ease, box-shadow .25s ease;
  }

  .children-analytics-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 28px rgba(2,8,23,.2);
  }

  .children-analytics-card--blue {
    background: linear-gradient(135deg, rgba(37,99,235,.28), rgba(59,130,246,.18));
    border-color: rgba(37,99,235,.5);
  }

  .children-analytics-card--green {
    background: linear-gradient(135deg, rgba(34,197,94,.24), rgba(74,222,128,.14));
    border-color: rgba(34,197,94,.45);
  }

  .children-analytics-card--amber {
    background: linear-gradient(135deg, rgba(245,158,11,.26), rgba(251,191,36,.14));
    border-color: rgba(245,158,11,.48);
  }

  .children-settings {
    display: grid;
    gap: 12px;
    margin-top: 10px;
  }

  .children-settings-card {
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 12px;
    background: var(--bg-card-2);
  }

  .children-input {
    width: 100%;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 8px 10px;
    background: var(--bg-card);
    color: var(--text-primary);
    font-weight: 800;
    font-family: 'Cairo', sans-serif;
    margin-top: 6px;
  }

  .children-form-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  @keyframes analyticsPulse {
    0%, 100% { box-shadow: 0 10px 20px rgba(2,8,23,.14); }
    50% { box-shadow: 0 14px 30px rgba(37,99,235,.25); }
  }

  @keyframes emojiFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: .25; }
    50% { transform: translateY(-11px) rotate(7deg); opacity: .55; }
  }

  @media (max-width: 900px) {
    .children-layout {
      grid-template-columns: 1fr;
    }
    .children-grid {
      grid-template-columns: 1fr;
    }
    .children-analytics {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .children-layout {
      gap: 12px;
    }
    .children-sidebar {
      position: relative;
      top: auto;
      min-height: auto;
      width: 100%;
      border-radius: 20px;
      padding: 16px;
    }
    .children-sidebar-logo {
      font-size: 14px;
    }
    .children-side-btn {
      font-size: 12px;
      padding: 10px 10px;
    }
    .children-card,
    .children-analytics-card,
    .children-settings-card {
      padding: 14px;
    }
    .children-analytics {
      grid-template-columns: 1fr;
    }
  }
`;

function loadChildren() {
  try {
    const raw = localStorage.getItem(CHILDREN_STORAGE_KEY);
    if (!raw) return initialChildrenData;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : initialChildrenData;
  } catch {
    return initialChildrenData;
  }
}

export default function MyChildrenPage() {
  const navigate = useNavigate();
  const [childrenData, setChildrenData] = useState(loadChildren);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    navigate('/auth');
  };

  const updateChildField = (id, key, value) => {
    setChildrenData((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
  };

  const saveChildrenSettings = () => {
    localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(childrenData));
    setSettingsOpen(false);
  };

  return (
    <div className="children-layout" style={{ position: 'relative', minHeight: '100vh' }}>
      <style>{CSS}</style>
      <CanvasBackground />
      <RocketBackground />

      <aside className="children-sidebar">
        <div className="children-sidebar-logo">
          <div style={{ fontSize: 30, filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.5))' }}><FaStar /></div>
          <div className="children-sidebar-title">بطل العطاء</div>
          <div className="children-sidebar-subtitle">Madina Al-Ataa</div>
        </div>

        <div className="children-user-card">
          <img
            className="children-sidebar-avatar"
            src={getAvatarImageUrl()}
            alt="Profile avatar"
            onClick={() => navigate('/profile-v2')}
            title="الذهاب إلى صفحة البروفايل"
          />
          <div className="children-user-meta">ولي أمر • المستوى 6</div>
          <div className="children-xp-wrap">
            <div className="children-xp-bar">
              <div className="children-xp-fill" />
            </div>
          </div>
          <div className="children-kp">1,250 نقطة خير</div>
        </div>

        <div className="children-sidebar-list">
          <button className="children-side-btn children-side-btn--primary" onClick={() => navigate('/parents')}>الرجوع لصفحة الاباء</button>
          <button className="children-side-btn" onClick={() => navigate('/map')}>الرجوع للرئيسية</button>
          <button className="children-side-btn" onClick={() => navigate('/profile-v2')}>البروفايل</button>
          <button className="children-side-btn" onClick={() => setSettingsOpen((s) => !s)}>الإعدادات</button>
          <button className="children-side-btn children-side-btn--danger" onClick={handleLogout}>تسجيل الخروج</button>
        </div>
      </aside>

      <div className="children-wrap">
        <div
          className="children-card"
          style={{
            borderRadius: 24,
            padding: 18,
            marginBottom: 0,
            background: 'linear-gradient(130deg,#0b2545 0%, #0f172a 40%, #1d4ed8 100%)',
            boxShadow: '0 16px 34px rgba(15, 23, 42, 0.35)',
            border: '1px solid rgba(148, 163, 184, 0.28)',
            animation: 'parentsFadeUp .45s ease both',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span style={{ position: 'absolute', top: 10, left: 12, fontSize: 22, animation: 'emojiFloat 4.2s ease-in-out infinite' }}><FaBaby /></span>
          <span style={{ position: 'absolute', top: 46, right: 16, fontSize: 18, animation: 'emojiFloat 5s ease-in-out infinite' }}><FaHeart /></span>
          <span style={{ position: 'absolute', bottom: 14, left: 90, fontSize: 18, animation: 'emojiFloat 4.6s ease-in-out infinite' }}><FaStar /></span>
          <h1 className="children-title" style={{ margin: 0, color: '#fff', fontSize: 30, fontWeight: 900, position: 'relative', zIndex: 1 }}><FaBaby /> My Children</h1>
          <div
            className="children-muted"
            style={{
              marginBottom: 12,
              background: 'rgba(15,23,42,0.45)',
              border: '1px solid rgba(191, 219, 254, 0.45)',
              color: '#ffffff',
              borderRadius: 12,
              padding: '10px 12px',
              fontWeight: 900,
              lineHeight: 1.8,
              boxShadow: '0 6px 14px rgba(15,23,42,.35)',
            }}
          >
            متابعة بيانات كل طفل، حالة الطلب، ونسبة التمويل بنفس تجربة واجهة أولياء الأمور.
          </div>

          {settingsOpen && (
            <div className="children-settings">
              {childrenData.map((child) => (
                <div key={`settings-${child.id}`} className="children-settings-card">
                  <div style={{ fontWeight: 900, marginBottom: 8 }}>إعدادات الطفل: {child.name}</div>
                  <label style={{ fontWeight: 800, fontSize: 12 }}>
                    الاسم
                    <input className="children-input" value={child.name} onChange={(e) => updateChildField(child.id, 'name', e.target.value)} />
                  </label>
                  <label style={{ fontWeight: 800, fontSize: 12 }}>
                    العمر
                    <input className="children-input" type="number" value={child.age} onChange={(e) => updateChildField(child.id, 'age', Number(e.target.value))} />
                  </label>
                  <label style={{ fontWeight: 800, fontSize: 12 }}>
                    المدينة
                    <input className="children-input" value={child.city} onChange={(e) => updateChildField(child.id, 'city', e.target.value)} />
                  </label>
                </div>
              ))}
              <div className="children-form-actions">
                <button className="children-side-btn children-side-btn--primary" onClick={saveChildrenSettings}>حفظ إعدادات الأطفال</button>
                <button className="children-side-btn" onClick={() => setSettingsOpen(false)}>إلغاء</button>
              </div>
            </div>
          )}
        </div>

        <section className="children-analytics">
          <div className="children-analytics-card children-analytics-card--blue">
            <div style={{ fontSize: 12, fontWeight: 800, color: '#dbeafe' }}>متوسط التمويل</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>61%</div>
            <div style={{ fontSize: 11, color: '#bfdbfe', fontWeight: 800 }}>+8% هذا الشهر</div>
          </div>
          <div className="children-analytics-card children-analytics-card--green">
            <div style={{ fontSize: 12, fontWeight: 800, color: '#dcfce7' }}>الطلبات المقبولة</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>2/3</div>
            <div style={{ fontSize: 11, color: '#bbf7d0', fontWeight: 800 }}>نسبة قبول جيدة</div>
          </div>
          <div className="children-analytics-card children-analytics-card--amber">
            <div style={{ fontSize: 12, fontWeight: 800, color: '#fef3c7' }}>أطفال نشطون</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>3</div>
            <div style={{ fontSize: 11, color: '#fde68a', fontWeight: 800 }}>تفاعل مستمر</div>
          </div>
        </section>

        <div className="children-grid">
          {childrenData.map((child, idx) => (
            <section key={child.id} className="children-card" style={{ animationDelay: `${idx * 60}ms` }}>
              <h3 className="children-title"><FaChild /> {child.name}</h3>

              <div className="children-list">
                <div className="children-list-item"><span>العمر</span><span>{child.age} سنة</span></div>
                <div className="children-list-item"><span>المدينة</span><span>{child.city}</span></div>
              </div>

              <div className="children-list" style={{ marginTop: 12 }}>
                {child.needs.map((need) => (
                  <div key={need} className="children-list-item">
                    <span>احتياج</span>
                    <span>{need}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 12 }}>
                <span className={`children-chip ${
                  child.requestStatus === 'مقبول'
                    ? 'children-chip--ok'
                    : child.requestStatus === 'قيد المراجعة'
                    ? 'children-chip--warn'
                    : 'children-chip--danger'
                }`}>
                  حالة الطلب: {child.requestStatus}
                </span>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>
                  <span>نسبة التمويل</span>
                  <span style={{ color: statusColor(child.requestStatus) }}>{child.fundingPercent}%</span>
                </div>
                <div className="children-progress">
                  <div className="children-progress-bar" style={{ width: `${child.fundingPercent}%`, background: 'linear-gradient(90deg,#3ba2f8,#1d6ed8)' }} />
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
