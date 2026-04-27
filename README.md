# BATAL El Ataa | Madina Al Ataa

Interactive frontend application built with **React + Vite** designed to provide an educational/motivational experience for children and parents through **Gamification** elements like points, badges, tasks, challenges, and interactive maps.

---

## Overview

**Madina Al Ataa** is a Frontend project focused on:
- Encouraging users through XP/levels system
- Daily tasks and individual/team challenges
- Badges and achievements system
- Orders and cases management
- Interactive experience (Modals / Effects / Notifications)

The project heavily relies on **Mock Data** and **MSW** during development, with architecture ready for real Backend integration later.

---

## المميزات الرئيسية

- نظام Gamification شامل:
  - XP / Levels
  - Badges
  - Daily Tasks
  - Team Challenges
- تبويبات متعددة مثل:
  - Profile
  - Orders
  - Badges
  - Impact
  - Admin
  - Map / Geo Quests / Leaderboard / Parents
- مكونات UI قابلة لإعادة الاستخدام (NotificationBell, ConfettiOverlay, DashboardCards…)
- دعم Mock API في بيئة التطوير عبر **MSW**
- معالجة آمنة لاستجابات API مع fallback data لتجنب انهيار التطبيق

---

## التقنيات المستخدمة

- **React 18**
- **Vite 5**
- **React Router**
- **TailwindCSS 4** + CSS files
- **MSW (Mock Service Worker)**
- **Formik + Yup**
- **Lucide React / React Icons**

---

## متطلبات التشغيل

- **Node.js** (يفضل 18+)
- **npm** (أو pnpm/yarn حسب تفضيلك)

---

## التشغيل المحلي

### 1) تثبيت الاعتماديات
```bash
npm install
```

### 2) تشغيل بيئة التطوير
```bash
npm run dev
```
ثم افتح:
- `http://localhost:5173`

### 3) بناء نسخة الإنتاج
```bash
npm run build
```

### 4) معاينة نسخة الإنتاج
```bash
npm run preview
```
ثم افتح:
- `http://localhost:4173`

---

## التشغيل عبر Docker

يوجد إعداد Docker Compose لتشغيل الواجهة الأمامية عبر Nginx.

### تشغيل الخدمة
```bash
docker compose up --build
```

### الوصول للتطبيق
- `http://localhost:3000`

> ملاحظة: ملف `docker-compose.yml` يحتوي أيضًا placeholders للـ Backend وPostgreSQL (معلقة حاليًا).

---

## هيكل المشروع (مختصر)

```text
src/
  App.jsx
  main.jsx
  app/
    providers/
    router/
  components/
    common/
    layout/
    modals/
    tabs/
    auth/
    avatar/
  data/
  hooks/
  mocks/
  pages/
  router/
  services/
  styles/
  utils/
```

---

## السكربتات المتاحة

من `package.json`:

- `npm run dev` → تشغيل بيئة التطوير عبر Vite
- `npm run build` → بناء نسخة الإنتاج
- `npm run preview` → معاينة نسخة الإنتاج
- `npm run predeploy` → بناء قبل النشر
- `npm run deploy` → نشر `dist` إلى GitHub Pages

---

## النشر (Deployment)

### Vercel (SPA Rewrite)
ملف `vercel.json` مضبوط كالتالي:
- إعادة توجيه كل المسارات إلى `index.html`
- مناسب لتطبيقات SPA

### GitHub Pages
يوجد script جاهز للنشر:
```bash
npm run deploy
```

---

## ملاحظات مهمة حول API

- في بعض سيناريوهات الإنتاج، طلبات `/api/*` قد ترجع HTML بدل JSON بسبب إعدادات rewrites.
- تم اعتماد معالجة آمنة داخل طبقة API (مع fallback data) لتجنب أخطاء مثل:
  - `Unexpected token '<' ... is not valid JSON`

---

## المساهمة (Contributing)

1. اعمل Fork للمشروع
2. أنشئ branch جديد لميزة/إصلاح
3. نفّذ التعديلات واختبرها
4. افتح Pull Request واضح

---

## الترخيص

حالياً لا يوجد ملف ترخيص صريح داخل المشروع.  
يفضل إضافة `LICENSE` لتوضيح سياسة الاستخدام وإعادة التوزيع.

---

## مرجع إضافي

- للاطلاع على دليل عربي تفصيلي:  
  `PROJECT_GUIDE_AR.md`
