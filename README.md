# 🗺️ مدينة العطاء

لعبة تطوعية تفاعلية للأطفال — React + Vite

## هيكل المشروع

```
src/
├── main.jsx
├── App.jsx                              # Root — auth gate + layout
│
├── services/                            # OOP Business Logic
│   ├── AudioManager.js                  # Singleton — Web Audio API sounds
│   └── GameEngine.js                    # Static — XP / levelling / confetti
│
├── hooks/
│   └── useGameState.js                  # All game state (delegates to services)
│
├── utils/
│   └── helpers.js                       # Thin re-exports + AVATAR_COLORS
│
├── data/
│   ├── zonesData.js                     # 8 city zones + quests
│   ├── badgesData.js
│   └── leaderboardData.js
│
└── components/
    ├── layout/
    │   └── Sidebar.jsx                  # Dark-theme nav sidebar
    │
    ├── common/
    │   ├── StatBadge.jsx
    │   ├── Notification.jsx             # Toast
    │   ├── RocketBackground.jsx         # 🚀 Animated BG
    │   ├── ConfettiOverlay.jsx          # 🎊 Level-up confetti
    │   └── JellyButton.jsx              # 🍬 Springy accessible button
    │
    ├── auth/
    │   └── AuthScreen.jsx
    │
    ├── modals/
    │   ├── TutorialModal.jsx            # First-run welcome
    │   ├── DailyRewardModal.jsx         # Return-visit KP gift
    │   ├── ZoneDetailModal.jsx
    │   ├── QuestModal.jsx
    │   └── LevelUpModal.jsx             # + confetti + fanfare
    │
    └── tabs/
        ├── MapTab.jsx
        ├── BadgesTab.jsx
        ├── LeaderboardTab.jsx
        ├── ImpactTab.jsx
        ├── ProfileTab.jsx
        └── ParentsTab.jsx
```

## المميزات الجديدة

| الميزة | التفاصيل |
|---|---|
| 🚀 Rocket Background | صاروغ يطير صعود ونزول مع سحب ونجوم متحركة |
| 🔊 Web Audio API | أصوات تفاعلية لكل ضغطة، مهمة، جائزة، ترقي |
| 🍬 Jelly Buttons | أزرار مطاطية تنضغط وترتد عند النقر |
| 🎊 Confetti Burst | انفجار ورق ملوّن عند الارتقاء بالمستوى |
| 🏰 Sidebar جديد | تصميم داكن احترافي مع XP bar وإحصائيات |
| 🎮 OOP Architecture | AudioManager Singleton + GameEngine static class |

## تشغيل المشروع

```bash
npm install
npm run dev
```
