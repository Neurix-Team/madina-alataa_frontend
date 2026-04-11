import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaHandsHelping, FaStar, FaClipboardList } from 'react-icons/fa';
import CasesFilter from '../../components/cases/CasesFilter/CasesFilter';
import CaseCard from '../../components/cases/CaseCard/CaseCard';
import RocketBackground from '../../components/common/RocketBackground';
import CanvasBackground from '../../components/common/CanvasBackground';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../utils/permissions';
import { getAvatarImageUrl } from '../../utils/avatarProfile';
import { api } from '../../services/api.js';

const CASES_DATA = [
  {
    id: 'c1',
    title: 'دعم علاجي لعائلة أحمد',
    category: 'medical',
    categoryLabel: 'طبية',
    categoryIcon: '🏥',
    city: 'القاهرة',
    urgency: 'very_urgent',
    urgencyLabel: 'عاجل جداً',
    targetAmount: 10000,
    fundedAmount: 6500,
    fundedPercentage: 65,
    updates: 0,
    totalUpdates: 3,
    updatesLabel: 'تحديثات',
  },
  {
    id: 'c2',
    title: 'مصاريف تعليم ليان',
    category: 'educational',
    categoryLabel: 'تعليمية',
    categoryIcon: '🎓',
    city: 'الجيزة',
    urgency: 'urgent',
    urgencyLabel: 'عاجل',
    targetAmount: 20000,
    fundedAmount: 8000,
    fundedPercentage: 40,
    updates: 1,
    totalUpdates: 3,
    updatesLabel: 'مراحل',
  },
  {
    id: 'c3',
    title: 'ترميم منزل أسرة متضررة',
    category: 'housing',
    categoryLabel: 'سكن',
    categoryIcon: '🏠',
    city: 'الإسكندرية',
    urgency: 'not_urgent',
    urgencyLabel: 'غير عاجل',
    targetAmount: 30000,
    fundedAmount: 15000,
    fundedPercentage: 50,
    updates: 0,
    totalUpdates: 2,
    updatesLabel: 'مراحل',
  },
  {
    id: 'c4',
    title: 'عملية جراحية لطفل',
    category: 'medical',
    categoryLabel: 'طبية',
    categoryIcon: '❤️',
    city: 'المنصورة',
    urgency: 'very_urgent',
    urgencyLabel: 'عاجل جداً',
    targetAmount: 50000,
    fundedAmount: 35000,
    fundedPercentage: 70,
    updates: 2,
    totalUpdates: 4,
    updatesLabel: 'تحديثات',
  },
];

export default function CasesPage() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeUrgency, setActiveUrgency] = useState([]);
  const [activeCategory, setActiveCategory] = useState([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [fundedRange, setFundedRange] = useState([0, 100]);

  useEffect(() => {
    let isMounted = true;

    api.getCases()
      .then((data) => {
        if (!isMounted) return;
        console.log('Cases API response:', data);
        setCases(data);
      })
      .catch((err) => {
        console.error('Failed to load cases:', err);
        if (isMounted) setError(err.message || 'فشل في تحميل الحالات');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const casesSource = cases.length > 0 ? cases : CASES_DATA;

  const filteredCases = useMemo(() => {
    return casesSource.filter((caseItem) => {
      const urgencyOk = activeUrgency.length === 0 || activeUrgency.includes(caseItem.urgency);
      const categoryOk = activeCategory.length === 0 || activeCategory.includes(caseItem.category);
      const locationOk = !locationSearch.trim() || caseItem.city.toLowerCase().includes(locationSearch.trim().toLowerCase());
      const fundedOk = caseItem.fundedPercentage >= fundedRange[0] && caseItem.fundedPercentage <= fundedRange[1];
      return urgencyOk && categoryOk && locationOk && fundedOk;
    });
  }, [casesSource, activeUrgency, activeCategory, locationSearch, fundedRange]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    navigate('/auth');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 50 }}>جاري تحميل الحالات...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: 50, color: '#f87171' }}>خطأ في التحميل: {error}</div>;
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <CanvasBackground />
      <RocketBackground />

      <style>{`
        @keyframes casesTitleDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes casesFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes caseCardEnter {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes emojiFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: .22; }
          50% { transform: translateY(-12px) rotate(6deg); opacity: .5; }
        }

        .cases-layout {
          direction: rtl;
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 14px;
          align-items: start;
          position: relative;
          z-index: 2;
        }

        .cases-sidebar {
          position: sticky;
          top: 0;
          min-height: 100vh;
          background: linear-gradient(180deg, #060f1e 0%, #0a1a30 20%, #0d2040 50%, #0f2744 75%, #122d52 100%);
          border: 1px solid rgba(29,110,216,0.22);
          border-radius: 24px;
          padding: 20px 12px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(29,110,216,0.15), inset 0 1px 0 rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow: hidden;
        }

        .cases-sidebar-logo {
          text-align: center;
          margin-bottom: 8px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(29,110,216,0.2);
          color: #fff;
          font-weight: 900;
        }

        .cases-sidebar-title {
          margin: 4px 0 0;
          font-size: 16px;
          font-weight: 900;
          color: #fff;
        }

        .cases-sidebar-subtitle {
          font-size: 10px;
          color: rgba(14,165,233,0.8);
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .cases-user-card {
          background: linear-gradient(135deg, rgba(29,110,216,0.22) 0%, rgba(14,165,233,0.12) 100%);
          border-radius: 18px;
          padding: 12px;
          border: 1px solid rgba(29,110,216,0.3);
          box-shadow: 0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .cases-sidebar-avatar {
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

        .cases-user-meta {
          text-align: center;
          color: #fff;
          font-weight: 800;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .cases-xp-wrap {
          margin-bottom: 8px;
        }

        .cases-xp-bar {
          height: 7px;
          background: rgba(0,0,0,0.3);
          border-radius: 99px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }

        .cases-xp-fill {
          height: 100%;
          width: 68%;
          background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fde68a 100%);
          border-radius: 99px;
        }

        .cases-kp {
          background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08));
          border: 1px solid rgba(251,191,36,0.3);
          border-radius: 12px;
          padding: 6px 10px;
          text-align: center;
          font-size: 12px;
          font-weight: 900;
          color: #fbbf24;
        }

        .cases-sidebar-list {
          display: grid;
          gap: 8px;
          margin-top: 2px;
        }

        .cases-side-btn {
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

        .cases-side-btn:hover {
          color: #fff;
          border-color: rgba(29,110,216,0.25);
          transform: translateX(-4px);
          background: linear-gradient(135deg, rgba(29,110,216,0.25) 0%, rgba(14,165,233,0.12) 100%);
        }

        .cases-side-btn--primary {
          background: linear-gradient(135deg, rgba(29,110,216,0.55) 0%, rgba(14,165,233,0.35) 100%);
          border-color: rgba(14,165,233,0.4);
          color: #fff;
        }

        .cases-side-btn--danger {
          background: linear-gradient(135deg,#dc2626,#ef4444);
          border-color: #dc2626;
          color: #fff;
          margin-top: 6px;
        }

        .cases-content {
          direction: rtl;
        }

        @media (max-width: 900px) {
          .cases-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="cases-layout">
        <aside className="cases-sidebar">
          <div className="cases-sidebar-logo">
            <div style={{ fontSize: 30, filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.5))' }}><FaStar /></div>
            <div className="cases-sidebar-title">بطل العطاء</div>
            <div className="cases-sidebar-subtitle">Madina Al-Ataa</div>
          </div>

          <div className="cases-user-card">
            <img
              className="cases-sidebar-avatar"
              src={getAvatarImageUrl()}
              alt="Profile avatar"
              onClick={() => navigate('/profile-v2')}
              title="الذهاب إلى صفحة البروفايل"
            />
            <div className="cases-user-meta">مستخدم المنصة • المستوى 6</div>
            <div className="cases-xp-wrap">
              <div className="cases-xp-bar">
                <div className="cases-xp-fill" />
              </div>
            </div>
            <div className="cases-kp">1,250 نقطة خير</div>
          </div>

          <div className="cases-sidebar-list">
            {can(PERMISSIONS.VIEW_MY_DONATIONS) && <button className="cases-side-btn cases-side-btn--primary" onClick={() => navigate('/my-donations')}>تبرعاتي</button>}
            <button className="cases-side-btn" onClick={() => navigate('/map')}>الرجوع للرئيسية</button>
            <button className="cases-side-btn" onClick={() => navigate('/profile-v2')}>البروفايل</button>
            <button className="cases-side-btn cases-side-btn--danger" onClick={handleLogout}>تسجيل الخروج</button>
          </div>
        </aside>

        <div className="cases-content">
          <section
            style={{
              borderRadius: 24,
              padding: 18,
              marginBottom: 16,
              background: 'linear-gradient(130deg,#0b2545 0%, #0f172a 40%, #1d4ed8 100%)',
              boxShadow: '0 16px 34px rgba(15, 23, 42, 0.35)',
              border: '1px solid rgba(148, 163, 184, 0.28)',
              animation: 'casesTitleDown 380ms ease-out both',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <span style={{ position: 'absolute', top: 10, left: 14, fontSize: 24, animation: 'emojiFloat 4s ease-in-out infinite' }}><FaHeart /></span>
            <span style={{ position: 'absolute', top: 44, right: 20, fontSize: 22, animation: 'emojiFloat 5s ease-in-out infinite' }}><FaHandsHelping /></span>
            <span style={{ position: 'absolute', bottom: 12, left: 80, fontSize: 20, animation: 'emojiFloat 4.4s ease-in-out infinite' }}><FaStar /></span>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 30, fontWeight: 900, position: 'relative', zIndex: 1 }}><FaClipboardList style={{ marginLeft: 8 }} />الحالات</h1>
            <p style={{ margin: '6px 0 0', color: '#dbeafe', fontSize: 14, fontWeight: 700 }}>
              تصفح الحالات وساهم في تغيير حياة الأسر المحتاجة
            </p>
          </section>

          <div style={{ marginBottom: 14 }}>
            <CasesFilter
              activeUrgency={activeUrgency}
              setActiveUrgency={setActiveUrgency}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              locationSearch={locationSearch}
              setLocationSearch={setLocationSearch}
              fundedRange={fundedRange}
              setFundedRange={setFundedRange}
            />
          </div>

          <section style={{ display: 'grid', gap: 12 }}>
            {filteredCases.length > 0 ? (
              filteredCases.map((caseItem, index) => (
                <CaseCard key={caseItem.id} caseItem={caseItem} index={index} />
              ))
            ) : (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 18,
                  padding: 18,
                  color: '#334155',
                  fontWeight: 800,
                  textAlign: 'center',
                }}
              >
                لا توجد حالات مطابقة للفلاتر الحالية.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
