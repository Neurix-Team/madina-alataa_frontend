# ═══════════════════════════════════════════════════════════════════════
# 🗄️ Domain Model - الأعمدة الأساسية فقط
# ═══════════════════════════════════════════════════════════════════════
# Core Database Tables - Simple & Clean
# ═══════════════════════════════════════════════════════════════════════

## 📊 الجداول الأساسية (Core Tables)

---

## 1️⃣ Users (المستخدمين)

```sql
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username            VARCHAR(50) UNIQUE NOT NULL,
    email               VARCHAR(100) UNIQUE NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    age                 INTEGER,
    gender              VARCHAR(10),
    parent_email        VARCHAR(100),
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login          TIMESTAMP
);
```

**الأعمدة:**
- `id` - المعرّف الفريد
- `username` - اسم المستخدم
- `email` - البريد الإلكتروني
- `password_hash` - كلمة المرور المشفرة
- `age` - العمر
- `gender` - الجنس
- `parent_email` - بريد ولي الأمر
- `is_active` - نشط/غير نشط
- `created_at` - تاريخ الإنشاء
- `last_login` - آخر تسجيل دخول

---

## 2️⃣ User_Stats (إحصائيات اللاعب)

```sql
CREATE TABLE user_stats (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level               INTEGER DEFAULT 1,
    xp                  INTEGER DEFAULT 0,
    xp_needed           INTEGER DEFAULT 100,
    kp                  INTEGER DEFAULT 0,
    impact_points       INTEGER DEFAULT 0,
    streak_days         INTEGER DEFAULT 0,
    total_quests        INTEGER DEFAULT 0,
    rank                INTEGER,
    title               VARCHAR(100)
);
```

**الأعمدة:**
- `user_id` - ربط بالمستخدم
- `level` - المستوى الحالي
- `xp` - نقاط الخبرة
- `xp_needed` - نقاط الخبرة المطلوبة للمستوى التالي
- `kp` - نقاط العطاء (Kindness Points)
- `impact_points` - نقاط التأثير
- `streak_days` - سلسلة الأيام المتواصلة
- `total_quests` - إجمالي المهام المكتملة
- `rank` - الرتبة في لوحة الشرف
- `title` - اللقب (مثل: صديق المجتمع)

---

## 3️⃣ Avatars (الأفاتار)

```sql
CREATE TABLE avatars (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                VARCHAR(50),
    gender              VARCHAR(10),
    skin_tone           VARCHAR(20),
    hair_style          VARCHAR(20),
    hair_color          VARCHAR(20),
    accessories         JSON,
    clothes             VARCHAR(50),
    background          VARCHAR(50),
    photo_url           TEXT,
    ai_avatar_url       TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**الأعمدة:**
- `user_id` - ربط بالمستخدم
- `name` - اسم الشخصية
- `gender` - جنس الأفاتار
- `skin_tone` - لون البشرة
- `hair_style` - تسريحة الشعر
- `hair_color` - لون الشعر
- `accessories` - الإكسسوارات (JSON array)
- `clothes` - الملابس
- `background` - الخلفية
- `photo_url` - رابط الصورة الأصلية
- `ai_avatar_url` - رابط الأفاتار المُنشأ بالـ AI

---

## 4️⃣ Zones (المناطق)

```sql
CREATE TABLE zones (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(100) NOT NULL,
    description         TEXT,
    emoji               VARCHAR(10),
    color               VARCHAR(50),
    category            VARCHAR(50),
    unlock_level        INTEGER DEFAULT 1,
    position_x          INTEGER,
    position_y          INTEGER
);
```

**الأعمدة:**
- `title` - اسم المنطقة (مثل: دار الأجداد)
- `description` - الوصف
- `emoji` - الأيقونة
- `color` - اللون المميز
- `category` - الفئة (كبار السن، أيتام، بيئة...)
- `unlock_level` - المستوى المطلوب لفتح المنطقة
- `position_x`, `position_y` - موقع المنطقة على الخريطة

---

## 5️⃣ Quests (المهام)

```sql
CREATE TABLE quests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id             UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    story               TEXT,
    difficulty          VARCHAR(20),
    kp_reward           INTEGER DEFAULT 0,
    xp_reward           INTEGER DEFAULT 0,
    impact_reward       INTEGER DEFAULT 0,
    estimated_time      INTEGER,
    min_level           INTEGER DEFAULT 1,
    quest_type          VARCHAR(50),
    npc_character       JSON,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**الأعمدة:**
- `zone_id` - ربط بالمنطقة
- `title` - عنوان المهمة
- `story` - القصة
- `difficulty` - مستوى الصعوبة (سهل، متوسط، صعب)
- `kp_reward` - مكافأة نقاط العطاء
- `xp_reward` - مكافأة نقاط الخبرة
- `impact_reward` - مكافأة نقاط التأثير
- `estimated_time` - الوقت المتوقع (بالدقائق)
- `min_level` - الحد الأدنى للمستوى
- `quest_type` - نوع المهمة
- `npc_character` - بيانات الشخصية (JSON)

---

## 6️⃣ Completed_Quests (المهام المكتملة)

```sql
CREATE TABLE completed_quests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id            UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    score               INTEGER,
    time_taken          INTEGER,
    bonus_actions       JSON,
    total_kp            INTEGER,
    total_xp            INTEGER,
    completed_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, quest_id)
);
```

**الأعمدة:**
- `user_id` - من أكمل المهمة
- `quest_id` - المهمة المكتملة
- `score` - النتيجة
- `time_taken` - الوقت المُستغرق (بالثواني)
- `bonus_actions` - الإجراءات الإضافية (JSON)
- `total_kp` - إجمالي النقاط المكتسبة
- `total_xp` - إجمالي الخبرة المكتسبة
- `completed_at` - تاريخ الإكمال

---

## 7️⃣ Badges (الشارات)

```sql
CREATE TABLE badges (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(100) NOT NULL,
    description         TEXT,
    emoji               VARCHAR(10),
    category            VARCHAR(50),
    unlock_condition    JSON,
    rarity              VARCHAR(20),
    icon_url            VARCHAR(255)
);
```

**الأعمدة:**
- `name` - اسم الشارة
- `description` - الوصف
- `emoji` - الأيقونة
- `category` - الفئة
- `unlock_condition` - شروط الحصول (JSON)
- `rarity` - الندرة (عادي، نادر، أسطوري)

---

## 8️⃣ User_Badges (شارات المستخدم)

```sql
CREATE TABLE user_badges (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id            UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    progress            INTEGER DEFAULT 0,
    is_unlocked         BOOLEAN DEFAULT FALSE,
    unlocked_at         TIMESTAMP,
    UNIQUE(user_id, badge_id)
);
```

**الأعمدة:**
- `user_id` - المستخدم
- `badge_id` - الشارة
- `progress` - نسبة التقدم (0-100)
- `is_unlocked` - هل مفتوحة؟
- `unlocked_at` - تاريخ الفتح

---

## 9️⃣ Shop_Items (عناصر المتجر)

```sql
CREATE TABLE shop_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(100) NOT NULL,
    description         TEXT,
    emoji               VARCHAR(10),
    category            VARCHAR(50),
    price_kp            INTEGER NOT NULL,
    unlock_level        INTEGER DEFAULT 1,
    is_available        BOOLEAN DEFAULT TRUE,
    rarity              VARCHAR(20),
    image_url           VARCHAR(255)
);
```

**الأعمدة:**
- `name` - اسم العنصر
- `category` - الفئة (ملابس، إكسسوارات، ديكورات)
- `price_kp` - السعر بنقاط KP
- `unlock_level` - المستوى المطلوب
- `is_available` - متاح/غير متاح

---

## 🔟 Transactions (المعاملات)

```sql
CREATE TABLE transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id             UUID REFERENCES shop_items(id),
    transaction_type    VARCHAR(50),
    amount_kp           INTEGER,
    status              VARCHAR(20),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**الأعمدة:**
- `user_id` - المستخدم
- `item_id` - العنصر المشترى (إذا كان شراء)
- `transaction_type` - نوع المعاملة (purchase, earn, donate)
- `amount_kp` - المبلغ
- `status` - الحالة (pending, completed, failed)

---

## 1️⃣1️⃣ Daily_Tasks (المهام اليومية)

```sql
CREATE TABLE daily_tasks (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_type           VARCHAR(50),
    task_description    TEXT,
    kp_reward           INTEGER,
    is_completed        BOOLEAN DEFAULT FALSE,
    task_date           DATE DEFAULT CURRENT_DATE,
    expires_at          TIMESTAMP
);
```

**الأعمدة:**
- `user_id` - المستخدم
- `task_type` - نوع المهمة
- `task_description` - الوصف
- `kp_reward` - المكافأة
- `is_completed` - مكتملة؟
- `task_date` - تاريخ المهمة
- `expires_at` - تنتهي في

---

## 1️⃣2️⃣ Notifications (الإشعارات)

```sql
CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                VARCHAR(50),
    title               VARCHAR(200),
    message             TEXT,
    icon                VARCHAR(10),
    is_read             BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_url          VARCHAR(255)
);
```

**الأعمدة:**
- `user_id` - المستخدم
- `type` - نوع الإشعار (level_up, badge, quest_complete)
- `title` - العنوان
- `message` - الرسالة
- `icon` - الأيقونة
- `is_read` - مقروء؟

---

## 1️⃣3️⃣ Impact (التأثير)

```sql
CREATE TABLE impact (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_points        INTEGER DEFAULT 0,
    elderly_helped      INTEGER DEFAULT 0,
    children_helped     INTEGER DEFAULT 0,
    trees_planted       INTEGER DEFAULT 0,
    meals_provided      INTEGER DEFAULT 0,
    books_donated       INTEGER DEFAULT 0,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**الأعمدة:**
- `user_id` - المستخدم
- `total_points` - إجمالي نقاط التأثير
- `elderly_helped` - عدد المسنين المساعدين
- `children_helped` - عدد الأطفال المساعدين
- `trees_planted` - عدد الأشجار المزروعة
- `meals_provided` - عدد الوجبات الموزعة
- `books_donated` - عدد الكتب المُتبرع بها

---

## 1️⃣4️⃣ Donations (التبرعات الحقيقية)

```sql
CREATE TABLE donations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_name        VARCHAR(200),
    kp_amount           INTEGER,
    real_value_usd      DECIMAL(10,2),
    partner_org         VARCHAR(200),
    status              VARCHAR(20),
    donated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    receipt_url         VARCHAR(255)
);
```

**الأعمدة:**
- `user_id` - المستخدم المتبرع
- `project_name` - اسم المشروع (إطعام أطفال، زراعة أشجار...)
- `kp_amount` - عدد نقاط KP المحولة
- `real_value_usd` - القيمة بالدولار
- `partner_org` - المنظمة الشريكة
- `status` - الحالة
- `receipt_url` - رابط الإيصال

---

## 📊 Entity Relationship Diagram (ERD) - مبسط

```
                    👤 USERS
                       │
        ┌──────────────┼──────────────┬────────────────┐
        │              │              │                │
        │ 1:1          │ 1:1          │ 1:1            │ 1:*
        ▼              ▼              ▼                ▼
   USER_STATS     AVATARS        IMPACT      NOTIFICATIONS
      📊            🎨            💫              🔔
        
        │
        │ 1:*
        ▼
  COMPLETED_QUESTS ──────► 1:* ──────► QUESTS ──────► *:1 ──────► ZONES
        ✅                              🎯                          🗺️
        
        │
        │ 1:*
        ▼
   USER_BADGES ──────────► *:1 ──────► BADGES
      🎖️                                  🏅
      
        │
        │ 1:*
        ▼
  TRANSACTIONS ──────────► *:1 ──────► SHOP_ITEMS
      💰                                   🛍️
      
        │
        │ 1:*
        ▼
   DAILY_TASKS
      📅
      
        │
        │ 1:*
        ▼
    DONATIONS
       ❤️
```

---

## 📋 ملخص الجداول (14 جدول أساسي)

| # | اسم الجدول | الوصف | عدد الأعمدة |
|---|------------|-------|-------------|
| 1 | `users` | المستخدمين | 10 |
| 2 | `user_stats` | إحصائيات اللاعب | 11 |
| 3 | `avatars` | الأفاتارات | 14 |
| 4 | `zones` | المناطق | 9 |
| 5 | `quests` | المهام | 14 |
| 6 | `completed_quests` | المهام المكتملة | 9 |
| 7 | `badges` | الشارات | 8 |
| 8 | `user_badges` | شارات المستخدم | 6 |
| 9 | `shop_items` | عناصر المتجر | 10 |
| 10 | `transactions` | المعاملات | 7 |
| 11 | `daily_tasks` | المهام اليومية | 8 |
| 12 | `notifications` | الإشعارات | 9 |
| 13 | `impact` | التأثير | 9 |
| 14 | `donations` | التبرعات | 9 |

**إجمالي: 14 جدول | 133 عمود**

---

## 🔗 العلاقات الرئيسية

```
USER (1) ←→ (1) USER_STATS
USER (1) ←→ (1) AVATAR
USER (1) ←→ (1) IMPACT
USER (1) ←→ (*) COMPLETED_QUESTS
USER (1) ←→ (*) USER_BADGES
USER (1) ←→ (*) TRANSACTIONS
USER (1) ←→ (*) DAILY_TASKS
USER (1) ←→ (*) NOTIFICATIONS
USER (1) ←→ (*) DONATIONS

ZONE (1) ←→ (*) QUESTS
QUEST (1) ←→ (*) COMPLETED_QUESTS

BADGE (1) ←→ (*) USER_BADGES
SHOP_ITEM (1) ←→ (*) TRANSACTIONS
```

---

## 🎯 الأعمدة الإلزامية (NOT NULL)

### Users:
- `username`, `email`, `password_hash`

### User_Stats:
- `user_id`

### Avatars:
- `user_id`

### Zones:
- `title`

### Quests:
- `zone_id`, `title`

### Completed_Quests:
- `user_id`, `quest_id`

### User_Badges:
- `user_id`, `badge_id`

### Shop_Items:
- `name`, `price_kp`

### Transactions:
- `user_id`, `transaction_type`

---

## 📐 Indexes المقترحة (للأداء)

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- User Stats
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_rank ON user_stats(rank);

-- Completed Quests
CREATE INDEX idx_completed_user_id ON completed_quests(user_id);
CREATE INDEX idx_completed_quest_id ON completed_quests(quest_id);
CREATE INDEX idx_completed_date ON completed_quests(completed_at);

-- Quests
CREATE INDEX idx_quests_zone_id ON quests(zone_id);
CREATE INDEX idx_quests_difficulty ON quests(difficulty);

-- Notifications
CREATE INDEX idx_notif_user_id ON notifications(user_id);
CREATE INDEX idx_notif_is_read ON notifications(is_read);

-- Transactions
CREATE INDEX idx_trans_user_id ON transactions(user_id);
CREATE INDEX idx_trans_type ON transactions(transaction_type);
```

---

**✅ Domain Model الأساسي جاهز! 14 جدول فقط - بسيط ومنظم! 🎯**
