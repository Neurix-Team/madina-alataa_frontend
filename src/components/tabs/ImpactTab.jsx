// src/components/tabs/ImpactTab.jsx
import React from 'react';
import JellyButton from '../common/JellyButton';
import { beneficiariesData } from '../../data/beneficiariesData';
import { useAuth } from '../../hooks/useAuth';
import useGameState from '../../hooks/useGameState';

const CSS = `
  .impact-home-top-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 18px;
    direction: rtl;
  }

  .impact-home-card {
    border-radius: 18px;
    padding: 14px 14px 12px;
    color: #fff;
    min-height: 96px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    position: relative;
    overflow: hidden;
  }

  .impact-home-card::after {
    content: '';
    position: absolute;
    inset: auto -20% -30% auto;
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: rgba(255,255,255,0.12);
  }

  .impact-home-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 11px;
    font-weight: 800;
    opacity: 0.95;
    position: relative;
    z-index: 1;
  }

  .impact-home-card__label {
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 6px;
    position: relative;
    z-index: 1;
  }

  .impact-home-card__value {
    font-size: 30px;
    font-weight: 900;
    line-height: 1;
    position: relative;
    z-index: 1;
    letter-spacing: 0.5px;
  }

  .impact-home-card--blue {
    background: linear-gradient(135deg, #1d4ed8, #2563eb 55%, #3b82f6);
  }

  .impact-home-card--green {
    background: linear-gradient(135deg, #047857, #059669 55%, #10b981);
  }

  .impact-home-card--purple {
    background: linear-gradient(135deg, #6d28d9, #7c3aed 55%, #8b5cf6);
  }

  .impact-home-card--orange {
    background: linear-gradient(135deg, #d97706, #f59e0b 55%, #fbbf24);
  }

  .impact-stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 18px;
  }

  @media (max-width: 900px) {
    .impact-home-top-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 600px) {
    .impact-home-top-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .impact-home-card { min-height: 88px; border-radius: 16px; padding: 10px 10px 9px; }
    .impact-home-card__label { font-size: 11px; margin-bottom: 4px; }
    .impact-home-card__value { font-size: 24px; }
    .impact-stat-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 360px) {
    .impact-stat-grid { grid-template-columns: 1fr; }
  }
`;

const ProgressBar = ({ label, value, count, color }) => (
  <div style={{ marginBottom:14 }}>
    <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:13, color:'var(--text-primary)', marginBottom:5 }}>
      <span>{label}</span><span>{count}</span>
    </div>
    <div style={{ height:9, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${value}%`, background:color, borderRadius:99, transition:'width 1s ease-out' }} />
    </div>
  </div>
);

const ImpactTab = () => {
  const { user } = useAuth();
  const { state } = useGameState();
  const { userStats, completedQuests = new Set() } = state;
  const completedCount = completedQuests.size || 0;
  const helpedCount = Math.floor(userStats?.kp / 50 || 0);
  const levelNow = Math.max(1, Math.floor((userStats?.impactScore || 0) / 100));
  const currentWeekGive = Math.floor((userStats?.kp || 0) / 10);
  const nextLevelTarget = (levelNow + 1) * 100;
  const levelProgress = userStats?.impactScore || 0;

  return (
    <div>
      <style>{CSS}</style>

      <div className="impact-home-top-grid">
        <div className="impact-home-card impact-home-card--blue">
          <div className="impact-home-card__head">
            <span>↗️ تأثير</span>
            <span>إجمالي</span>
          </div>
          <div className="impact-home-card__label">نقاط التأثير</div>
          <div className="impact-home-card__value">{(userStats?.impactScore || 0).toLocaleString()}</div>
        </div>

        <div className="impact-home-card impact-home-card--green">
          <div className="impact-home-card__head">
            <span>✅ إنجاز</span>
            <span>شهري</span>
          </div>
          <div className="impact-home-card__label">المهام المكتملة</div>
          <div className="impact-home-card__value">{completedCount}</div>
        </div>

        <div className="impact-home-card impact-home-card--purple">
          <div className="impact-home-card__head">
            <span>🏅 مستوى</span>
            <span>حالي</span>
          </div>
          <div className="impact-home-card__label">المستوى الحالي</div>
          <div className="impact-home-card__value">{levelNow}</div>
        </div>

        <div className="impact-home-card impact-home-card--orange">
          <div className="impact-home-card__head">
            <span>💛 عطاء</span>
            <span>هذا الأسبوع</span>
          </div>
          <div className="impact-home-card__label">نقاط العطاء</div>
          <div className="impact-home-card__value">{currentWeekGive}</div>
        </div>
      </div>

      <div style={{ background:'var(--bg-card)', borderRadius:22, padding:'18px 24px', marginBottom:18, boxShadow:'var(--shadow-md)', textAlign:'center', direction:'rtl', border:'1.5px solid var(--border)' }}>
        <h2 style={{ fontSize:24, fontWeight:900, color:'var(--text-primary)', marginBottom:4 }}>🌍 التأثير الواقعي</h2>
        <p style={{ color:'var(--text-secondary)', fontSize:13, fontWeight:600 }}>إليك كيف غيّرت حياة الناس من حولك</p>
      </div>

      <div className="impact-stat-grid">
        {[
          { number: completedCount, label:'مهمة مكتملة', color:'#3ba2f8', delay:0   },
          { number: userStats.impactScore, label:'نقطة تأثير',  color:'#10b981', delay:0.1 },
          { number: helpedCount,  label:'شخص ساعدته', color:'#f59e0b', delay:0.2 },
        ].map((card, i) => (
          <div key={i} style={{
            background:'var(--bg-card)', borderRadius:20, padding:'20px 16px',
            textAlign:'center', boxShadow:'var(--shadow-sm)',
            border:'1.5px solid var(--border)',
            animation:'popIn 0.4s ease-out backwards',
            animationDelay:`${card.delay}s`, direction:'rtl',
          }}>
            <div style={{ fontSize:32, fontWeight:900, color:card.color, marginBottom:4 }}>{card.number}</div>
            <div style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:700 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Progress breakdown */}
      <div style={{ background:'var(--bg-card)', borderRadius:20, padding:'22px 24px', boxShadow:'var(--shadow-sm)', border:'1.5px solid var(--border)', direction:'rtl', marginBottom:16 }}>
        <h3 style={{ fontSize:17, fontWeight:900, color:'var(--text-primary)', marginBottom:14 }}>📊 تفاصيل تأثيرك</h3>
        <ProgressBar label="مساعدة المسنين"  count="12 مهمة" value={80} color="linear-gradient(90deg,#f87171,#ef4444)" />
        <ProgressBar label="دعم الأيتام"      count="7 مهام"  value={55} color="linear-gradient(90deg,#c084fc,#a855f7)" />
        <ProgressBar label="خدمة الحي"        count="18 مهمة" value={90} color="linear-gradient(90deg,#38bdf8,#1d6ed8)" />
        <ProgressBar label="العمل البيئي"      count="5 مهام"  value={40} color="linear-gradient(90deg,#4ade80,#16a34a)" />
        <ProgressBar
          label="التقدم نحو المستوى التالي"
          count={`${levelProgress} / ${nextLevelTarget} XP`}
          value={Math.min(100, Math.round((levelProgress / nextLevelTarget) * 100))}
          color="linear-gradient(90deg,#8b5cf6,#6d28d9)"
        />
      </div>

      {/* ── Beneficiaries Impact Section ── */}
      <div style={{ background:'var(--bg-card)', borderRadius:20, padding:'22px 24px', boxShadow:'var(--shadow-sm)', border:'1.5px solid var(--border)', direction:'rtl', marginBottom:16 }}>
        <h3 style={{ fontSize:17, fontWeight:900, color:'var(--text-primary)', marginBottom:4 }}>🏠 المستفيدون من عطائك</h3>
        <p style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:600, marginBottom:14 }}>هؤلاء هم من يستفيدون من مساهماتك في المجتمع</p>

        {beneficiariesData.slice(0, 5).map((ben) => {
          const helped = ben.helpedCount ?? 0;
          const needs  = ben.needsCount  ?? 1;
          const pct    = Math.min(100, Math.round((helped / needs) * 100));
          const urgencyColor = {
            critical: '#b91c1c', high: '#d97706', medium: '#1d4ed8', low: '#15803d',
          }[ben.urgency] ?? '#1d4ed8';

          return (
            <div key={ben.id} style={{
              display:'flex', alignItems:'center', gap:12,
              padding:'10px 0', borderBottom:'1px solid var(--border)',
              direction:'rtl',
            }}>
              <span style={{ fontSize:26, flexShrink:0 }}>{ben.emoji}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:900, color:'var(--text-primary)', marginBottom:2 }}>{ben.name}</div>
                <div style={{ height:6, background:'var(--border)', borderRadius:99, overflow:'hidden', marginBottom:2 }}>
                  <div style={{
                    height:'100%', width:`${pct}%`,
                    background: pct >= 80
                      ? 'linear-gradient(90deg,#34d399,#10b981)'
                      : 'linear-gradient(90deg,#3b82f6,#1d4ed8)',
                    borderRadius:99, transition:'width 0.8s ease-out',
                  }} />
                </div>
                <div style={{ fontSize:10, color:'var(--text-secondary)', fontWeight:600 }}>
                  {helped} / {needs} احتياج مُلبَّى ({pct}%)
                </div>
              </div>
              <span style={{
                fontSize:10, fontWeight:900, padding:'3px 8px', borderRadius:99, flexShrink:0,
                background: urgencyColor + '18', color: urgencyColor,
              }}>
                {{ critical:'حرج', high:'عالي', medium:'متوسط', low:'منخفض' }[ben.urgency] ?? 'متوسط'}
              </span>
            </div>
          );
        })}

        <div style={{ textAlign:'center', marginTop:12 }}>
          <span style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:700 }}>
            + {Math.max(0, beneficiariesData.length - 5)} مستفيد آخر في قائمة الانتظار
          </span>
        </div>
      </div>

      {/* Donate */}
      {userStats.kp >= 50 && (
        <div style={{ background:'var(--bg-card)', borderRadius:20, padding:'20px 24px', boxShadow:'var(--shadow-sm)', border:'1.5px solid var(--border)', direction:'rtl', textAlign:'center' }}>
          <h3 style={{ fontSize:17, fontWeight:900, color:'var(--text-primary)', marginBottom:8 }}>💖 تبرع بنقاطك</h3>
          <p style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:600, marginBottom:14 }}>حوّل نقاط العطاء إلى تأثير حقيقي في مجتمعك!</p>
          <JellyButton variant="success" size="md" sound="reward" onClick={() => onDonate?.(50)}>
            تبرع بـ 50 KP 🌟
          </JellyButton>
        </div>
      )}
    </div>
  );
};

export default ImpactTab;
