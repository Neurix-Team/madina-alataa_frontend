import React, { useMemo, useState } from 'react';
import CasesFilter from '../../components/cases/CasesFilter/CasesFilter';
import CaseCard from '../../components/cases/CaseCard/CaseCard';

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
  const [activeUrgency, setActiveUrgency] = useState([]);
  const [activeCategory, setActiveCategory] = useState([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [fundedRange, setFundedRange] = useState([0, 100]);

  const filteredCases = useMemo(() => {
    return CASES_DATA.filter((caseItem) => {
      const urgencyOk = activeUrgency.length === 0 || activeUrgency.includes(caseItem.urgency);
      const categoryOk = activeCategory.length === 0 || activeCategory.includes(caseItem.category);
      const locationOk = !locationSearch.trim() || caseItem.city.toLowerCase().includes(locationSearch.trim().toLowerCase());
      const fundedOk = caseItem.fundedPercentage >= fundedRange[0] && caseItem.fundedPercentage <= fundedRange[1];
      return urgencyOk && categoryOk && locationOk && fundedOk;
    });
  }, [activeUrgency, activeCategory, locationSearch, fundedRange]);

  return (
    <div style={{ direction: 'rtl' }}>
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
      `}</style>

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
        <span style={{ position: 'absolute', top: 10, left: 14, fontSize: 24, animation: 'emojiFloat 4s ease-in-out infinite' }}>💙</span>
        <span style={{ position: 'absolute', top: 44, right: 20, fontSize: 22, animation: 'emojiFloat 5s ease-in-out infinite' }}>🤲</span>
        <span style={{ position: 'absolute', bottom: 12, left: 80, fontSize: 20, animation: 'emojiFloat 4.4s ease-in-out infinite' }}>✨</span>
        <h1 style={{ margin: 0, color: '#fff', fontSize: 30, fontWeight: 900, position: 'relative', zIndex: 1 }}>📋 الحالات</h1>
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
  );
}
