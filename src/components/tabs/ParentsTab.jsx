// src/components/tabs/ParentsTab.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

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

  .parents-wrap {
    direction: rtl;
    display: grid;
    gap: 14px;
    animation: parentsFadeUp .45s ease both;
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
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
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

  @keyframes analyticsPulse {
    0%, 100% { box-shadow: 0 10px 20px rgba(2,8,23,.14); }
    50% { box-shadow: 0 14px 30px rgba(37,99,235,.25); }
  }

  @keyframes emojiFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: .25; }
    50% { transform: translateY(-11px) rotate(7deg); opacity: .55; }
  }

  @media (max-width: 900px) {
    .parents-grid {
      grid-template-columns: 1fr;
    }
    .parents-analytics {
      grid-template-columns: 1fr;
    }
  }
`;

const ParentsTab = ({ userStats }) => {
  const navigate = useNavigate();
  const parentInfo = {
    name: 'ولي أمر - أحمد السيد',
    phone: '0101 234 5678',
    city: 'القاهرة',
    relation: 'الأب',
  };

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

  return (
    <div className="parents-wrap">
      <style>{CSS}</style>

      <div
        className="parents-card"
        style={{
          background: 'linear-gradient(135deg, rgba(29,110,216,.16), rgba(14,165,233,.1))',
          borderColor: 'rgba(29,110,216,.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span style={{ position: 'absolute', top: 10, left: 12, fontSize: 22, animation: 'emojiFloat 4.2s ease-in-out infinite' }}>👨‍👩‍👧</span>
        <span style={{ position: 'absolute', top: 46, right: 16, fontSize: 18, animation: 'emojiFloat 5s ease-in-out infinite' }}>💙</span>
        <span style={{ position: 'absolute', bottom: 14, left: 90, fontSize: 18, animation: 'emojiFloat 4.6s ease-in-out infinite' }}>✨</span>
        <h2 className="parents-title">👨‍👩‍👧 Parents Dashboard</h2>
        <div
          className="parents-muted"
          style={{
            marginBottom: 12,
            background: 'linear-gradient(135deg, rgba(29,110,216,.18), rgba(14,165,233,.12))',
            border: '1px solid rgba(29,110,216,.35)',
            color: '#0f172a',
            borderRadius: 12,
            padding: '10px 12px',
            fontWeight: 900,
            lineHeight: 1.8,
            boxShadow: '0 6px 14px rgba(29,110,216,.12)',
          }}
        >
          متابعة بيانات ولي الأمر والأطفال والطلبات وحالة التحقق في مكان واحد.
        </div>
        <button
          type="button"
          name="button"
          onClick={() => navigate('/my-children')}
          style={{
            border: '1px solid #1d4ed8',
            borderRadius: 12,
            padding: '10px 14px',
            background: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
            color: '#ffffff',
            fontWeight: 900,
            cursor: 'pointer',
            fontFamily: "'Cairo', sans-serif",
            boxShadow: '0 8px 16px rgba(37,99,235,0.35)',
          }}
        >
          متابعة اطفالي
        </button>
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
        {/* Parent Info */}
        <section className="parents-card" style={{ animationDelay: '40ms' }}>
          <h3 className="parents-title">🪪 Parent Info</h3>
          <div className="parents-list">
            <div className="parents-list-item"><span>الاسم</span><span>{parentInfo.name}</span></div>
            <div className="parents-list-item"><span>رقم الهاتف</span><span>{parentInfo.phone}</span></div>
            <div className="parents-list-item"><span>المدينة</span><span>{parentInfo.city}</span></div>
            <div className="parents-list-item"><span>صلة القرابة</span><span>{parentInfo.relation}</span></div>
          </div>
        </section>

        {/* Children Count */}
        <section className="parents-card" style={{ animationDelay: '90ms' }}>
          <h3 className="parents-title">👶 Children Count</h3>
          <div className="parents-kpi">{childrenCount}</div>
          <div className="parents-muted" style={{ marginTop: 6 }}>
            عدد الأطفال المرتبطين بالحساب
          </div>

          <div className="parents-progress-wrap">
            <div className="parents-progress-row">
              <span>نشاط الأطفال</span>
              <span>{userStats?.level ? `${userStats.level * 10}%` : '60%'}</span>
            </div>
            <div className="parents-progress">
              <div
                className="parents-progress-bar"
                style={{
                  width: `${Math.min(100, (userStats?.level || 6) * 10)}%`,
                  background: 'linear-gradient(90deg,#3ba2f8,#1d6ed8)',
                }}
              />
            </div>
          </div>
        </section>

        {/* Requests */}
        <section className="parents-card" style={{ animationDelay: '140ms' }}>
          <h3 className="parents-title">📨 Requests</h3>
          <div className="parents-list">
            {requests.map((r) => (
              <div key={r.id} className="parents-list-item">
                <span>{r.title}</span>
                <span
                  className={`parents-chip ${r.status === 'قيد المراجعة' ? 'parents-chip--warn' : 'parents-chip--ok'}`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Verification State */}
        <section className="parents-card" style={{ animationDelay: '190ms' }}>
          <h3 className="parents-title">✅ Verification State</h3>

          <div style={{ marginBottom: 10 }}>
            <span className="parents-chip parents-chip--ok">
              الحالة: {verification.state}
            </span>
          </div>

          <div className="parents-progress-wrap">
            <div className="parents-progress-row">
              <span>نسبة التحقق</span>
              <span>{verification.score}%</span>
            </div>
            <div className="parents-progress">
              <div
                className="parents-progress-bar"
                style={{
                  width: `${verification.score}%`,
                  background: 'linear-gradient(90deg,#22c55e,#16a34a)',
                }}
              />
            </div>
          </div>

          <div className="parents-list" style={{ marginTop: 12 }}>
            <div className="parents-list-item"><span>المستندات المكتملة</span><span>{verification.docs}</span></div>
            <div className="parents-list-item"><span>مستندات مطلوبة</span><span>{verification.pendingDocs}</span></div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ParentsTab;
