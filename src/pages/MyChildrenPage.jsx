import React from 'react';
import { useNavigate } from 'react-router-dom';

const childrenData = [
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

  .children-wrap {
    direction: rtl;
    display: grid;
    gap: 14px;
    animation: parentsFadeUp .45s ease both;
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
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
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

  @keyframes analyticsPulse {
    0%, 100% { box-shadow: 0 10px 20px rgba(2,8,23,.14); }
    50% { box-shadow: 0 14px 30px rgba(37,99,235,.25); }
  }

  @keyframes emojiFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: .25; }
    50% { transform: translateY(-11px) rotate(7deg); opacity: .55; }
  }

  @media (max-width: 900px) {
    .children-grid {
      grid-template-columns: 1fr;
    }
    .children-analytics {
      grid-template-columns: 1fr;
    }
  }
`;

export default function MyChildrenPage() {
  const navigate = useNavigate();

  return (
    <div className="children-wrap">
      <style>{CSS}</style>

      <div
        className="children-card"
        style={{
          background: 'linear-gradient(135deg, rgba(29,110,216,.16), rgba(14,165,233,.1))',
          borderColor: 'rgba(29,110,216,.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span style={{ position: 'absolute', top: 10, left: 12, fontSize: 22, animation: 'emojiFloat 4.2s ease-in-out infinite' }}>👶</span>
        <span style={{ position: 'absolute', top: 46, right: 16, fontSize: 18, animation: 'emojiFloat 5s ease-in-out infinite' }}>💙</span>
        <span style={{ position: 'absolute', bottom: 14, left: 90, fontSize: 18, animation: 'emojiFloat 4.6s ease-in-out infinite' }}>✨</span>
        <h2 className="children-title">👶 My Children</h2>
        <div
          className="children-muted"
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
          متابعة بيانات كل طفل، حالة الطلب، ونسبة التمويل بنفس تجربة واجهة أولياء الأمور.
        </div>
        <button
          type="button"
          name="button"
          onClick={() => navigate('/parents')}
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
          الرجوع إلى صفحة الآباء
        </button>
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
          <section
            key={child.id}
            className="children-card"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <h3 className="children-title">🧒 {child.name}</h3>

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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                }}
              >
                <span>نسبة التمويل</span>
                <span style={{ color: statusColor(child.requestStatus) }}>{child.fundingPercent}%</span>
              </div>
              <div className="children-progress">
                <div
                  className="children-progress-bar"
                  style={{
                    width: `${child.fundingPercent}%`,
                    background: 'linear-gradient(90deg,#3ba2f8,#1d6ed8)',
                  }}
                />
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
