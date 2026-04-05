import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const PRESET_AMOUNTS = [100, 250, 500, 1000];
const money = (n) => new Intl.NumberFormat('en-US').format(n);

export default function DonationCheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: amount/type, 2: confirmation, 3: success
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState('one_time');

  const finalAmount = useMemo(() => {
    const custom = Number(customAmount);
    if (!Number.isNaN(custom) && custom > 0) return custom;
    return selectedAmount;
  }, [customAmount, selectedAmount]);

  const isValidAmount = finalAmount >= 10;

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
        @keyframes checkoutIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes successPop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes ringPulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
          70% { box-shadow: 0 0 0 18px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>

      <div style={{ maxWidth: 920, margin: '0 auto', animation: 'checkoutIn 420ms ease-out both' }}>
        <button
          onClick={() => navigate(`/cases/${id}`)}
          style={{
            border: '1px solid rgba(125,211,252,0.8)',
            background: 'rgba(239,246,255,0.95)',
            color: '#0c4a6e',
            borderRadius: 12,
            padding: '8px 12px',
            fontWeight: 900,
            cursor: 'pointer',
            marginBottom: 14,
            fontFamily: "'Cairo', sans-serif",
          }}
        >
          ← العودة لتفاصيل الحالة
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
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, color: '#0f172a' }}>💳 Checkout التبرع</h1>
          <p style={{ margin: '8px 0 0', color: '#475569', fontWeight: 700 }}>
            الحالة رقم: <span style={{ color: '#16a34a', fontWeight: 900 }}>{id}</span>
          </p>

          {/* Steps indicator */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {['اختيار التبرع', 'التأكيد', 'تم بنجاح'].map((s, i) => {
              const n = i + 1;
              const active = step === n;
              const done = step > n;
              return (
                <div
                  key={s}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 999,
                    border: `1.5px solid ${active || done ? '#22c55e' : '#cbd5e1'}`,
                    background: active ? '#22c55e' : done ? '#dcfce7' : '#f8fafc',
                    color: active ? '#fff' : '#0f172a',
                    fontWeight: 900,
                    fontSize: 13,
                  }}
                >
                  {done ? '✅ ' : ''}{s}
                </div>
              );
            })}
          </div>

          {step === 1 && (
            <div style={{ marginTop: 18 }}>
              <Section title="اختيار المبلغ" icon="💰">
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                  {PRESET_AMOUNTS.map((amount) => {
                    const active = !customAmount && selectedAmount === amount;
                    return (
                      <button
                        key={amount}
                        onClick={() => {
                          setCustomAmount('');
                          setSelectedAmount(amount);
                        }}
                        style={{
                          border: `1.5px solid ${active ? '#16a34a' : '#94a3b8'}`,
                          background: active ? '#16a34a' : '#fff',
                          color: active ? '#fff' : '#0f172a',
                          borderRadius: 12,
                          padding: '8px 12px',
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {money(amount)} EGP
                      </button>
                    );
                  })}
                </div>

                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: '#334155', fontWeight: 800 }}>أو أدخل مبلغ مخصص</span>
                  <input
                    type="number"
                    min={10}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="مثال: 750"
                    style={{
                      border: '1.5px solid #cbd5e1',
                      borderRadius: 12,
                      padding: '10px 12px',
                      fontSize: 14,
                      fontWeight: 700,
                      fontFamily: "'Cairo', sans-serif",
                      outline: 'none',
                    }}
                  />
                </label>
              </Section>

              <Section title="نوع التبرع" icon="🔁">
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <TypeButton
                    active={donationType === 'one_time'}
                    onClick={() => setDonationType('one_time')}
                    title="One-time"
                    subtitle="تبرع مرة واحدة"
                  />
                  <TypeButton
                    active={donationType === 'recurring'}
                    onClick={() => setDonationType('recurring')}
                    title="Recurring"
                    subtitle="تبرع دوري شهري"
                  />
                </div>
              </Section>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/cases')}
                  style={secondaryBtn}
                >
                  الحالات
                </button>
                <button
                  onClick={() => isValidAmount && setStep(2)}
                  disabled={!isValidAmount}
                  style={{
                    ...primaryBtn,
                    opacity: isValidAmount ? 1 : 0.55,
                    cursor: isValidAmount ? 'pointer' : 'not-allowed',
                  }}
                >
                  متابعة للتأكيد
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ marginTop: 18 }}>
              <Section title="تأكيد العملية" icon="✅">
                <div style={{ display: 'grid', gap: 8 }}>
                  <ConfirmRow label="رقم الحالة" value={id} />
                  <ConfirmRow label="المبلغ" value={`${money(finalAmount)} EGP`} />
                  <ConfirmRow
                    label="نوع التبرع"
                    value={donationType === 'one_time' ? 'One-time (مرة واحدة)' : 'Recurring (شهري)'}
                  />
                  <ConfirmRow label="رسوم المنصة" value="0 EGP" />
                </div>
              </Section>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => setStep(1)} style={secondaryBtn}>تعديل</button>
                <button onClick={() => setStep(3)} style={primaryBtn}>تأكيد الدفع</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ marginTop: 22, textAlign: 'center' }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  margin: '0 auto 12px',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 44,
                  background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                  color: '#fff',
                  animation: 'successPop 500ms ease-out both, ringPulse 1.8s infinite',
                }}
              >
                ✓
              </div>
              <h2 style={{ margin: 0, color: '#166534', fontSize: 28, fontWeight: 900 }}>تم التبرع بنجاح</h2>
              <p style={{ margin: '8px 0 0', color: '#334155', fontWeight: 700 }}>
                شكراً لدعمك 💚 — تم تسجيل تبرع بقيمة {money(finalAmount)} EGP
                {donationType === 'recurring' ? ' (شهرياً)' : ''}.
              </p>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/cases')} style={secondaryBtn}>العودة للحالات</button>
                <button onClick={() => navigate(`/cases/${id}`)} style={primaryBtn}>العودة لتفاصيل الحالة</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <section
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        background: '#f8fafc',
        padding: 14,
        marginBottom: 12,
      }}
    >
      <h3 style={{ margin: '0 0 10px', color: '#0f172a', fontSize: 18, fontWeight: 900 }}>
        {icon} {title}
      </h3>
      {children}
    </section>
  );
}

function TypeButton({ active, onClick, title, subtitle }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 1 220px',
        border: `1.5px solid ${active ? '#1d4ed8' : '#cbd5e1'}`,
        borderRadius: 12,
        padding: 12,
        textAlign: 'right',
        background: active ? 'linear-gradient(135deg,#dbeafe,#bfdbfe)' : '#fff',
        cursor: 'pointer',
      }}
    >
      <div style={{ color: '#0f172a', fontSize: 15, fontWeight: 900 }}>{title}</div>
      <div style={{ color: '#475569', fontSize: 13, fontWeight: 700 }}>{subtitle}</div>
    </button>
  );
}

function ConfirmRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, borderBottom: '1px dashed #cbd5e1', paddingBottom: 6 }}>
      <span style={{ color: '#64748b', fontWeight: 800 }}>{label}</span>
      <span style={{ color: '#0f172a', fontWeight: 900 }}>{value}</span>
    </div>
  );
}

const primaryBtn = {
  border: 'none',
  background: 'linear-gradient(135deg,#22c55e,#16a34a)',
  color: '#fff',
  borderRadius: 12,
  padding: '10px 14px',
  fontWeight: 900,
  cursor: 'pointer',
  fontFamily: "'Cairo', sans-serif",
  boxShadow: '0 10px 22px rgba(22,163,74,0.32)',
};

const secondaryBtn = {
  border: '1.5px solid #93c5fd',
  background: '#eff6ff',
  color: '#1e3a8a',
  borderRadius: 12,
  padding: '10px 14px',
  fontWeight: 900,
  cursor: 'pointer',
  fontFamily: "'Cairo', sans-serif",
};
