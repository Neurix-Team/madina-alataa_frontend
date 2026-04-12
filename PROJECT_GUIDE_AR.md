# دليل المشروع الكامل (Madina Al Ataa) — بالعربي

## 1) مقدمة سريعة

مشروع **Madina Al Ataa** هو تطبيق واجهة أمامية (Frontend) مبني بـ **React + Vite** ويهدف لتقديم تجربة تفاعلية تعليمية/تحفيزية للأطفال والأهالي، مع عناصر ألعاب (Gamification) مثل:

- النقاط والمستويات
- المهام اليومية
- الشارات (Badges)
- التحديات
- الإشعارات
- استكشاف المدينة والخريطة
- إدارة الطلبات والحالات

التطبيق يعتمد على بيانات محلية وMock Data في أجزاء كبيرة، مع بنية تسمح بالتوسع لاحقًا لربطه بواجهات API حقيقية.

---

## 2) التقنيات المستخدمة

## 2.1 الواجهة والتشغيل
- **React**
- **Vite**
- **React Router**
- **React Icons**

## 2.2 أسلوب الكتابة والتنظيم
- مزيج من:
  - CSS Files (`src/styles/*`)
  - Inline styles داخل بعض الصفحات/المكونات
- تقسيم واضح نسبيًا إلى:
  - Components
  - Tabs / Pages
  - Services
  - Data
  - Hooks
  - Utils

## 2.3 الاختبار/المحاكاة
- استخدام **MSW** (Mock Service Worker) أثناء التطوير في بيئة DEV.

---

## 3) طريقة تشغيل المشروع محليًا

## 3.1 تثبيت الاعتماديات
```bash
npm install
```

## 3.2 تشغيل وضع التطوير
```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

غالبًا الرابط المحلي:
- `http://localhost:5173`

## 3.3 بناء نسخة الإنتاج
```bash
npm run build
```

## 3.4 معاينة نسخة الإنتاج محليًا
```bash
npm run preview -- --host 0.0.0.0 --port 4173
```

---

## 4) هيكل المشروع (ملخص)

```text
src/
  App.jsx
  main.jsx
  components/
    common/
    layout/
    modals/
    tabs/
    auth/
    avatar/
  data/
  hooks/
  services/
  styles/
  utils/
  mocks/
```

---

## 5) شرح الملفات الأساسية

## 5.1 `src/main.jsx`
نقطة الدخول الرئيسية للتطبيق:
- يجهز React Root
- يلف التطبيق بـ `BrowserRouter`
- يلف التطبيق بـ `AuthProvider`
- في وضع التطوير (`import.meta.env.DEV`) يشغل MSW worker قبل render:
  - `worker.start({ serviceWorker: { url: '/mockServiceWorker.js' } })`

**أهمية الملف:** يحدد دورة إقلاع التطبيق وبيئة الموك.

---

## 5.2 `src/App.jsx`
القلب الأساسي للواجهة:
- يدير الـ layout العام
- ينظم التنقل بين التبويبات/الصفحات الرئيسية
- يربط بين مكونات Sidebar والمحتوى الرئيسي

**أهمية الملف:** نقطة تجميع واجهة المستخدم كلها.

---

## 5.3 `src/components/layout/Sidebar.jsx`
الشريط الجانبي للتنقل:
- يحتوي عناصر التنقل بين التبويبات
- غالبًا يعكس حالة الصفحة الحالية
- مدخل رئيسي لتجربة المستخدم

---

## 6) Tabs/Pages الأساسية (وظيفيًا)

> أسماء التبويبات قد تختلف حسب النسخ، لكن الموجود في المشروع يشمل مجموعة كبيرة مثل:

- `ProfileTab` / الملف الشخصي
- `OrdersTab` / الطلبات
- `BadgesTab` / الشارات والإنجازات
- `ImpactTab` / الأثر
- `AdminTab` / الإدارة
- `MapTab` / الخريطة
- `LeaderboardTab` / لوحة الترتيب
- `ParentsTab` / بوابة الأهالي
- `GeoQuestsTab` / المهام الجغرافية
- `DailyTasksTab` / المهام اليومية
- `TeamChallengesTab` / تحديات الفريق
- `CityExplorationTab` / استكشاف المدينة

كل Tab غالبًا:
1. يقرأ بيانات من `data/*` أو `services/*`
2. يعرض كروت/جداول/مؤشرات
3. يتعامل مع تفاعل المستخدم (نقر، حذف، تعليم كمقروء، إلخ)

---

## 7) Components المهمة

## 7.1 `components/common`
مكونات عامة قابلة لإعادة الاستخدام، مثل:
- `NotificationBell`
- `ConfettiOverlay`
- `DashboardCards`
- `JellyButton`
- `CanvasBackground` / `RocketBackground`

**فائدتها:** توحيد السلوك والشكل وتقليل تكرار الكود.

## 7.2 `components/modals`
نوافذ منبثقة متخصصة:
- `QuestModal`
- `NPCDialog`
- `MiniGameModal`
- `DailyRewardModal`
- `LevelUpModal`
- `ZoneDetailModal`
- `TutorialModal`

**فائدتها:** تقديم تجربة تفاعلية بدون تغيير كامل الصفحة.

## 7.3 `components/auth` و `components/avatar`
- `AuthScreen` لتدفق تسجيل/دخول
- مكونات تخص إنشاء/عرض الأفاتار

---

## 8) طبقة البيانات `src/data`

المجلد يحتوي ملفات بيانات محلية ثابتة/شبه ثابتة، مثل:
- `ordersData.js`
- `beneficiariesData.js`
- `badgesData.js`
- `leaderboardData.js`
- `geoQuestsData.js`
- `teamChallengesData.js`
- `cityExplorationData.js`
- `zonesData.js`

**الفكرة:** هذه الملفات تعمل كمصدر بيانات سريع أثناء التطوير أو عند عدم وجود Backend كامل.

---

## 9) طبقة الخدمات `src/services`

تحتوي منطق الأعمال (Business Logic) بدل وضعه مباشرة في UI.

أمثلة:
- `OrderService.js`
- `BadgesEngine.js`
- `GameEngine.js`
- `GeoQuestService.js`
- `TeamService.js`
- `ThemeService.js`
- `AudioManager.js`
- `api.js`

## 9.1 `src/services/api.js` (مهم جدًا)
الملف مسؤول عن جلب بيانات من `/api/*`.

تم تحديثه ليعالج مشكلة الإنتاج الشهيرة:
- `Unexpected token '<' ... is not valid JSON`

**سبب المشكلة:** عندما `/api/*` يرجع HTML بدل JSON (غالبًا بسبب rewrites)، كان التطبيق يحاول `response.json()` مباشرة فينهار.

**الحل المطبق:**
- `safeFetchJson` يتحقق من `content-type`
- إذا الاستجابة ليست JSON أو فيها خطأ، يرجع fallback data من `src/mocks/data/*`
- يمنع انهيار الشاشة ويضمن استمرار الواجهة

---

## 10) نظام الـ Mock (MSW)

- ملفات داخل `src/mocks/`
  - `browser.js`
  - `handlers.js`
  - `data/*`

في وضع DEV:
- يتم اعتراض طلبات `/api/*` وإرجاع Mock responses.
في الإنتاج:
- لا يُفترض تشغيل worker بنفس الشكل، لذا وجود fallback في `api.js` مهم للأمان.

---

## 11) الـ Hooks و Utils

## 11.1 Hooks
- `useGameState.js` وأي Hooks مشابهة
- إدارة الحالة المشتركة وتغليف منطق متكرر

## 11.2 Utils
- `jwt.js`
- `helpers.js`
- وظائف مساعدة (Parsing, Formatting, Storage helpers)

---

## 12) الـ Styling

موجود في:
- `src/styles/*.css` مثل:
  - `variables.css`
  - `orders.css`
  - `admin.css`
  - `npc-dialog.css`
  - `minigame.css`
  - `badges.css`

ملاحظات:
- يوجد مزيج بين CSS files وinline styles.
- صفحة الإشعارات كانت تحتوي تحذيرات duplicate keys وتم إصلاحها.

---

## 13) النشر على Vercel

## 13.1 الإعداد الحالي
تم تحديث `vercel.json` لصيغة SPA:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 13.2 ملاحظة مهمة
هذا rewrite يوجه كل المسارات إلى `index.html`، لذلك أي طلب API فعلي تحت `/api/*` قد يرجع HTML بدل JSON إذا ما في Backend route حقيقي.

لذلك تم تعزيز `api.js` بـ fallback للحفاظ على استقرار التطبيق.

## 13.3 مشكلة شائعة واجهت المشروع
- فشل Vercel CLI بسبب token غير صالح:
  - `The specified token is not valid`
- الحل:
  - `vercel login` ثم إعادة النشر
  - أو النشر من واجهة Vercel Dashboard مباشرة

---

## 14) المشاكل التي تم حلها مؤخرًا

1. **مشكلة الإنتاج (JSON parse crash)**  
   - الرسالة: `Unexpected token '<'... is not valid JSON`
   - تم الحل عبر تحسين `src/services/api.js`

2. **تحذيرات duplicate key في NotificationsPage**
   - الملف: `src/pages/NotificationsPage.jsx`
   - تم إزالة تكرار `border` داخل نفس object literals

3. **تحسين توافق البناء**
   - `npm run build` يعمل بنجاح

---

## 15) أهم أوامر Git المستخدمة في التطوير الحالي

```bash
git checkout main
git pull origin main
git add .
git commit -m "message"
git push origin main
```

وفي حالات اختلاف التاريخ أو إعادة ترتيب commits:
```bash
git pull origin <branch> --rebase
```

---

## 16) توصيات تحسين مستقبلية (Roadmap)

1. **فصل API layer بشكل أقوى**
   - طبقة `httpClient` موحدة (timeouts, retries, error mapping)

2. **إضافة Error Boundaries**
   - لمنع سقوط كامل الشاشة عند خطأ مكون واحد

3. **تقليل حجم الـ bundle**
   - استخدام dynamic imports
   - manual chunks في Vite

4. **توحيد الستايل**
   - تقليل inline styles ونقلها لنظام Design System/CSS modules

5. **إضافة اختبارات**
   - Unit tests للخدمات
   - Integration للـ tabs الأساسية
   - E2E للتدفقات الرئيسية

6. **تحسين النشر**
   - إعداد بيئة API واضحة للإنتاج بدل الاعتماد الكامل على fallback

---

## 17) دليل سريع لاستكشاف الأعطال

## إذا ظهرت شاشة بيضاء:
1. افتح Console في المتصفح
2. افحص Network لطلبات `/api/*`
3. إذا الاستجابة HTML بدل JSON:
   - تأكد من إعدادات Vercel
   - أو اعتمد fallback في `api.js` (مطبق حاليًا)

## إذا ظهرت تحذيرات esbuild:
- راجع السطر المحدد
- تأكد عدم تكرار نفس المفتاح في object literal

## إذا فشل deploy CLI:
- نفذ `vercel login`
- تأكد من الحساب/التوكن الصحيح

---

## 18) خلاصة

المشروع جاهز كمنصة واجهة تفاعلية قوية، وفيه بنية جيدة للتوسع.  
التحسينات الأخيرة رفعت الاستقرار خصوصًا في الإنتاج عبر:
- منع انهيار JSON parsing
- تنظيف تحذيرات Notifications page
- الحفاظ على نجاح build والنشر من ناحية الكود

---

## 19) ملحق — أسماء ملفات مهمة للرجوع السريع

- `src/main.jsx`
- `src/App.jsx`
- `src/services/api.js`
- `src/pages/NotificationsPage.jsx`
- `src/components/layout/Sidebar.jsx`
- `src/hooks/useGameState.js`
- `src/data/*`
- `src/services/*`
- `vercel.json`
- `TODO.md`

---

تم إعداد هذا الملف كمرجع عربي شامل للفريق للتطوير والصيانة.
