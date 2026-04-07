import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaHeart,
  FaStar,
  FaIdCard,
  FaChild,
  FaEnvelope,
  FaCheckCircle,
} from 'react-icons/fa';
import RocketBackground from '../common/RocketBackground';
import CanvasBackground from '../common/CanvasBackground';

const STORAGE_KEY = 'parent_profile_settings_v1';

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

  .parents-layout {
    direction: rtl;
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 14px;
    align-items: start;
  }

  .parents-sidebar {
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

  .parents-sidebar-logo {
    text-align: center;
    margin-bottom: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(29,110,216,0.2);
    color: #fff;
    font-weight: 900;
  }

  .parents-sidebar-title {
    margin: 4px 0 0;
    font-size: 16px;
    font-weight: 900;
    color: #fff;
  }

  .parents-sidebar-subtitle {
    font-size: 10px;
    color: rgba(14,165,233,0.8);
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .parents-user-card {
    background: linear-gradient(135deg, rgba(29,110,216,0.22) 0%, rgba(14,165,233,0.12) 100%);
    border-radius: 18px;
    padding: 12px;
    border: 1px solid rgba(29,110,216,0.3);
    box-shadow: 0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .parents-sidebar-avatar {
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

  .parents-user-meta {
    text-align: center;
    color: #fff;
    font-weight: 800;
    font-size: 12px;
    margin-bottom: 8px;
  }

  .parents-xp-wrap {
    margin-bottom: 8px;
  }

  .parents-xp-bar {
    height: 7px;
    background: rgba(0,0,0,0.3);
    border-radius: 99px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.06);
  }

  .parents-xp-fill {
    height: 100%;
    width: 66%;
    background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fde68a 100%);
    border-radius: 99px;
  }

  .parents-kp {
    background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08));
    border: 1px solid rgba(251,191,36,0.3);
    border-radius: 12px;
    padding: 6px 10px;
    text-align: center;
    font-size: 12px;
    font-weight: 900;
    color: #fbbf24;
  }

  .parents-sidebar-list {
    display: grid;
    gap: 8px;
    margin-top: 2px;
  }

  .parents-side-btn {
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

  .parents-side-btn:hover {
    color: #fff;
    border-color: rgba(29,110,216,0.25);
    transform: translateX(-4px);
    background: linear-gradient(135deg, rgba(29,110,216,0.25) 0%, rgba(14,165,233,0.12) 100%);
  }

  .parents-side-btn--primary {
    background: linear-gradient(135deg, rgba(29,110,216,0.55) 0%, rgba(14,165,233,0.35) 100%);
    border-color: rgba(14,165,233,0.4);
    color: #fff;
  }

  .parents-side-btn--danger {
    background: linear-gradient(135deg,#dc2626,#ef4444);
    border-color: #dc2626;
    color: #fff;
    margin-top: 6px;
  }

  .parents-wrap {
    direction: rtl;
    display: grid;
    gap: 14px;
    animation: parentsFadeUp .45s ease both;
    position: relative;
    z-index: 1;
  }

  .parents-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0,1fr));
    gap: 14px;
  }

  .parents-card {
    background: var(--bg-card);
    border: 1.5px solid var(--border);
    border-radius: 20px;
    padding: 16px;
    box-shadow: var(--shadow-sm);
    animation: parentsFadeUp .45s ease both;
    transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
  }

  .parents-card:hover {
    transform: translateY(-2px);
    border-color: rgba(29,110,216,.45);
    box-shadow: 0 10px 24px rgba(2,8,23,.18);
  }

  .parents-title {
    margin: 0 0 10px;
    font-size: 16px;
    font-weight: 900;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 8px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
  }

  .parents-muted {
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
  }

  .parents-kpi {
    font-size: 30px;
    font-weight: 900;
    color: var(--text-primary);
    line-height: 1.1;
  }

  .parents-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 800;
    border: 1px solid transparent;
  }

  .parents-chip--ok {
    background: rgba(34,197,94,.14);
    color: #15803d;
    border-color: rgba(34,197,94,.3);
    animation: parentsGlow 2.8s ease-in-out infinite;
  }

  .parents-chip--warn {
    background: rgba(245,158,11,.14);
    color: #b45309;
    border-color: rgba(245,158,11,.35);
  }

  .parents-list {
    display: grid;
    gap: 8px;
    margin-top: 10px;
  }

  .parents-list-item {
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

  .parents-progress-wrap {
    margin-top: 10px;
    display: grid;
    gap: 8px;
  }

  .parents-progress-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 800;
    color: var(--text-primary);
  }

  .parents-progress {
    height: 10px;
    border-radius: 999px;
    background: var(--border);
    overflow: hidden;
    border: 1px solid rgba(148,163,184,.25);
  }

  .parents-progress-bar {
    height: 100%;
    border-radius: 999px;
    transition: width 1s ease-out;
    animation: parentsPulse 2.5s ease-in-out infinite;
  }

  .parents-analytics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0,1fr));
    gap: 12px;
  }

  .parents-analytics-card {
    border-radius: 14px;
    padding: 12px;
    border: 1px solid rgba(29,110,216,.32);
    box-shadow: 0 10px 20px rgba(2,8,23,.14);
    animation: parentsFadeUp .5s ease both, analyticsPulse 2.8s ease-in-out infinite;
    transition: transform .25s ease, box-shadow .25s ease;
  }

  .parents-analytics-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 28px rgba(2,8,23,.2);
  }

  .parents-analytics-card--blue {
    background: linear-gradient(135deg, rgba(37,99,235,.28), rgba(59,130,246,.18));
    border-color: rgba(37,99,235,.5);
  }

  .parents-analytics-card--green {
    background: linear-gradient(135deg, rgba(34,197,94,.24), rgba(74,222,128,.14));
    border-color: rgba(34,197,94,.45);
  }

  .parents-analytics-card--amber {
    background: linear-gradient(135deg, rgba(245,158,11,.26), rgba(251,191,36,.14));
    border-color: rgba(245,158,11,.48);
  }

  .parents-form {
    display: grid;
    gap: 10px;
    margin-top: 8px;
  }

  .parents-input {
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: 10px 12px;
    background: var(--bg-card-2);
    color: var(--text-primary);
    font-weight: 800;
    font-family: 'Cairo', sans-serif;
  }

  .parents-form-actions {
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
    .parents-layout {
      grid-template-columns: 1fr;
    }
    .parents-grid {
      grid-template-columns: 1fr;
    }
    .parents-analytics {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .parents-layout {
      gap: 12px;
    }
    .parents-sidebar {
      position: relative;
      top: auto;
      min-height: auto;
      width: 100%;
      border-radius: 20px;
      padding: 16px;
    }
    .parents-sidebar-logo {
      font-size: 14px;
    }
    .parents-side-btn {
      font-size: 12px;
      padding: 10px 10px;
    }
    .parents-card,
    .parents-analytics-card,
    .parents-form {
      padding: 14px;
    }
    .parents-analytics {
      grid-template-columns: 1fr;
    }
  }
`;

function getSavedParentInfo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const ParentsTab = ({ userStats }) => {
  const navigate = useNavigate();
  const defaultInfo = useMemo(() => ({
    name: 'ولي أمر - أحمد السيد',
    phone: '0101 234 5678',
    city: 'القاهرة',
    relation: 'الأب',
  }), []);
  const [parentInfo, setParentInfo] = useState(() => getSavedParentInfo() || defaultInfo);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const childrenCount = 2;

  const requests = [
    { id: 'REQ-102', title: 'طلب متابعة طبية', status: 'قيد المراجعة' },
    { id: 'REQ-115', title: 'طلب دعم تعليمي', status: 'مقبول' },
    { id: 'REQ-131', title: 'طلب تحديث بيانات', status: 'مكتمل' },
  ];

  const verification = {
    state: 'موثّق',
    score: 92,
    docs: 4,
    pendingDocs: 1,
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    navigate('/auth');
  };

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parentInfo));
    setSettingsOpen(false);
  };

  return (
    <div className="parents-layout" style={{ position: 'relative', minHeight: '100vh' }}>
      <style>{CSS}</style>
      <CanvasBackground />
      <RocketBackground />

      <aside className="parents-sidebar">
        <div className="parents-sidebar-logo">
          <div style={{ fontSize: 30, filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.5))' }}><FaStar /></div>
          <div className="parents-sidebar-title">بطل العطاء</div>
          <div className="parents-sidebar-subtitle">Madina Al-Ataa</div>
        </div>

        <div className="parents-user-card">
          <img
            className="parents-sidebar-avatar"
            src="https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=madina-default-avatar"
            alt="Profile avatar"
            onClick={() => navigate('/profile-v2')}
            title="الذهاب إلى صفحة البروفايل"
          />
          <div className="parents-user-meta">ولي أمر • المستوى 6</div>
          <div className="parents-xp-wrap">
            <div className="parents-xp-bar">
              <div className="parents-xp-fill" />
            </div>
          </div>
          <div className="parents-kp">1,250 نقطة خير</div>
        </div>

        <div className="parents-sidebar-list">
          <button className="parents-side-btn parents-side-btn--primary" onClick={() => navigate('/create-request')}>إنشاء طلب جديد</button>
          <button className="parents-side-btn" onClick={() => navigate('/my-children')}>متابعة اطفالي</button>
          <button className="parents-side-btn" onClick={() => navigate('/map')}>الرجوع للرئيسية</button>
          <button className="parents-side-btn" onClick={() => navigate('/profile-v2')}>البروفايل</button>
          <button className="parents-side-btn" onClick={() => setSettingsOpen((s) => !s)}>الإعدادات</button>
          <button className="parents-side-btn parents-side-btn--danger" onClick={handleLogout}>تسجيل الخروج</button>
        </div>
      </aside>

      <div className="parents-wrap">
        <div
          className="parents-card"
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
          <span style={{ position: 'absolute', top: 10, left: 12, fontSize: 22, animation: 'emojiFloat 4.2s ease-in-out infinite' }}><FaUsers /></span>
          <span style={{ position: 'absolute', top: 46, right: 16, fontSize: 18, animation: 'emojiFloat 5s ease-in-out infinite' }}><FaHeart /></span>
          <span style={{ position: 'absolute', bottom: 14, left: 90, fontSize: 18, animation: 'emojiFloat 4.6s ease-in-out infinite' }}><FaStar /></span>
          <h1 className="parents-title" style={{ margin: 0, color: '#fff', fontSize: 30, fontWeight: 900, position: 'relative', zIndex: 1 }}> Parents Dashboard</h1>
          <div className="parents-muted" style={{ marginBottom: 12, background: 'rgba(15,23,42,0.45)', border: '1px solid rgba(191, 219, 254, 0.45)', color: '#ffffff', borderRadius: 12, padding: '10px 12px', fontWeight: 900, lineHeight: 1.8, boxShadow: '0 6px 14px rgba(15,23,42,.35)' }}>
            متابعة بيانات ولي الأمر والأطفال والطلبات وحالة التحقق في مكان واحد.
          </div>

          {settingsOpen && (
            <div className="parents-form">
              <input className="parents-input" value={parentInfo.name} onChange={(e) => setParentInfo((p) => ({ ...p, name: e.target.value }))} placeholder="اسم ولي الأمر" />
              <input className="parents-input" value={parentInfo.phone} onChange={(e) => setParentInfo((p) => ({ ...p, phone: e.target.value }))} placeholder="رقم الهاتف" />
              <input className="parents-input" value={parentInfo.city} onChange={(e) => setParentInfo((p) => ({ ...p, city: e.target.value }))} placeholder="المدينة" />
              <input className="parents-input" value={parentInfo.relation} onChange={(e) => setParentInfo((p) => ({ ...p, relation: e.target.value }))} placeholder="صلة القرابة" />
              <div className="parents-form-actions">
                <button className="parents-side-btn parents-side-btn--primary" onClick={saveSettings}>حفظ الإعدادات</button>
                <button className="parents-side-btn" onClick={() => setSettingsOpen(false)}>إلغاء</button>
              </div>
            </div>
          )}
        </div>

        <section className="parents-analytics">
          <div className="parents-analytics-card parents-analytics-card--blue">
            <div style={{ fontSize: 12, fontWeight: 800, color: '#dbeafe' }}>معدل نشاط الأطفال</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>87%</div>
            <div style={{ fontSize: 11, color: '#bfdbfe', fontWeight: 800 }}>+5% هذا الأسبوع</div>
          </div>
          <div className="parents-analytics-card parents-analytics-card--green">
            <div style={{ fontSize: 12, fontWeight: 800, color: '#dcfce7' }}>متوسط الاستجابة</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>2.1 يوم</div>
            <div style={{ fontSize: 11, color: '#bbf7d0', fontWeight: 800 }}>تحسن عن الشهر الماضي</div>
          </div>
          <div className="parents-analytics-card parents-analytics-card--amber">
            <div style={{ fontSize: 12, fontWeight: 800, color: '#fef3c7' }}>طلبات مكتملة</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginTop: 4 }}>14</div>
            <div style={{ fontSize: 11, color: '#fde68a', fontWeight: 800 }}>من أصل 19 طلب</div>
          </div>
        </section>

        <div className="parents-grid">
          <section className="parents-card" style={{ animationDelay: '40ms' }}>
            <h3 className="parents-title"><FaIdCard /> Parent Info</h3>
            <div className="parents-list">
              <div className="parents-list-item"><span>الاسم</span><span>{parentInfo.name}</span></div>
              <div className="parents-list-item"><span>رقم الهاتف</span><span>{parentInfo.phone}</span></div>
              <div className="parents-list-item"><span>المدينة</span><span>{parentInfo.city}</span></div>
              <div className="parents-list-item"><span>صلة القرابة</span><span>{parentInfo.relation}</span></div>
            </div>
          </section>

          <section className="parents-card" style={{ animationDelay: '90ms' }}>
            <h3 className="parents-title"><FaChild /> Children Count</h3>
            <div className="parents-kpi">{childrenCount}</div>
            <div className="parents-muted" style={{ marginTop: 6 }}>عدد الأطفال المرتبطين بالحساب</div>
            <div className="parents-progress-wrap">
              <div className="parents-progress-row"><span>نشاط الأطفال</span><span>{userStats?.level ? `${userStats.level * 10}%` : '60%'}</span></div>
              <div className="parents-progress"><div className="parents-progress-bar" style={{ width: `${Math.min(100, (userStats?.level || 6) * 10)}%`, background: 'linear-gradient(90deg,#3ba2f8,#1d6ed8)' }} /></div>
            </div>
          </section>

          <section className="parents-card" style={{ animationDelay: '140ms' }}>
            <h3 className="parents-title"><FaEnvelope /> Requests</h3>
            <div className="parents-list">
              {requests.map((r) => (
                <div key={r.id} className="parents-list-item">
                  <span>{r.title}</span>
                  <span className={`parents-chip ${r.status === 'قيد المراجعة' ? 'parents-chip--warn' : 'parents-chip--ok'}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="parents-card" style={{ animationDelay: '190ms' }}>
            <h3 className="parents-title"><FaCheckCircle /> Verification State</h3>
            <div style={{ marginBottom: 10 }}><span className="parents-chip parents-chip--ok">الحالة: {verification.state}</span></div>
            <div className="parents-progress-wrap">
              <div className="parents-progress-row"><span>نسبة التحقق</span><span>{verification.score}%</span></div>
              <div className="parents-progress"><div className="parents-progress-bar" style={{ width: `${verification.score}%`, background: 'linear-gradient(90deg,#22c55e,#16a34a)' }} /></div>
            </div>
            <div className="parents-list" style={{ marginTop: 12 }}>
              <div className="parents-list-item"><span>المستندات المكتملة</span><span>{verification.docs}</span></div>
              <div className="parents-list-item"><span>مستندات مطلوبة</span><span>{verification.pendingDocs}</span></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ParentsTab;
