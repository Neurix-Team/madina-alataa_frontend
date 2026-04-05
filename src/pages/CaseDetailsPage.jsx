import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function CaseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', padding: 24, direction: 'rtl' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <button
          onClick={() => navigate('/cases')}
          style={{
            border: '1px solid #93c5fd',
            background: '#eff6ff',
            color: '#1e3a8a',
            borderRadius: 10,
            padding: '8px 12px',
            fontWeight: 800,
            cursor: 'pointer',
            marginBottom: 14,
            fontFamily: "'Cairo', sans-serif",
          }}
        >
          ← العودة إلى الحالات
        </button>

        <div style={{
          background: '#fff',
          borderRadius: 18,
          padding: 20,
          boxShadow: '0 12px 30px rgba(15,23,42,0.1)',
          border: '1px solid #e2e8f0',
        }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: '#0f172a' }}>📄 Case Details</h1>
          <p style={{ marginTop: 10, color: '#475569', fontSize: 16, fontWeight: 700 }}>
            تفاصيل الحالة رقم: <span style={{ color: '#1d4ed8' }}>{id}</span>
          </p>

          <div style={{ marginTop: 18, color: '#334155', fontSize: 15, lineHeight: 1.9, fontWeight: 700 }}>
            هذه صفحة تفاصيل الحالة. يمكن لاحقًا ربطها ببيانات API لعرض الاسم، المدينة، الاستعجال،
            المبلغ المطلوب، التحديثات، والمستندات الداعمة.
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/donate/${id}`)}
              style={{
                border: 'none',
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                color: '#fff',
                borderRadius: 12,
                padding: '10px 14px',
                fontWeight: 900,
                cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              💚 تبرع لهذه الحالة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
