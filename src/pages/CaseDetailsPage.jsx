import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CASES_DETAILS = {
  c1: {
    id: 'c1',
    title: 'دعم علاجي لعائلة أحمد',
    type: 'طبية',
    urgency: 'عاجل جداً',
    urgencyColor: '#ef4444',
    city: 'القاهرة',
    hospital: 'مستشفى القصر العيني',
    targetAmount: 10000,
    fundedAmount: 6500,
    description:
      'الحالة تحتاج إلى جلسات علاج منتظمة وتغطية أدوية شهرية. الأسرة تمر بظروف صعبة ولا تملك مصدر دخل ثابت في الفترة الحالية.',
    verification: [
      { label: 'بطاقة الرقم القومي', status: 'موثق' },
      { label: 'تقرير طبي حديث', status: 'موثق' },
      { label: 'إثبات دخل الأسرة', status: 'قيد المراجعة' },
    ],
    updates: [
      'تم رفع التقرير الطبي واعتماده من الفريق الطبي.',
      'تم سداد جزء من جلسات العلاج الأولية.',
      'بانتظار استكمال التمويل لباقي الخطة العلاجية.',
    ],
  },
  c2: {
    id: 'c2',
    title: 'مصاريف تعليم ليان',
    type: 'تعليمية',
    urgency: 'عاجل',
    urgencyColor: '#f97316',
    city: 'الجيزة',
    hospital: 'مدرسة النور الخاصة',
    targetAmount: 20000,
    fundedAmount: 8000,
    description:
      'تغطية الرسوم الدراسية والكتب والمواصلات للعام الدراسي الحالي لضمان استمرار ليان في التعليم بدون انقطاع.',
    verification: [
      { label: 'إفادة المدرسة', status: 'موثق' },
      { label: 'فاتورة المصروفات', status: 'موثق' },
      { label: 'بحث اجتماعي', status: 'موثق' },
    ],
    updates: [
      'تم تأكيد القبول الدراسي للطالب.',
      'تم تمويل جزء من المصروفات الدراسية.',
    ],
  },
};

const FALLBACK_CASE = {
  id: 'unknown',
  title: 'حالة إنسانية',
  type: 'أخرى',
  urgency: 'غير عاجل',
  urgencyColor: '#65a30d',
  city: 'غير محدد',
  hospital: 'غير محدد',
  targetAmount: 15000,
  fundedAmount: 3000,
  description: 'لا توجد تفاصيل كافية لهذه الحالة حالياً، يرجى العودة لاحقاً بعد اكتمال التحقق.',
  verification: [{ label: 'بيانات الحالة', status: 'قيد المراجعة' }],
  updates: ['تم إنشاء الحالة وجاري إضافة التفاصيل.'],
};

const money = (n) => new Intl.NumberFormat('en-US').format(n);

export default function CaseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fill, setFill] = useState(0);

  const caseData = useMemo(() => CASES_DETAILS[id] || { ...FALLBACK_CASE, id }, [id]);
  const progress = Math.round((caseData.fundedAmount / caseData.targetAmount) * 100);

  useEffect(() => {
    const t = setTimeout(() => setFill(progress), 180);
    return () => clearTimeout(t);
  }, [progress]);

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 24,
        direction: 'rtl',
        background: 'linear-gradient(145deg,#0b2545 0%, #0f172a 45%, #1d4ed8 100%)',
      }}
    >
      <style>{`
        @keyframes detailsIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes donatePulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
          70% { box-shadow: 0 0 0 16px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>

      <div style={{ maxWidth: 1060, margin: '0 auto', animation: 'detailsIn 420ms ease-out both' }}>
        <button
          onClick={() => navigate('/cases')}
          style={{
            border: '1px solid rgba(125,211,252,0.75)',
            background: 'rgba(239,246,255,0.95)',
            color: '#0c4a6e',
            borderRadius: 12,
            padding: '9px 13px',
            fontWeight: 900,
            cursor: 'pointer',
            marginBottom: 14,
            fontFamily: "'Cairo', sans-serif",
          }}
        >
          ← العودة إلى الحالات
        </button>

        <section
          style={{
            background: '#ffffff',
            borderRadius: 24,
            padding: 22,
            boxShadow: '0 16px 34px rgba(2,6,23,0.22)',
            border: '1px solid rgba(148,163,184,0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: '#0f172a' }}>📄 {caseData.title}</h1>
              <p style={{ margin: '8px 0 0', color: '#475569', fontWeight: 800 }}>
                {caseData.type} - {caseData.city}
              </p>
            </div>
            <span
              style={{
                background: caseData.urgencyColor,
                color: '#fff',
                borderRadius: 999,
                padding: '7px 12px',
                fontWeight: 900,
                fontSize: 13,
              }}
            >
              {caseData.urgency}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 12, marginTop: 18 }}>
            <InfoCard label="نوع الحالة" value={caseData.type} icon="🧾" />
            <InfoCard label="المكان / المستشفى" value={`${caseData.city} - ${caseData.hospital}`} icon="📍" />
            <InfoCard label="المبلغ المستهدف" value={`${money(caseData.targetAmount)} EGP`} icon="🎯" />
            <InfoCard label="المبلغ الممول" value={`${money(caseData.fundedAmount)} EGP`} icon="💰" />
          </div>

          <Block title="الوصف" icon="📝">
            <p style={{ margin: 0, color: '#334155', fontSize: 15, lineHeight: 1.95, fontWeight: 700 }}>
              {caseData.description}
            </p>
          </Block>

          <Block title="نسبة التمويل" icon="📊">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong style={{ color: '#0f172a' }}>{progress}%</strong>
              <span style={{ color: '#334155', fontWeight: 700 }}>
                {money(caseData.fundedAmount)} / {money(caseData.targetAmount)} EGP
              </span>
            </div>
            <div style={{ height: 14, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${fill}%`,
                  transition: 'width 1.2s ease-out',
                  background: 'linear-gradient(90deg,#2563eb 0%, #22c55e 100%)',
                  borderRadius: 999,
                }}
              />
            </div>
          </Block>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12 }}>
            <Block title="المستندات / التحقق" icon="✅">
              <div style={{ display: 'grid', gap: 8 }}>
                {caseData.verification.map((doc, i) => (
                  <div
                    key={`${doc.label}-${i}`}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: '8px 10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span style={{ color: '#1e293b', fontWeight: 800 }}>{doc.label}</span>
                    <span
                      style={{
                        background: doc.status === 'موثق' ? '#dcfce7' : '#fef9c3',
                        color: doc.status === 'موثق' ? '#166534' : '#854d0e',
                        borderRadius: 999,
                        padding: '3px 8px',
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </Block>

            <Block title="Updates" icon="🔔">
              <ul style={{ margin: 0, paddingInlineStart: 18, display: 'grid', gap: 8 }}>
                {caseData.updates.map((u, i) => (
                  <li key={`${u}-${i}`} style={{ color: '#334155', fontWeight: 700, lineHeight: 1.75 }}>
                    {u}
                  </li>
                ))}
              </ul>
            </Block>
          </div>

          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-start' }}>
            <button
              onClick={() => navigate(`/donate/${caseData.id}`)}
              style={{
                border: 'none',
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                color: '#fff',
                borderRadius: 14,
                padding: '12px 18px',
                fontWeight: 900,
                fontSize: 16,
                cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
                animation: 'donatePulse 1.8s infinite',
                transition: 'transform 0.2s ease',
                boxShadow: '0 12px 24px rgba(22,163,74,0.35)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
            >
              💚 تبرع الآن
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div
      style={{
        background: '#f8fafc',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        padding: '10px 12px',
      }}
    >
      <div style={{ color: '#64748b', fontSize: 12, fontWeight: 800, marginBottom: 5 }}>
        {icon} {label}
      </div>
      <div style={{ color: '#0f172a', fontWeight: 900, fontSize: 14 }}>{value}</div>
    </div>
  );
}

function Block({ title, icon, children }) {
  return (
    <section
      style={{
        marginTop: 14,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: 14,
      }}
    >
      <h3 style={{ margin: '0 0 10px', color: '#0f172a', fontSize: 17, fontWeight: 900 }}>
        {icon} {title}
      </h3>
      {children}
    </section>
  );
}
