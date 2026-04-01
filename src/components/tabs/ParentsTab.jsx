// src/components/tabs/ParentsTab.jsx
import React from 'react';

const ProgressBar = ({ label, rightLabel, value, color }) => (
  <div style={{ marginBottom:14 }}>
    <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:13, color:'var(--text-primary)', marginBottom:5 }}>
      <span>{label}</span><span>{rightLabel}</span>
    </div>
    <div style={{ height:9, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${value}%`, background:color, borderRadius:99, transition:'width 1s ease-out' }} />
    </div>
  </div>
);

const ActivityItem = ({ emoji, title, time }) => (
  <div style={{ display:'flex', alignItems:'center', gap:12, padding:12, background:'var(--bg-card-2)', borderRadius:14, border:'1px solid var(--border)' }}>
    <span style={{ fontSize:22, flexShrink:0 }}>{emoji}</span>
    <div>
      <div style={{ fontWeight:900, fontSize:13, color:'var(--text-primary)' }}>{title}</div>
      <div style={{ fontSize:11, color:'var(--text-secondary)' }}>{time}</div>
    </div>
  </div>
);

const CSS = `
  .parents-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  @media (max-width: 600px) {
    .parents-grid { grid-template-columns: 1fr; }
  }
`;

const ParentsTab = ({ userStats }) => (
  <div>
    <style>{CSS}</style>

    <div style={{ background:'var(--bg-card)', borderRadius:22, padding:'18px 24px', marginBottom:18, boxShadow:'var(--shadow-md)', textAlign:'center', direction:'rtl', border:'1.5px solid var(--border)' }}>
      <h2 style={{ fontSize:24, fontWeight:900, color:'var(--text-primary)', marginBottom:4 }}>🛡️ بوابة الآباء</h2>
      <p style={{ color:'var(--text-secondary)', fontSize:13, fontWeight:600 }}>تابع نشاط طفلك وتقدمه</p>
    </div>

    {/* Streak + summary cards */}
    <div className="parents-grid">
      <div style={{ background:'linear-gradient(135deg,#fbbf24,#f59e0b)', borderRadius:20, padding:'20px 22px', direction:'rtl', color:'#fff' }}>
        <div style={{ fontSize:32, marginBottom:4 }}>🔥</div>
        <div style={{ fontSize:28, fontWeight:900 }}>7 أيام</div>
        <div style={{ fontSize:12, fontWeight:700, opacity:0.85 }}>سلسلة التطوع الحالية</div>
      </div>
      <div style={{ background:'linear-gradient(135deg,#3ba2f8,#1d6ed8)', borderRadius:20, padding:'20px 22px', direction:'rtl', color:'#fff' }}>
        <div style={{ fontSize:32, marginBottom:4 }}>⭐</div>
        <div style={{ fontSize:28, fontWeight:900 }}>{userStats.kp.toLocaleString()}</div>
        <div style={{ fontSize:12, fontWeight:700, opacity:0.85 }}>إجمالي نقاط العطاء</div>
      </div>
    </div>

    {/* Progress */}
    <div style={{ background:'var(--bg-card)', borderRadius:20, padding:'22px 24px', marginBottom:16, boxShadow:'var(--shadow-sm)', border:'1.5px solid var(--border)', direction:'rtl' }}>
      <h3 style={{ fontSize:17, fontWeight:900, color:'var(--text-primary)', marginBottom:14 }}>📈 إحصائيات الأسبوع</h3>
      <ProgressBar label="المهام المكتملة"     rightLabel="12 / 15"          value={80} color="linear-gradient(90deg,#3ba2f8,#1d6ed8)" />
      <ProgressBar label="وقت اللعب"           rightLabel="4.5 ساعة"          value={60} color="linear-gradient(90deg,#4ade80,#16a34a)" />
      <ProgressBar label="نقاط العطاء المكسبة" rightLabel={`${userStats.kp} KP`} value={74} color="linear-gradient(90deg,#fbbf24,#f59e0b)" />
    </div>

    {/* Activity log */}
    <div style={{ background:'var(--bg-card)', borderRadius:20, padding:'22px 24px', boxShadow:'var(--shadow-sm)', border:'1.5px solid var(--border)', direction:'rtl' }}>
      <h3 style={{ fontSize:17, fontWeight:900, color:'var(--text-primary)', marginBottom:14 }}>✅ آخر الإنجازات</h3>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <ActivityItem emoji="🏆" title='أكمل مهمة "رسالة من حفيد"'      time="منذ ساعتين" />
        <ActivityItem emoji="⬆️" title={`ارتقى إلى المستوى ${userStats.level}`} time="أمس" />
        <ActivityItem emoji="🌟" title='حصل على وسام "قلب الذهب"'        time="منذ يومين" />
        <ActivityItem emoji="🔥" title="حقق 7 أيام متواصلة من التطوع"      time="اليوم" />
      </div>
    </div>
  </div>
);

export default ParentsTab;
