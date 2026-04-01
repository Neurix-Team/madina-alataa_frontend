# TODO - Domain Model Full Implementation

## 🎯 الهدف: تطبيق كامل الـ Domain Model

---

## 📦 Phase 1: Data Layer
- [x] src/data/beneficiariesData.js — Beneficiary + Partner entities
- [x] src/data/ordersData.js — ServiceRequests initial data

## ⚙️ Phase 2: Services
- [x] src/services/OrderService.js — VolunteerOrder, DonationOrder, ServiceRequest
- [x] src/services/BadgesEngine.js — Dynamic badge computation

## 🎨 Phase 3: CSS Files (منفصلة)
- [x] src/styles/orders.css
- [x] src/styles/admin.css
- [x] src/styles/npc-dialog.css
- [x] src/styles/minigame.css
- [x] src/styles/badges.css

## 🧩 Phase 4: New Components
- [x] src/components/modals/NPCDialog.jsx — Interactive NPC conversation
- [x] src/components/modals/MiniGameModal.jsx — Memory match mini-game
- [x] src/components/tabs/OrdersTab.jsx — Orders management tab
- [x] src/components/tabs/AdminTab.jsx — Admin panel (+ search/filter/empty-state)

## 🔧 Phase 5: Modify Existing Files
- [ ] src/data/zonesData.js — Add beneficiaryId + npc + miniGame flags (optional)
- [ ] src/data/badgesData.js — Add condition keys for dynamic badges (optional)
- [x] src/hooks/useGameState.js — Add orders[] state + ADD_ORDER action + addOrder callback
- [x] src/components/tabs/BadgesTab.jsx — Dynamic badges via BadgesEngine (+ progress bars)
- [x] src/components/tabs/ImpactTab.jsx — Add Beneficiary impact section
- [ ] src/components/modals/QuestModal.jsx — Add NPC dialog step + MiniGame button (optional)
- [x] src/components/layout/Sidebar.jsx — Add Orders + Admin nav items
- [x] src/App.jsx — OrdersTab + AdminTab rendered; handleCompleteQuest + handleDonateWithOrder wired
- [x] src/main.jsx — Import all 5 CSS files

---

## ✅ Completed Steps
- [x] Analyze AdminTab.jsx and identify practical completion scope.
- [x] Add requests search + status filter in AdminTab.
- [x] Add filtered count + empty state in requests section.
- [x] Fix STATUS_COLORS to match OrderService keys (in_progress / completed / cancelled).
- [x] Wire orders[] state in useGameState (ADD_ORDER reducer + addOrder callback).
- [x] Import OrdersTab + AdminTab in App.jsx and render them.
- [x] Add orders + admin nav items to Sidebar.jsx.
- [x] BadgesTab: dynamic earned badges via BadgesEngine.computeEarnedBadges + progress bars.
- [x] ImpactTab: add beneficiaries impact section with progress bars.
- [x] App.jsx: handleCompleteQuest creates VolunteerOrder on quest complete.
- [x] App.jsx: handleDonateWithOrder creates DonationOrder on donate.
- [x] Build passed ✓ (vite build — 80 modules, 0 errors).
