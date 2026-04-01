# ═══════════════════════════════════════════════════════════════════════
# 🎨 Domain Model - مشروع بطل العطاء
# ═══════════════════════════════════════════════════════════════════════
# Complete Domain Model Design (Not Code - Visual Design)
# ═══════════════════════════════════════════════════════════════════════

## 📋 جدول المحتويات
1. [Domain Entities](#entities)
2. [Entity Relationships (ERD)](#erd)
3. [Use Case Diagram](#usecase)
4. [System Architecture](#architecture)
5. [Data Flow Diagrams](#dataflow)
6. [Class Diagram](#classdiagram)

---

# 🎯 1. Domain Entities (الكيانات الأساسية) {#entities}

## 📦 Core Entities

```
┌────────────────────────────────────────────────────────────┐
│                    🎮 GAME ENTITIES                        │
└────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│      👤 USER        │
│   (المستخدم)        │
├─────────────────────┤
│ • id                │
│ • username          │
│ • email             │
│ • password_hash     │
│ • age               │
│ • gender            │
│ • created_at        │
│ • last_login        │
│ • is_active         │
│ • parent_email      │
└─────────────────────┘

┌─────────────────────┐
│   📊 USER_STATS     │
│  (إحصائيات اللاعب)  │
├─────────────────────┤
│ • user_id (FK)      │
│ • level             │
│ • xp                │
│ • xp_needed         │
│ • kp (نقاط العطاء)  │
│ • impact_points     │
│ • streak_days       │
│ • total_quests      │
│ • rank              │
│ • title             │
└─────────────────────┘

┌─────────────────────┐
│   🎨 AVATAR         │
│   (الشخصية)         │
├─────────────────────┤
│ • id                │
│ • user_id (FK)      │
│ • name              │
│ • gender            │
│ • skin_tone         │
│ • hair_style        │
│ • hair_color        │
│ • accessories []    │
│ • clothes           │
│ • background        │
│ • photo_url         │
│ • ai_avatar_url     │
│ • created_at        │
│ • updated_at        │
└─────────────────────┘

┌─────────────────────┐
│   🗺️ ZONE          │
│   (المنطقة)         │
├─────────────────────┤
│ • id                │
│ • title             │
│ • description       │
│ • emoji             │
│ • color             │
│ • category          │
│ • unlock_level      │
│ • position_x        │
│ • position_y        │
│ • is_locked         │
│ • total_quests      │
└─────────────────────┘

┌─────────────────────┐
│   🎯 QUEST          │
│   (المهمة)          │
├─────────────────────┤
│ • id                │
│ • zone_id (FK)      │
│ • title             │
│ • description       │
│ • story             │
│ • difficulty        │
│ • kp_reward         │
│ • xp_reward         │
│ • impact_reward     │
│ • estimated_time    │
│ • min_level         │
│ • quest_type        │
│ • npc_character     │
│ • is_active         │
│ • created_at        │
└─────────────────────┘

┌─────────────────────┐
│ 🎮 MINI_GAME        │
│  (اللعبة المصغرة)   │
├─────────────────────┤
│ • id                │
│ • quest_id (FK)     │
│ • game_type         │
│ • config_json       │
│ • time_limit        │
│ • max_attempts      │
│ • passing_score     │
└─────────────────────┘

┌─────────────────────┐
│ ✅ COMPLETED_QUEST  │
│  (المهام المكتملة)  │
├─────────────────────┤
│ • id                │
│ • user_id (FK)      │
│ • quest_id (FK)     │
│ • score             │
│ • time_taken        │
│ • bonus_actions []  │
│ • total_kp          │
│ • total_xp          │
│ • completed_at      │
└─────────────────────┘

┌─────────────────────┐
│   🏅 BADGE          │
│   (الشارة)          │
├─────────────────────┤
│ • id                │
│ • name              │
│ • description       │
│ • emoji             │
│ • category          │
│ • unlock_condition  │
│ • rarity            │
│ • icon_url          │
└─────────────────────┘

┌─────────────────────┐
│  🎖️ USER_BADGE     │
│  (شارات المستخدم)   │
├─────────────────────┤
│ • id                │
│ • user_id (FK)      │
│ • badge_id (FK)     │
│ • progress          │
│ • is_unlocked       │
│ • unlocked_at       │
└─────────────────────┘

┌─────────────────────┐
│   🛍️ SHOP_ITEM     │
│  (عناصر المتجر)     │
├─────────────────────┤
│ • id                │
│ • name              │
│ • description       │
│ • emoji             │
│ • category          │
│ • price_kp          │
│ • unlock_level      │
│ • is_available      │
│ • rarity            │
│ • image_url         │
└─────────────────────┘

┌─────────────────────┐
│  💰 TRANSACTION     │
│  (المعاملات)        │
├─────────────────────┤
│ • id                │
│ • user_id (FK)      │
│ • item_id (FK)      │
│ • transaction_type  │
│ • amount_kp         │
│ • status            │
│ • created_at        │
└─────────────────────┘

┌─────────────────────┐
│  📅 DAILY_TASK      │
│  (المهام اليومية)   │
├─────────────────────┤
│ • id                │
│ • user_id (FK)      │
│ • task_type         │
│ • task_description  │
│ • kp_reward         │
│ • is_completed      │
│ • date              │
│ • expires_at        │
└─────────────────────┘

┌─────────────────────┐
│  🔔 NOTIFICATION    │
│   (الإشعارات)       │
├─────────────────────┤
│ • id                │
│ • user_id (FK)      │
│ • type              │
│ • title             │
│ • message           │
│ • icon              │
│ • is_read           │
│ • created_at        │
│ • action_url        │
└─────────────────────┘

┌─────────────────────┐
│  🥇 LEADERBOARD     │
│  (لوحة الشرف)       │
├─────────────────────┤
│ • user_id (FK)      │
│ • rank              │
│ • total_kp          │
│ • total_quests      │
│ • level             │
│ • updated_at        │
└─────────────────────┘

┌─────────────────────┐
│  💫 IMPACT          │
│   (التأثير)         │
├─────────────────────┤
│ • id                │
│ • user_id (FK)      │
│ • category          │
│ • total_points      │
│ • elderly_helped    │
│ • children_helped   │
│ • trees_planted     │
│ • meals_provided    │
│ • updated_at        │
└─────────────────────┘

┌─────────────────────┐
│  ❤️ DONATION        │
│  (التبرع الحقيقي)   │
├─────────────────────┤
│ • id                │
│ • user_id (FK)      │
│ • project_name      │
│ • kp_amount         │
│ • real_value_usd    │
│ • partner_org       │
│ • status            │
│ • donated_at        │
│ • receipt_url       │
└─────────────────────┘

┌─────────────────────┐
│  👨‍👩‍👧 PARENT_CONTROL │
│  (التحكم الأبوي)     │
├─────────────────────┤
│ • id                │
│ • child_user_id(FK) │
│ • parent_email      │
│ • daily_time_limit  │
│ • content_filter    │
│ • notifications_on  │
│ • created_at        │
└─────────────────────┘

┌─────────────────────┐
│  🤖 AI_SESSION      │
│  (جلسات الذكاء)     │
├─────────────────────┤
│ • id                │
│ • user_id (FK)      │
│ • conversation []   │
│ • context_data      │
│ • preferences       │
│ • created_at        │
│ • updated_at        │
└─────────────────────┘

┌─────────────────────┐
│  👥 TEAM_CHALLENGE  │
│  (تحديات الفريق)    │
├─────────────────────┤
│ • id                │
│ • name              │
│ • description       │
│ • goal_kp           │
│ • current_kp        │
│ • participants []   │
│ • start_date        │
│ • end_date          │
│ • status            │
└─────────────────────┘

┌─────────────────────┐
│  📍 GEO_QUEST       │
│  (مهام GPS)         │
├─────────────────────┤
│ • id                │
│ • title             │
│ • latitude          │
│ • longitude         │
│ • radius_meters     │
│ • kp_reward         │
│ • is_active         │
│ • created_by        │
└─────────────────────┘
```

---

# 🔗 2. Entity Relationship Diagram (ERD) {#erd}

```
                    ┌─────────────────────────────────────────────────┐
                    │                                                 │
                    │           🎮 DOMAIN MODEL - ERD                │
                    │                                                 │
                    └─────────────────────────────────────────────────┘


        ┌──────────────┐
        │     USER     │◆─────────────────────────────────────┐
        │    👤        │                                       │
        └──────┬───────┘                                       │
               │                                               │
               │ 1                                             │
               │                                               │
               │                                               │
     ┌─────────┼─────────────────────┐                       │
     │         │                     │                        │
     │ 1       │ 1                   │ 1                      │ 1
     │         │                     │                        │
┌────▼────┐ ┌─▼────────┐      ┌────▼─────┐           ┌──────▼──────┐
│  STATS  │ │  AVATAR  │      │  IMPACT  │           │   PARENT    │
│   📊    │ │   🎨     │      │   💫     │           │  CONTROL    │
└─────────┘ └──────────┘      └──────────┘           │   👨‍👩‍👧      │
                                                      └─────────────┘
                                                      
     USER ◆───────────────────────────┐
       │ 1                             │
       │                               │ *
       │                          ┌────▼──────────┐
       │                          │  COMPLETED    │
       │                          │    QUEST      │
       │                          │     ✅        │
       │                          └────┬──────────┘
       │                               │
       │                               │ * belongs to
       │                               │
       │ *                             │ 1
       │                          ┌────▼──────────┐
       │                          │     QUEST     │
       ├──────────────────────────│      🎯       │
       │                          └────┬──────────┘
       │                               │
       │                               │ * belongs to
       │                               │
       │ *                             │ 1
       │                          ┌────▼──────────┐
       │                          │     ZONE      │
       │                          │     🗺️        │
       │                          └───────────────┘
       │
       │ *
       │
  ┌────▼──────────┐
  │  USER_BADGE   │
  │     🎖️        │◆───────────┐
  └───────────────┘            │
                               │ * belongs to
                               │
                               │ 1
                          ┌────▼──────────┐
                          │     BADGE     │
                          │      🏅       │
                          └───────────────┘


     USER ◆───────────────────────────┐
       │ 1                             │
       │                               │ *
       │                          ┌────▼──────────┐
       │                          │ TRANSACTION   │
       │                          │     💰        │
       │                          └────┬──────────┘
       │                               │
       │                               │ * for
       │                               │
       │                               │ 1
       │                          ┌────▼──────────┐
       │                          │  SHOP_ITEM    │
       │                          │     🛍️        │
       │                          └───────────────┘
       │
       │ *
       │
  ┌────▼──────────┐
  │  DAILY_TASK   │
  │     📅        │
  └───────────────┘
  
  
     USER ◆───────────────────────────┐
       │ 1                             │
       │                               │ *
       │                          ┌────▼──────────┐
       │                          │ NOTIFICATION  │
       │                          │     🔔        │
       │                          └───────────────┘
       │
       │ *
       │
  ┌────▼──────────┐
  │  AI_SESSION   │
  │     🤖        │
  └───────────────┘
  
  
     USER ◆───────────────────────────┐
       │ *                             │
       │                               │ *
       │                          ┌────▼──────────┐
       │                          │TEAM_CHALLENGE │
       └──────────────────────────│     👥        │
                                  └───────────────┘


┌───────────────────────────────────────────────────────────────┐
│                  🔗 Relationships Summary                     │
├───────────────────────────────────────────────────────────────┤
│ USER      1 ─── 1  USER_STATS                                │
│ USER      1 ─── 1  AVATAR                                     │
│ USER      1 ─── 1  IMPACT                                     │
│ USER      1 ─── *  COMPLETED_QUEST                            │
│ USER      1 ─── *  USER_BADGE                                 │
│ USER      1 ─── *  TRANSACTION                                │
│ USER      1 ─── *  DAILY_TASK                                 │
│ USER      1 ─── *  NOTIFICATION                               │
│ USER      1 ─── *  AI_SESSION                                 │
│ USER      * ─── *  TEAM_CHALLENGE                             │
│ USER      1 ─── 1  PARENT_CONTROL                             │
│                                                               │
│ ZONE      1 ─── *  QUEST                                      │
│ QUEST     1 ─── *  COMPLETED_QUEST                            │
│ QUEST     1 ─── 1  MINI_GAME                                  │
│                                                               │
│ BADGE     1 ─── *  USER_BADGE                                 │
│ SHOP_ITEM 1 ─── *  TRANSACTION                                │
└───────────────────────────────────────────────────────────────┘
```

---

# 📊 3. Complete Entity Relationship Diagram (ERD) {#erd}

```
═══════════════════════════════════════════════════════════════════════
                        🗄️ DATABASE SCHEMA
═══════════════════════════════════════════════════════════════════════


    ┌─────────────────────────────────────────────────────────┐
    │                    👤 USERS TABLE                       │
    ├─────────────────────────────────────────────────────────┤
    │ PK  id              UUID                                │
    │     username        VARCHAR(50)      UNIQUE, NOT NULL   │
    │     email           VARCHAR(100)     UNIQUE, NOT NULL   │
    │     password_hash   VARCHAR(255)     NOT NULL           │
    │     age             INTEGER                             │
    │     gender          VARCHAR(10)                         │
    │     created_at      TIMESTAMP        DEFAULT NOW()      │
    │     last_login      TIMESTAMP                           │
    │     is_active       BOOLEAN          DEFAULT TRUE       │
    │     parent_email    VARCHAR(100)                        │
    └─────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
    ┌─────────────────┐  ┌─────────────┐  ┌─────────────┐
    │  USER_STATS     │  │   AVATAR    │  │   IMPACT    │
    ├─────────────────┤  ├─────────────┤  ├─────────────┤
    │ PK id           │  │ PK id       │  │ PK id       │
    │ FK user_id      │  │ FK user_id  │  │ FK user_id  │
    │    level        │  │    name     │  │    category │
    │    xp           │  │    gender   │  │    points   │
    │    xp_needed    │  │    ...      │  │    ...      │
    │    kp           │  └─────────────┘  └─────────────┘
    │    impact_pts   │
    │    streak_days  │
    └─────────────────┘


    ┌─────────────────────────────────────────────────────────┐
    │                    🗺️ ZONES TABLE                      │
    ├─────────────────────────────────────────────────────────┤
    │ PK  id              UUID                                │
    │     title           VARCHAR(100)     NOT NULL           │
    │     description     TEXT                                │
    │     emoji           VARCHAR(10)                         │
    │     color           VARCHAR(50)                         │
    │     category        VARCHAR(50)                         │
    │     unlock_level    INTEGER          DEFAULT 1          │
    │     position_x      INTEGER                             │
    │     position_y      INTEGER                             │
    └─────────────────────────────────────────────────────────┘
                                │
                                │ 1
                                │
                                │ has many
                                │
                                │ *
                                ▼
    ┌─────────────────────────────────────────────────────────┐
    │                    🎯 QUESTS TABLE                      │
    ├─────────────────────────────────────────────────────────┤
    │ PK  id              UUID                                │
    │ FK  zone_id         UUID             NOT NULL           │
    │     title           VARCHAR(200)     NOT NULL           │
    │     description     TEXT                                │
    │     story           TEXT                                │
    │     difficulty      VARCHAR(20)                         │
    │     kp_reward       INTEGER          DEFAULT 0          │
    │     xp_reward       INTEGER          DEFAULT 0          │
    │     impact_reward   INTEGER          DEFAULT 0          │
    │     estimated_time  INTEGER                             │
    │     min_level       INTEGER          DEFAULT 1          │
    │     quest_type      VARCHAR(50)                         │
    │     npc_character   JSON                                │
    │     is_active       BOOLEAN          DEFAULT TRUE       │
    │     created_at      TIMESTAMP        DEFAULT NOW()      │
    └─────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │ 1             │ 1             │
                │               │               │
                ▼               ▼               │
    ┌─────────────────┐  ┌─────────────┐      │
    │   MINI_GAME     │  │   BONUS     │      │
    ├─────────────────┤  │   ACTIONS   │      │
    │ PK id           │  ├─────────────┤      │
    │ FK quest_id     │  │ PK id       │      │
    │    game_type    │  │ FK quest_id │      │
    │    config_json  │  │    label    │      │
    │    time_limit   │  │    kp       │      │
    └─────────────────┘  └─────────────┘      │
                                               │
                                               │
                                               │ *
                                               │ completed by
                                               │
                                               │ *
    ┌─────────────────────────────────────────▼───────────────┐
    │              ✅ COMPLETED_QUESTS TABLE                  │
    ├─────────────────────────────────────────────────────────┤
    │ PK  id              UUID                                │
    │ FK  user_id         UUID             NOT NULL           │
    │ FK  quest_id        UUID             NOT NULL           │
    │     score           INTEGER                             │
    │     time_taken      INTEGER          (seconds)          │
    │     bonus_actions   JSON                                │
    │     total_kp        INTEGER                             │
    │     total_xp        INTEGER                             │
    │     completed_at    TIMESTAMP        DEFAULT NOW()      │
    │                                                          │
    │ UNIQUE(user_id, quest_id)                               │
    └─────────────────────────────────────────────────────────┘


    ┌─────────────────────────────────────────────────────────┐
    │                    🏅 BADGES TABLE                      │
    ├─────────────────────────────────────────────────────────┤
    │ PK  id              UUID                                │
    │     name            VARCHAR(100)     NOT NULL           │
    │     description     TEXT                                │
    │     emoji           VARCHAR(10)                         │
    │     category        VARCHAR(50)                         │
    │     unlock_cond     JSON                                │
    │     rarity          VARCHAR(20)                         │
    │     icon_url        VARCHAR(255)                        │
    └─────────────────────────────────────────────────────────┘
                                │
                                │ 1
                                │
                                │ awarded to
                                │
                                │ *
                                ▼
    ┌─────────────────────────────────────────────────────────┐
    │                 🎖️ USER_BADGES TABLE                   │
    ├─────────────────────────────────────────────────────────┤
    │ PK  id              UUID                                │
    │ FK  user_id         UUID             NOT NULL           │
    │ FK  badge_id        UUID             NOT NULL           │
    │     progress        INTEGER          DEFAULT 0          │
    │     is_unlocked     BOOLEAN          DEFAULT FALSE      │
    │     unlocked_at     TIMESTAMP                           │
    │                                                          │
    │ UNIQUE(user_id, badge_id)                               │
    └─────────────────────────────────────────────────────────┘


    ┌─────────────────────────────────────────────────────────┐
    │                  🛍️ SHOP_ITEMS TABLE                   │
    ├─────────────────────────────────────────────────────────┤
    │ PK  id              UUID                                │
    │     name            VARCHAR(100)     NOT NULL           │
    │     description     TEXT                                │
    │     emoji           VARCHAR(10)                         │
    │     category        VARCHAR(50)                         │
    │     price_kp        INTEGER          NOT NULL           │
    │     unlock_level    INTEGER          DEFAULT 1          │
    │     is_available    BOOLEAN          DEFAULT TRUE       │
    │     rarity          VARCHAR(20)                         │
    │     image_url       VARCHAR(255)                        │
    └─────────────────────────────────────────────────────────┘
                                │
                                │ 1
                                │
                                │ purchased via
                                │
                                │ *
                                ▼
    ┌─────────────────────────────────────────────────────────┐
    │                💰 TRANSACTIONS TABLE                    │
    ├─────────────────────────────────────────────────────────┤
    │ PK  id              UUID                                │
    │ FK  user_id         UUID             NOT NULL           │
    │ FK  item_id         UUID             NOT NULL           │
    │     trans_type      VARCHAR(50)      (purchase/donate)  │
    │     amount_kp       INTEGER                             │
    │     status          VARCHAR(20)      (pending/complete) │
    │     created_at      TIMESTAMP        DEFAULT NOW()      │
    └─────────────────────────────────────────────────────────┘


    ┌─────────────────────────────────────────────────────────┐
    │                 📅 DAILY_TASKS TABLE                    │
    ├─────────────────────────────────────────────────────────┤
    │ PK  id              UUID                                │
    │ FK  user_id         UUID             NOT NULL           │
    │     task_type       VARCHAR(50)                         │
    │     task_desc       TEXT                                │
    │     kp_reward       INTEGER                             │
    │     is_completed    BOOLEAN          DEFAULT FALSE      │
    │     date            DATE             DEFAULT TODAY      │
    │     expires_at      TIMESTAMP                           │
    └─────────────────────────────────────────────────────────┘


    ┌─────────────────────────────────────────────────────────┐
    │                🔔 NOTIFICATIONS TABLE                    │
    ├─────────────────────────────────────────────────────────┤
    │ PK  id              UUID                                │
    │ FK  user_id         UUID             NOT NULL           │
    │     type            VARCHAR(50)                         │
    │     title           VARCHAR(200)                        │
    │     message         TEXT                                │
    │     icon            VARCHAR(10)                         │
    │     is_read         BOOLEAN          DEFAULT FALSE      │
    │     created_at      TIMESTAMP        DEFAULT NOW()      │
    │     action_url      VARCHAR(255)                        │
    └─────────────────────────────────────────────────────────┘


    ┌─────────────────────────────────────────────────────────┐
    │               ❤️ DONATIONS TABLE                        │
    ├─────────────────────────────────────────────────────────┤
    │ PK  id              UUID                                │
    │ FK  user_id         UUID             NOT NULL           │
    │     project_name    VARCHAR(200)                        │
    │     kp_amount       INTEGER                             │
    │     real_value_usd  DECIMAL(10,2)                       │
    │     partner_org     VARCHAR(200)                        │
    │     status          VARCHAR(20)                         │
    │     donated_at      TIMESTAMP        DEFAULT NOW()      │
    │     receipt_url     VARCHAR(255)                        │
    └─────────────────────────────────────────────────────────┘
```

---

# 🎯 4. Use Case Diagram {#usecase}

```
═══════════════════════════════════════════════════════════════════════
                         👥 ACTORS (الأطراف)
═══════════════════════════════════════════════════════════════════════

    👦                  👨‍💼                  🤖                  👨‍👩‍👧
   الطفل               المسؤول               AI System          الأهل
  (Child)             (Admin)             (Automated)        (Parents)

═══════════════════════════════════════════════════════════════════════
                      📋 USE CASES (حالات الاستخدام)
═══════════════════════════════════════════════════════════════════════


┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   🎮 GAME SYSTEM                                                   │
│                                                                     │
│   👦 ──────→ (UC-001: تسجيل حساب جديد)                            │
│   👦 ──────→ (UC-002: تسجيل الدخول)                               │
│   👦 ──────→ (UC-003: نسيان كلمة المرور)                          │
│   👦 ──────→ (UC-004: إنشاء الأفاتار)                             │
│             └──→ 📸 (UC-004a: رفع صورة + AI)                       │
│             └──→ 🎨 (UC-004b: تصميم يدوي)                          │
│                                                                     │
│   👦 ──────→ (UC-005: عرض Dashboard)                               │
│   👦 ──────→ (UC-006: فتح خريطة المدينة)                          │
│   👦 ──────→ (UC-007: اختيار منطقة)                               │
│             └──→ 🔒 إذا مقفل: عرض شروط الفتح                      │
│             └──→ ✅ إذا مفتوح: عرض المهام                         │
│                                                                     │
│   👦 ──────→ (UC-008: اختيار مهمة)                                │
│             └──→ 📖 قراءة القصة                                   │
│             └──→ 🎮 (UC-009: تنفيذ المهمة)                         │
│                  ├──→ Mini-game 1: قراءة الرسالة                  │
│                  ├──→ Mini-game 2: البحث عن الأشياء               │
│                  ├──→ Mini-game 3: الترتيب والتنظيم               │
│                  └──→ Mini-game 4: الألغاز                        │
│             └──→ ✅ (UC-010: إجراءات إضافية - اختياري)            │
│                                                                     │
│   👦 ──────→ (UC-011: استلام المكافآت)                            │
│             ├──→ ✨ KP Points                                      │
│             ├──→ 📈 XP Points                                      │
│             └──→ 💫 Impact Points                                  │
│                                                                     │
│   👦 ──────→ (UC-012: الترقي في المستوى)                          │
│             └──→ 🎊 Celebration animation                          │
│             └──→ 🎁 فتح محتوى جديد                                │
│                                                                     │
│   👦 ──────→ (UC-013: الحصول على شارة)                            │
│   👦 ──────→ (UC-014: عرض دفتر الإنجازات)                         │
│   👦 ──────→ (UC-015: عرض لوحة الشرف)                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   🛍️ SHOP & CUSTOMIZATION SYSTEM                                  │
│                                                                     │
│   👦 ──────→ (UC-016: فتح المتجر)                                 │
│             └──→ 👕 ملابس                                          │
│             └──→ ✨ إكسسوارات                                      │
│             └──→ 🏠 ديكورات                                        │
│                                                                     │
│   👦 ──────→ (UC-017: شراء عنصر)                                  │
│             ├──→ 💰 التحقق من KP                                  │
│             ├──→ 📊 التحقق من Level                               │
│             └──→ ✅ إتمام الشراء                                  │
│                                                                     │
│   👦 ──────→ (UC-018: تخصيص الأفاتار)                             │
│             └──→ 📸 AI Photo Avatar                                │
│             └──→ 🎨 Manual Customization                           │
│             └──→ 💾 حفظ التصاميم (Presets)                        │
│             └──→ 📤 مشاركة الأفاتار                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   🤖 AI SYSTEM                                                      │
│                                                                     │
│   👦 ──────→ (UC-019: التحدث مع المرشد)                           │
│             └──→ 💬 طرح أسئلة                                      │
│             └──→ 📚 الحصول على نصائح                              │
│             └──→ 💡 مقترحات مهام                                  │
│                                                                     │
│   🤖 ──────→ (UC-020: توليد قصص ديناميكية)                        │
│   🤖 ──────→ (UC-021: تخصيص المهام)                               │
│             └──→ حسب العمر                                         │
│             └──→ حسب الاهتمامات                                   │
│             └──→ حسب المستوى                                       │
│                                                                     │
│   🤖 ──────→ (UC-022: تعديل الصعوبة)                              │
│             ├──→ 📉 إذا فشل 3 مرات → تسهيل                       │
│             └──→ 📈 إذا نجح بسرعة → تصعيب                        │
│                                                                     │
│   🤖 ──────→ (UC-023: تحليل السلوك)                               │
│   🤖 ──────→ (UC-024: توليد AI Avatar)                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   💫 IMPACT & DONATION SYSTEM                                      │
│                                                                     │
│   👦 ──────→ (UC-025: عرض التأثير الكلي)                          │
│   👦 ──────→ (UC-026: تحويل KP لتبرع حقيقي)                       │
│             ├──→ 🍲 إطعام أطفال                                   │
│             ├──→ 🌳 زراعة أشجار                                   │
│             ├──→ 📚 شراء كتب                                       │
│             └──→ 💧 توفير مياه نظيفة                              │
│                                                                     │
│   👦 ──────→ (UC-027: عرض سجل التبرعات)                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   👨‍👩‍👧 PARENTAL CONTROL SYSTEM                                     │
│                                                                     │
│   👨‍👩‍👧 ──────→ (UC-028: عرض إحصائيات الطفل)                        │
│             ├──→ ⏱️ وقت اللعب                                      │
│             ├──→ 📊 المهام المكتملة                               │
│             ├──→ ✨ النقاط المكتسبة                                │
│             └──→ 💫 التأثير المُحدث                                │
│                                                                     │
│   👨‍👩‍👧 ──────→ (UC-029: ضبط حد وقت اللعب)                         │
│   👨‍👩‍👧 ──────→ (UC-030: تفعيل/تعطيل المحتوى)                      │
│   👨‍👩‍👧 ──────→ (UC-031: تحميل تقرير PDF)                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   👨‍💼 ADMIN SYSTEM                                                 │
│                                                                     │
│   👨‍💼 ──────→ (UC-032: تسجيل دخول Admin)                          │
│   👨‍💼 ──────→ (UC-033: عرض Dashboard)                             │
│             ├──→ 📊 إجمالي المستخدمين                            │
│             ├──→ 📈 المستخدمين النشطين                            │
│             ├──→ 🎯 المهام المكتملة اليوم                         │
│             └──→ 💰 KP الموزعة                                     │
│                                                                     │
│   👨‍💼 ──────→ (UC-034: إدارة المستخدمين)                         │
│             ├──→ 👁️ عرض                                            │
│             ├──→ 🚫 حظر/إلغاء حظر                                 │
│             └──→ 🗑️ حذف                                            │
│                                                                     │
│   👨‍💼 ──────→ (UC-035: إدارة المحتوى)                            │
│             ├──→ ➕ إضافة سيناريو جديد                             │
│             ├──→ ✏️ تعديل سيناريو                                  │
│             ├──→ 🗑️ حذف سيناريو                                   │
│             └──→ 👁️ معاينة                                         │
│                                                                     │
│   👨‍💼 ──────→ (UC-036: إدارة الشارات)                            │
│   👨‍💼 ──────→ (UC-037: عرض التقارير)                             │
│   👨‍💼 ──────→ (UC-038: إدارة الشراكات)                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   🌐 SOCIAL & TEAM FEATURES                                        │
│                                                                     │
│   👦 ──────→ (UC-039: إضافة صديق)                                 │
│   👦 ──────→ (UC-040: عرض نشاط الأصدقاء)                          │
│   👦 ──────→ (UC-041: الانضمام لتحدي فريق)                        │
│   👦 ──────→ (UC-042: إنشاء تحدي فريق)                            │
│   👦 ──────→ (UC-043: المساهمة في التحدي)                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   📍 LOCATION-BASED FEATURES                                       │
│                                                                     │
│   👦 ──────→ (UC-044: تفعيل GPS)                                   │
│   👦 ──────→ (UC-045: اكتشاف مهام قريبة)                          │
│   👦 ──────→ (UC-046: Check-in في موقع)                            │
│   👦 ──────→ (UC-047: إكمال Geo-Quest)                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

# 🏗️ 5. System Architecture Diagram {#architecture}

```
═══════════════════════════════════════════════════════════════════════
                    🏗️ SYSTEM ARCHITECTURE
═══════════════════════════════════════════════════════════════════════


┌─────────────────────────────────────────────────────────────────────┐
│                        📱 CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Web App    │  │  Mobile App  │  │  Admin Panel │            │
│  │   (React)    │  │ (React Native)│  │   (React)    │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                  │                  │                     │
└─────────┼──────────────────┼──────────────────┼─────────────────────┘
          │                  │                  │
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                             │ HTTPS/REST API
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                      🔧 API GATEWAY LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │           🌐 .NET Web API (ASP.NET Core)               │       │
│  │                                                         │       │
│  │  • Authentication Middleware (JWT)                     │       │
│  │  • CORS Configuration                                  │       │
│  │  • Rate Limiting                                       │       │
│  │  • Request Logging                                     │       │
│  │  • Error Handling                                      │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                    ⚙️ APPLICATION LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Auth       │  │    Game      │  │     AI       │            │
│  │  Service     │  │   Engine     │  │   Service    │            │
│  │              │  │              │  │              │            │
│  │ • Register   │  │ • XP Calc    │  │ • Stories    │            │
│  │ • Login      │  │ • Level Up   │  │ • Hints      │            │
│  │ • JWT        │  │ • Rewards    │  │ • Avatar Gen │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Quest      │  │    Shop      │  │   Impact     │            │
│  │  Service     │  │   Service    │  │   Service    │            │
│  │              │  │              │  │              │            │
│  │ • Complete   │  │ • Purchase   │  │ • Track      │            │
│  │ • Track      │  │ • Inventory  │  │ • Convert    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                    💾 DATA ACCESS LAYER                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │         📦 Repository Pattern                           │       │
│  │                                                         │       │
│  │  • UserRepository                                      │       │
│  │  • QuestRepository                                     │       │
│  │  • BadgeRepository                                     │       │
│  │  • ShopRepository                                      │       │
│  │  • ImpactRepository                                    │       │
│  │  • NotificationRepository                              │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             │ Entity Framework Core
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                     🗄️ DATABASE LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │              🐘 PostgreSQL Database                     │       │
│  │                                                         │       │
│  │  Tables:                                               │       │
│  │  • users                    • completed_quests          │       │
│  │  • user_stats               • badges                    │       │
│  │  • avatars                  • user_badges               │       │
│  │  • zones                    • shop_items                │       │
│  │  • quests                   • transactions              │       │
│  │  • mini_games               • daily_tasks               │       │
│  │  • impact                   • notifications             │       │
│  │  • donations                • ai_sessions               │       │
│  │  • parent_controls          • team_challenges           │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                  🔌 EXTERNAL SERVICES                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   OpenAI     │  │  Replicate   │  │   Payment    │            │
│  │   GPT-4      │  │  Toonify AI  │  │   Gateway    │            │
│  │              │  │              │  │              │            │
│  │ • Stories    │  │ • Avatar Gen │  │ • Donations  │            │
│  │ • Chat       │  │ • Image-to-  │  │ • KP to $    │            │
│  │ • Hints      │  │   Image      │  │              │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Email      │  │    SMS       │  │   Cloud      │            │
│  │  Service     │  │   Service    │  │   Storage    │            │
│  │              │  │              │  │              │            │
│  │ • Verify     │  │ • 2FA        │  │ • Images     │            │
│  │ • Reset Pwd  │  │ • Alerts     │  │ • Avatars    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

# 📊 6. Data Flow Diagrams {#dataflow}

## 🎮 Quest Completion Flow

```
═══════════════════════════════════════════════════════════════════════
                    🎯 QUEST COMPLETION FLOW
═══════════════════════════════════════════════════════════════════════

  👦 Child                 📱 Frontend              🔧 Backend              🗄️ Database
    │                          │                      │                       │
    │  1. Click Quest          │                      │                       │
    ├─────────────────────────>│                      │                       │
    │                          │                      │                       │
    │                          │  2. GET /quest/{id}  │                       │
    │                          ├─────────────────────>│                       │
    │                          │                      │  3. SELECT quest      │
    │                          │                      ├──────────────────────>│
    │                          │                      │<──────────────────────┤
    │                          │<─────────────────────┤  4. quest data        │
    │                          │  quest + story       │                       │
    │  5. Show story           │                      │                       │
    │<─────────────────────────┤                      │                       │
    │                          │                      │                       │
    │  6. Play mini-game       │                      │                       │
    │  (user interaction)      │                      │                       │
    │                          │                      │                       │
    │  7. Submit result        │                      │                       │
    ├─────────────────────────>│                      │                       │
    │                          │ 8. POST /complete    │                       │
    │                          ├─────────────────────>│                       │
    │                          │                      │  9. Calculate rewards │
    │                          │                      │     base_kp + bonus   │
    │                          │                      │     xp calculation    │
    │                          │                      │     impact points     │
    │                          │                      │                       │
    │                          │                      │ 10. INSERT completed  │
    │                          │                      ├──────────────────────>│
    │                          │                      │                       │
    │                          │                      │ 11. UPDATE user_stats │
    │                          │                      ├──────────────────────>│
    │                          │                      │                       │
    │                          │                      │ 12. CHECK level_up?   │
    │                          │                      │     if xp >= needed   │
    │                          │                      │                       │
    │                          │                      │ 13. UPDATE level      │
    │                          │                      ├──────────────────────>│
    │                          │                      │                       │
    │                          │                      │ 14. CHECK badges      │
    │                          │                      │                       │
    │                          │                      │ 15. INSERT notif      │
    │                          │                      ├──────────────────────>│
    │                          │                      │                       │
    │                          │<─────────────────────┤ 16. Return response   │
    │                          │  rewards + level_up  │                       │
    │  17. Show celebration    │                      │                       │
    │<─────────────────────────┤                      │                       │
    │  🎉 Confetti!            │                      │                       │
    │  ⬆️ Level 5 → 6!        │                      │                       │
    │  ✨ +120 KP              │                      │                       │
    │                          │                      │                       │
```

---

## 🤖 AI Avatar Generation Flow

```
═══════════════════════════════════════════════════════════════════════
                    📸 AI AVATAR GENERATION FLOW
═══════════════════════════════════════════════════════════════════════

  👦 Child              📱 Frontend           🔧 Backend          🤖 AI Service      🗄️ Storage
    │                       │                    │                    │                │
    │ 1. Upload photo       │                    │                    │                │
    ├──────────────────────>│                    │                    │                │
    │                       │                    │                    │                │
    │                       │ 2. Validate        │                    │                │
    │                       │   (size, type)     │                    │                │
    │                       │                    │                    │                │
    │                       │ 3. POST /avatar    │                    │                │
    │                       │    /generate       │                    │                │
    │                       ├───────────────────>│                    │                │
    │                       │  {photo_base64}    │                    │                │
    │                       │                    │                    │                │
    │                       │                    │ 4. Call Replicate  │                │
    │                       │                    │    Toonify API     │                │
    │                       │                    ├───────────────────>│                │
    │                       │                    │  {image, style}    │                │
    │                       │                    │                    │                │
    │                       │                    │                    │ 5. Process     │
    │                       │                    │                    │   (5-15 sec)   │
    │                       │                    │                    │                │
    │ 6. Show progress      │                    │                    │                │
    │   0% → 90%            │                    │                    │                │
    │<──────────────────────┤                    │                    │                │
    │                       │                    │<───────────────────┤ 6. Return URL  │
    │                       │                    │  cartoon_image_url │                │
    │                       │                    │                    │                │
    │                       │                    │ 7. Download image  │                │
    │                       │                    │                    │                │
    │                       │                    │ 8. Upload to cloud │                │
    │                       │                    ├────────────────────────────────────>│
    │                       │                    │                    │                │
    │                       │                    │ 9. Save to DB      │                │
    │                       │                    │   avatar_url       │                │
    │                       │                    │                    │                │
    │                       │<───────────────────┤ 10. Return         │                │
    │                       │  {avatar_url}      │                    │                │
    │                       │                    │                    │                │
    │ 11. Display avatar    │                    │                    │                │
    │   ✨ 100%             │                    │                    │                │
    │<──────────────────────┤                    │                    │                │
    │                       │                    │                    │                │
```

---

## 💰 KP to Real Donation Flow

```
═══════════════════════════════════════════════════════════════════════
                  💝 DONATION CONVERSION FLOW
═══════════════════════════════════════════════════════════════════════

  👦 Child              📱 Frontend           🔧 Backend          🏢 Partner NGO
    │                       │                    │                    │
    │ 1. Select project     │                    │                    │
    │   "إطعام 5 أطفال"     │                    │                    │
    │   Cost: 1000 KP       │                    │                    │
    ├──────────────────────>│                    │                    │
    │                       │                    │                    │
    │ 2. Confirm donation   │                    │                    │
    ├──────────────────────>│                    │                    │
    │                       │                    │                    │
    │                       │ 3. POST /donate    │                    │
    │                       ├───────────────────>│                    │
    │                       │  {project, kp}     │                    │
    │                       │                    │                    │
    │                       │                    │ 4. Verify KP       │
    │                       │                    │   balance          │
    │                       │                    │                    │
    │                       │                    │ 5. Deduct KP       │
    │                       │                    │   1000 KP → 0 KP   │
    │                       │                    │                    │
    │                       │                    │ 6. Convert to $    │
    │                       │                    │   1000 KP = $15    │
    │                       │                    │                    │
    │                       │                    │ 7. Create donation │
    │                       │                    │    record          │
    │                       │                    │                    │
    │                       │                    │ 8. API call to NGO │
    │                       │                    ├───────────────────>│
    │                       │                    │  {$15, project}    │
    │                       │                    │                    │
    │                       │                    │<───────────────────┤
    │                       │                    │  {receipt, status} │
    │                       │                    │                    │
    │                       │                    │ 9. Update impact   │
    │                       │                    │   +5 children fed  │
    │                       │                    │                    │
    │                       │<───────────────────┤ 10. Return success │
    │                       │  {receipt, impact} │                    │
    │                       │                    │                    │
    │ 11. Show success      │                    │                    │
    │   🎉 "لقد ساهمت      │                    │                    │
    │   في إطعام 5 أطفال!" │                    │                    │
    │<──────────────────────┤                    │                    │
    │                       │                    │                    │
```

---

# 🎨 7. Class Diagram (Simplified) {#classdiagram}

```
═══════════════════════════════════════════════════════════════════════
                        📐 CLASS DIAGRAM
═══════════════════════════════════════════════════════════════════════


┌─────────────────────────────────────────────────────────────────────┐
│                        <<Service Layer>>                            │
└─────────────────────────────────────────────────────────────────────┘

        ┌────────────────────┐
        │   AuthService      │
        ├────────────────────┤
        │ - jwtSecret        │
        ├────────────────────┤
        │ + register()       │
        │ + login()          │
        │ + validateToken()  │
        │ + hashPassword()   │
        └────────────────────┘

        ┌────────────────────┐
        │   GameEngine       │
        ├────────────────────┤
        │ - xpCurve[]        │
        ├────────────────────┤
        │ + calculateXP()    │
        │ + checkLevelUp()   │
        │ + calculateKP()    │
        │ + grantRewards()   │
        └────────────────────┘

        ┌────────────────────┐
        │   QuestService     │
        ├────────────────────┤
        │ - repository       │
        ├────────────────────┤
        │ + getAllQuests()   │
        │ + getQuestById()   │
        │ + completeQuest()  │
        │ + trackProgress()  │
        └────────────────────┘

        ┌────────────────────┐
        │    AIService       │
        ├────────────────────┤
        │ - openaiClient     │
        │ - replicateClient  │
        ├────────────────────┤
        │ + generateStory()  │
        │ + generateHint()   │
        │ + generateAvatar() │
        │ + chatResponse()   │
        └────────────────────┘

        ┌────────────────────┐
        │   ShopService      │
        ├────────────────────┤
        │ - repository       │
        ├────────────────────┤
        │ + getItems()       │
        │ + purchaseItem()   │
        │ + checkUnlock()    │
        │ + deductKP()       │
        └────────────────────┘

        ┌────────────────────┐
        │  ImpactService     │
        ├────────────────────┤
        │ - repository       │
        ├────────────────────┤
        │ + trackImpact()    │
        │ + convertKP()      │
        │ + createDonation() │
        │ + getStats()       │
        └────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      <<Repository Layer>>                           │
└─────────────────────────────────────────────────────────────────────┘

        ┌────────────────────┐
        │  IRepository<T>    │
        ├────────────────────┤
        │ + GetAll()         │
        │ + GetById(id)      │
        │ + Add(entity)      │
        │ + Update(entity)   │
        │ + Delete(id)       │
        └────────┬───────────┘
                 │
                 │ implements
                 │
        ┌────────┴───────────┐
        │                    │
        │  UserRepository    │
        │  QuestRepository   │
        │  BadgeRepository   │
        │  ShopRepository    │
        │  etc...            │
        └────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      <<Domain Models>>                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│      User        │ 1 ─── 1 │    UserStats     │
├──────────────────┤         ├──────────────────┤
│ - id             │         │ - userId         │
│ - username       │         │ - level          │
│ - email          │         │ - xp             │
│ - passwordHash   │         │ - kp             │
├──────────────────┤         ├──────────────────┤
│ + validateEmail()│         │ + addXP()        │
│ + checkPassword()│         │ + addKP()        │
└──────────────────┘         │ + levelUp()      │
                             └──────────────────┘

┌──────────────────┐         ┌──────────────────┐
│      Quest       │ * ─── 1 │       Zone       │
├──────────────────┤         ├──────────────────┤
│ - id             │         │ - id             │
│ - zoneId         │         │ - title          │
│ - title          │         │ - unlockLevel    │
│ - kpReward       │         ├──────────────────┤
├──────────────────┤         │ + isUnlocked()   │
│ + calculateScore()│         └──────────────────┘
│ + grantReward()  │
└──────────────────┘

┌──────────────────┐         ┌──────────────────┐
│      Badge       │ 1 ─── * │    UserBadge     │
├──────────────────┤         ├──────────────────┤
│ - id             │         │ - userId         │
│ - name           │         │ - badgeId        │
│ - unlockCond     │         │ - progress       │
├──────────────────┤         │ - isUnlocked     │
│ + checkUnlock()  │         ├──────────────────┤
└──────────────────┘         │ + updateProgress()│
                             │ + unlock()       │
                             └──────────────────┘
```

---

# 🔄 8. State Machine Diagram - User Journey {#statemachine}

```
═══════════════════════════════════════════════════════════════════════
                    🔄 USER STATE MACHINE
═══════════════════════════════════════════════════════════════════════


          ⭕ START
            │
            ▼
     ┌─────────────┐
     │   GUEST     │
     │  (زائر)     │
     └──────┬──────┘
            │
            │ register/login
            ▼
     ┌─────────────┐
     │ REGISTERED  │
     │ (مُسجل)     │
     └──────┬──────┘
            │
            │ create avatar
            ▼
     ┌─────────────┐
     │   ONBOARD   │
     │  (تعريف)    │
     └──────┬──────┘
            │
            │ complete tutorial
            ▼
     ┌─────────────┐
     │   ACTIVE    │◄─────────────┐
     │  (نشط)      │              │
     └──────┬──────┘              │
            │                     │
            │ select quest        │
            ▼                     │
     ┌─────────────┐              │
     │   IN_QUEST  │              │
     │ (في مهمة)   │              │
     └──────┬──────┘              │
            │                     │
            │ complete            │
            ▼                     │
     ┌─────────────┐              │
     │  REWARDED   │              │
     │ (استلم جائزة)│              │
     └──────┬──────┘              │
            │                     │
            │ level up?           │
            ▼                     │
         ┌──────┐                 │
         │  No  │─────────────────┘
         └──────┘
            │
            │ Yes
            ▼
     ┌─────────────┐
     │  LEVEL_UP   │
     │ (ترقية!)    │
     └──────┬──────┘
            │
            │ celebration done
            └──────────────────────┘


═══════════════════════════════════════════════════════════════════════
                    🎯 QUEST STATE MACHINE
═══════════════════════════════════════════════════════════════════════

     ┌─────────────┐
     │  AVAILABLE  │
     │  (متاح)     │
     └──────┬──────┘
            │
            │ user selects
            ▼
     ┌─────────────┐
     │   READING   │
     │ (قراءة القصة)│
     └──────┬──────┘
            │
            │ accept quest
            ▼
     ┌─────────────┐
     │   ACTIVE    │
     │  (نشط)      │
     └──────┬──────┘
            │
            │ start mini-game
            ▼
     ┌─────────────┐
     │  IN_PROGRESS│
     │ (قيد التنفيذ)│
     └──────┬──────┘
            │
         ┌──┴──┐
         │     │
      Success  Fail
         │     │
         │     ▼
         │  ┌─────────┐
         │  │ FAILED  │
         │  │(فشل)    │
         │  └────┬────┘
         │       │
         │       │ retry
         │       └───────┐
         │               │
         ▼               ▼
     ┌─────────────┐  ┌─────────────┐
     │  COMPLETED  │  │   RETRY     │
     │  (مكتمل)    │  │ (إعادة)     │
     └──────┬──────┘  └─────────────┘
            │
            │ bonus actions?
            ▼
         ┌──────┐
         │  No  │───────┐
         └──────┘       │
            │           │
            │ Yes       │
            ▼           │
     ┌─────────────┐    │
     │   BONUS     │    │
     │ (إضافات)    │    │
     └──────┬──────┘    │
            │           │
            └───────┬───┘
                    │
                    ▼
             ┌─────────────┐
             │  REWARDED   │
             │ (تم الجائزة)│
             └─────────────┘
```

---

# 📋 9. Complete Use Cases List {#usecaselist}

```
═══════════════════════════════════════════════════════════════════════
              📚 COMPLETE USE CASES CATALOG (50+ Use Cases)
═══════════════════════════════════════════════════════════════════════

🔐 Authentication & Onboarding (UC-001 to UC-005)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UC-001: تسجيل حساب جديد
UC-002: تسجيل الدخول
UC-003: نسيان كلمة المرور
UC-004: إنشاء الأفاتار
  UC-004a: رفع صورة + AI
  UC-004b: تصميم يدوي
UC-005: Tutorial (شرح اللعبة)

🗺️ Navigation & Exploration (UC-006 to UC-010)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UC-006: عرض خريطة المدينة
UC-007: اختيار منطقة
UC-008: عرض تفاصيل المنطقة
UC-009: عرض قائمة المهام
UC-010: فتح موقع مقفل

🎯 Quest System (UC-011 to UC-020)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UC-011: قراءة قصة المهمة
UC-012: قبول المهمة
UC-013: تنفيذ المهمة
  UC-013a: Mini-game - قراءة الرسالة
  UC-013b: Mini-game - البحث عن الأشياء
  UC-013c: Mini-game - الترتيب
  UC-013d: Mini-game - الألغاز
UC-014: إكمال المهمة
UC-015: اختيار إجراءات إضافية
UC-016: استلام المكافآت
UC-017: الاحتفال بالإنجاز
UC-018: الترقي في المستوى
UC-019: الحصول على شارة
UC-020: إعادة محاولة المهمة

🏅 Progress & Achievement (UC-021 to UC-025)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UC-021: عرض دفتر الإنجازات
UC-022: عرض الشارات
UC-023: عرض التقدم نحو شارة
UC-024: عرض لوحة الشرف
UC-025: عرض رتبة اللاعب

🛍️ Shop & Customization (UC-026 to UC-032)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UC-026: فتح المتجر
UC-027: تصفح الأغراض
UC-028: شراء عنصر
UC-029: تخصيص الأفاتار
UC-030: تغيير الملابس
UC-031: حفظ تصميم (Preset)
UC-032: تحميل تصميم محفوظ

💫 Impact & Donation (UC-033 to UC-037)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UC-033: عرض التأثير الكلي
UC-034: عرض تفصيل التأثير
UC-035: اختيار مشروع تبرع
UC-036: تحويل KP لتبرع حقيقي
UC-037: عرض سجل التبرعات

🤖 AI System (UC-038 to UC-042)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UC-038: فتح المرشد الذكي
UC-039: طرح سؤال على AI
UC-040: الحصول على نصيحة
UC-041: طلب مقترحات مهام
UC-042: توليد AI Avatar

👨‍👩‍👧 Parental Controls (UC-043 to UC-047)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UC-043: تسجيل دخول الأهل
UC-044: عرض نشاط الطفل
UC-045: ضبط وقت اللعب
UC-046: تفعيل/تعطيل محتوى
UC-047: تحميل تقرير

📅 Daily System (UC-048 to UC-050)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UC-048: عرض المهام اليومية
UC-049: إكمال مهمة يومية
UC-050: استلام مكافأة يومية

👥 Social & Team (UC-051 to UC-055)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UC-051: إضافة صديق
UC-052: عرض نشاط الأصدقاء
UC-053: الانضمام لتحدي فريق
UC-054: إنشاء تحدي فريق
UC-055: المساهمة في هدف التحدي

📍 Location-Based (UC-056 to UC-059)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UC-056: تفعيل GPS
UC-057: اكتشاف مهام قريبة
UC-058: Check-in في موقع
UC-059: إكمال Geo-Quest

👨‍💼 Admin Functions (UC-060 to UC-068)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UC-060: تسجيل دخول Admin
UC-061: عرض Dashboard
UC-062: إدارة المستخدمين
UC-063: إضافة سيناريو جديد
UC-064: تعديل سيناريو
UC-065: حذف سيناريو
UC-066: إدارة الشارات
UC-067: عرض Analytics
UC-068: إدارة الشراكات
```

---

# 🎨 10. Component Architecture {#componentarch}

```
═══════════════════════════════════════════════════════════════════════
                  📦 FRONTEND COMPONENT STRUCTURE
═══════════════════════════════════════════════════════════════════════


                        ┌──────────────┐
                        │     App      │
                        │   (Root)     │
                        └──────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │  AuthScreen  │ │   TopBar     │ │   Sidebar    │
      └──────────────┘ └──────────────┘ └──────────────┘
                               │
              ┌────────────────┼────────────────────────┐
              │                │                        │
              ▼                ▼                        ▼
      ┌──────────────┐ ┌──────────────┐        ┌──────────────┐
      │ DashboardCard│ │    XpBar     │        │  Background  │
      └──────────────┘ └──────────────┘        │  Components  │
                                                └──────────────┘


                        ┌──────────────┐
                        │   TabRouter  │
                        └──────┬───────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       │           │           │           │           │
       ▼           ▼           ▼           ▼           ▼
  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
  │ MapTab │ │BadgeTab│ │Profile │ │ Impact │ │Parents │
  └────────┘ └────────┘ │  Tab   │ └────────┘ └────────┘
                        └───┬────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
      ┌──────────────┐ ┌──────────┐ ┌──────────┐
      │   Basic      │ │ Advanced │ │   Shop   │
      │Customization │ │   Tab    │ │   Tab    │
      └──────────────┘ └──────────┘ └──────────┘
              │
              ▼
      ┌──────────────┐
      │Avatar Preview│
      └──────────────┘


                        ┌──────────────┐
                        │    Modals    │
                        └──────┬───────┘
                               │
       ┌───────────────────────┼───────────────┐
       │           │           │               │
       ▼           ▼           ▼               ▼
  ┌────────┐ ┌────────┐ ┌──────────┐  ┌──────────────┐
  │Tutorial│ │LevelUp │ │ZoneDetail│  │  QuestModal  │
  │ Modal  │ │ Modal  │ │  Modal   │  │              │
  └────────┘ └────────┘ └──────────┘  └──────┬───────┘
                                             │
                                             ▼
                                     ┌──────────────┐
                                     │  Mini-games  │
                                     │  Components  │
                                     └──────────────┘
```

---

**🎉 Domain Model كامل! جاهز للرسم على Figma أو أي أداة تصميم! ✨**
