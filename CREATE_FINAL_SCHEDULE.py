# -*- coding: utf-8 -*-
import re

# قراءة الملف الأصلي
with open('TEAM_TASKS_SCHEDULE_BACKUP.md', 'r', encoding='utf-8') as f:
    content = f.read()

# تعديل دور عبدالله من Frontend إلى AI
content = content.replace(
    '| **عبدالله الشامي** | Frontend Developer | React |',
    '| **عبدالله الشامي** | AI Specialist | AI Development & Integration |'
)

# تعديل كل العناوين الخاصة بعبدالله
content = re.sub(
    r'## 👨‍💻 عبدالله الشامي \(Frontend.*?\)',
    '## 👨‍💻 عبدالله الشامي (AI Specialist)',
    content
)

# تعديل ملخص المهام
content = content.replace(
    '## عبدالله الشامي (Frontend Developer)',
    '## عبدالله الشامي (AI Specialist)'
)

# الآن نبدأ في تغيير محتوى مهام عبدالله

# اليوم الأول - عبدالله
day1_old = """## 👨‍💻 عبدالله الشامي (AI Specialist)

### 9:30 - 10:00: اجتماع Kick-off
- فهم المشروع والـ Architecture
- استلام المهام

### 10:00 - 12:30: Project Setup & Auth UI
- ✅ إعداد React Project (Vite)
- ✅ تركيب المكتبات:
  - React Router DOM
  - Axios
  - Lucide React (Icons)
- ✅ إنشاء هيكل المجلدات
- ✅ تصميم AuthScreen Component
  - Login Form
  - Register Form
  - Form Validation

### 1:30 - 4:00: Avatar Creation Screen
- ✅ تصميم Avatar Creator Component
- ✅ تنفيذ اختيارات:
  - Gender Selection
  - Skin Color
  - Hair Style
  - Hair Color
  - Accessories
- ✅ Live Preview للأفاتار
- ✅ حفظ بيانات الأفاتار في State

### 4:00 - 4:30: Daily Review"""

day1_new = """## 👨‍💻 عبدالله الشامي (AI Specialist)

### 9:30 - 10:00: اجتماع Kick-off
- فهم المشروع والـ AI Requirements
- استلام المهام

### 10:00 - 12:30: AI Research & Setup
- ✅ دراسة AI Models المناسبة (GPT-4, Claude, Gemini)
- ✅ تقييم Costs & Capabilities
- ✅ إنشاء AI Service Architecture
- ✅ تصميم Prompt Strategy:
  - Story Templates
  - Character Generation
  - Dialogue System

### 1:30 - 4:00: AI Content Generation Engine
- ✅ إعداد OpenAI/Claude API Integration
- ✅ تصميم Story Generator:
  - Dynamic scenario creation
  - Age-appropriate language
  - Moral lessons integration
- ✅ Testing initial prompts
- ✅ Documentation

### 4:00 - 4:30: Daily Review"""

content = content.replace(day1_old, day1_new)

# اليوم الثاني - عبدالله
day2_old = """### 9:30 - 10:00: Daily Standup

### 10:00 - 12:30: Home Dashboard
- ✅ Dashboard Layout
- ✅ DashboardCards Component:
  - Total KP Card
  - Current Level Card
  - Completed Quests Card
  - Impact Points Card
- ✅ XP Progress Bar
- ✅ Active Missions Section

### 1:30 - 4:00: Map Tab - City Map
- ✅ MapTab Component
- ✅ تصميم Isometric Map View
- ✅ Zone Pins (8 zones)
- ✅ Zone States:
  - Available (full color)
  - Locked (grayscale + lock icon)
  - Active (glowing effect)

### 4:00 - 4:30: Testing & Review"""

# نجد موقعها بعد "## 👨‍💻 عبدالله الشامي (AI Specialist)" في اليوم الثاني
day2_pattern = r'(# 🗓️ اليوم الثاني.*?## 👨‍💻 عبدالله الشامي \(AI Specialist\)\s*### 9:30 - 10:00: Daily Standup\s*)(### 10:00 - 12:30:.*?### 4:00 - 4:30:.*?)(\n---)'

day2_replacement = r"""\1### 10:00 - 12:30: AI Character Development
- ✅ تصميم AI Mentor Character (مرشد العطاء):
  - Personality traits
  - Tone & Voice
  - Response patterns
- ✅ Conversation Flow Design
- ✅ Context Management System
- ✅ Multi-turn dialogue handling

### 1:30 - 4:00: Adaptive Learning AI
- ✅ User Profiling System:
  - Track child's preferences
  - Difficulty adaptation
  - Learning pace analysis
- ✅ Progressive Hints System
- ✅ Success/Failure response generation
- ✅ Testing & Refinement

### 4:00 - 4:30: AI Testing\3"""

content = re.sub(day2_pattern, day2_replacement, content, count=1, flags=re.DOTALL)

# حفظ الملف الجديد
with open('TEAM_TASKS_SCHEDULE_FINAL.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ تم إنشاء الملف الجديد بنجاح!")
print("📄 اسم الملف: TEAM_TASKS_SCHEDULE_FINAL.md")
