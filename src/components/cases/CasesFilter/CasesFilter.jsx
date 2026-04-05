import React from 'react';
import { FaSearch } from 'react-icons/fa';

const URGENCY_OPTIONS = [
  { value: 'very_urgent', label: 'عاجل جداً', icon: '🔴', color: '#ef4444' },
  { value: 'urgent', label: 'عاجل', icon: '🟠', color: '#f97316' },
  { value: 'not_urgent', label: 'غير عاجل', icon: '🟢', color: '#65a30d' },
];

const CATEGORY_OPTIONS = [
  { value: 'medical', label: 'طبية', icon: '❤️', color: '#ec4899' },
  { value: 'educational', label: 'تعليمية', icon: '🎓', color: '#3b82f6' },
  { value: 'housing', label: 'سكن', icon: '🏠', color: '#8b5cf6' },
  { value: 'other', label: 'أخرى', icon: '📦', color: '#64748b' },
];

function ToggleGroup({ title, options, activeValues, onToggle }) {
  return (
    <div>
      <h4 style={{ margin: '0 0 8px', color: '#cbd5e1', fontSize: 13, fontWeight: 800 }}>{title}</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt) => {
          const active = activeValues.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => onToggle(opt.value)}
              style={{
                borderRadius: 999,
                border: `1.5px solid ${opt.color}`,
                background: active ? opt.color : 'transparent',
                color: '#fff',
                padding: '8px 12px',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
              }}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CasesFilter({
  activeUrgency,
  setActiveUrgency,
  activeCategory,
  setActiveCategory,
  locationSearch,
  setLocationSearch,
  fundedRange,
  setFundedRange,
}) {
  const handleToggle = (value, list, setter) => {
    if (list.includes(value)) setter(list.filter((v) => v !== value));
    else setter([...list, value]);
  };

  return (
    <section
      style={{
        background: 'rgba(15, 23, 42, 0.64)',
        border: '1px solid rgba(148, 163, 184, 0.3)',
        borderRadius: 24,
        padding: 16,
        boxShadow: '0 12px 28px rgba(2, 6, 23, 0.35)',
        backdropFilter: 'blur(10px)',
        animation: 'casesFade 400ms ease-out both',
      }}
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <ToggleGroup
          title="الاستعجال"
          options={URGENCY_OPTIONS}
          activeValues={activeUrgency}
          onToggle={(value) => handleToggle(value, activeUrgency, setActiveUrgency)}
        />

        <ToggleGroup
          title="الفئة"
          options={CATEGORY_OPTIONS}
          activeValues={activeCategory}
          onToggle={(value) => handleToggle(value, activeCategory, setActiveCategory)}
        />

        <div>
          <h4 style={{ margin: '0 0 8px', color: '#cbd5e1', fontSize: 13, fontWeight: 800 }}>الموقع</h4>
          <div style={{ position: 'relative' }}>
            <input
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              placeholder="ابحث عن الموقع (مدينة/منطقة)"
              style={{
                width: '100%',
                borderRadius: 12,
                border: '1.5px solid rgba(148, 163, 184, 0.45)',
                background: 'rgba(255,255,255,0.08)',
                color: '#f8fafc',
                fontFamily: "'Cairo', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                padding: '10px 12px 10px 38px',
                outline: 'none',
              }}
            />
            <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 8px', color: '#cbd5e1', fontSize: 13, fontWeight: 800 }}>نطاق التمويل</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 700 }}>الحد الأدنى %</label>
              <input
                type="range"
                min={0}
                max={100}
                value={fundedRange[0]}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setFundedRange([Math.min(next, fundedRange[1]), fundedRange[1]]);
                }}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 700 }}>الحد الأقصى %</label>
              <input
                type="range"
                min={0}
                max={100}
                value={fundedRange[1]}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setFundedRange([fundedRange[0], Math.max(next, fundedRange[0])]);
                }}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div style={{ marginTop: 8, color: '#f8fafc', fontWeight: 800, fontSize: 13 }}>
            النطاق المحدد: {fundedRange[0]}% - {fundedRange[1]}%  |  0-25% | 25-50% | 50-75% | 75-100%
          </div>
        </div>
      </div>
    </section>
  );
}
