# 🎨 Design System Documentation

## المحتويات
- [نظرة عامة](#نظرة-عامة)
- [التركيب](#التركيب)
- [Tokens](#tokens)
- [المكونات](#المكونات)
- [أمثلة الاستخدام](#أمثلة-الاستخدام)

---

## نظرة عامة

نظام تصميم متكامل لمشروع **مدينة العطاء** يوفر:
- ✅ **Clean Code** - كود نظيف وسهل الصيانة
- ✅ **No CSS Files** - كل الأنماط inline في JavaScript
- ✅ **Design Tokens** - نظام موحد للألوان والخطوط والمسافات
- ✅ **Reusable Components** - مكونات قابلة لإعادة الاستخدام
- ✅ **TypeScript Ready** - جاهز للتحويل إلى TypeScript

---

## التركيب

```bash
src/
└── design-system/
    ├── tokens/
    │   ├── colors.js       # الألوان والتدرجات
    │   ├── typography.js   # الخطوط
    │   ├── spacing.js      # المسافات والظلال
    │   ├── animations.js   # الحركات
    │   └── index.js        # تجميع كل ال tokens
    └── components/
        └── Button.jsx      # مكون الزر
```

---

## Tokens

### 🎨 Colors

```javascript
import { colors, gradients } from '@/design-system/tokens';

// استخدام الألوان
const style = {
  background: colors.primary[500],  // #f59e0b
  color: colors.neutral[0],         // #ffffff
};

// استخدام التدرجات
const gradientStyle = {
  background: gradients.primary,
};
```

#### الألوان المتاحة:
- `primary` - الذهبي (العلامة التجارية)
- `success` - الأخضر
- `warning` - البرتقالي
- `danger` - الأحمر
- `info` - الأزرق
- `purple` - البنفسجي
- `neutral` - الرمادي

### ✍️ Typography

```javascript
import { typography } from '@/design-system/tokens';

const textStyle = {
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.bold,
};

// استخدام الأنماط الجاهزة
const headingStyle = typography.styles.h1;
```

### 📏 Spacing

```javascript
import { spacing, borderRadius, shadows } from '@/design-system/tokens';

const cardStyle = {
  padding: spacing[4],              // 16px
  borderRadius: borderRadius.lg,    // 16px
  boxShadow: shadows.md,
};
```

### 🎬 Animations

```javascript
import { animations } from '@/design-system/tokens';

const animatedStyle = {
  animation: animations.presets.fadeIn.animation,
  transition: `all ${animations.duration.base} ${animations.easing.smooth}`,
};
```

---

## المكونات

### Button Component

```javascript
import { Button } from '@/design-system/components/Button';

// استخدام بسيط
<Button onClick={() => console.log('clicked')}>
  اضغط هنا
</Button>

// مع خيارات متقدمة
<Button
  variant="success"
  size="lg"
  fullWidth
  leftIcon="✅"
  onClick={handleSubmit}
>
  حفظ البيانات
</Button>
```

#### Props المتاحة:

| Prop | Type | Default | الوصف |
|------|------|---------|-------|
| `variant` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'outline' \| 'ghost'` | `'primary'` | نوع الزر |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | حجم الزر |
| `fullWidth` | `boolean` | `false` | عرض كامل |
| `disabled` | `boolean` | `false` | تعطيل الزر |
| `loading` | `boolean` | `false` | حالة التحميل |
| `leftIcon` | `ReactNode` | - | أيقونة يسار |
| `rightIcon` | `ReactNode` | - | أيقونة يمين |
| `onClick` | `function` | - | دالة عند الضغط |

---

## أمثلة الاستخدام

### مثال 1: بطاقة مع التصميم الموحد

```javascript
import { colors, spacing, borderRadius, shadows } from '@/design-system/tokens';

const Card = ({ children }) => (
  <div style={{
    background: colors.neutral[0],
    padding: spacing[6],
    borderRadius: borderRadius.xl,
    boxShadow: shadows.lg,
  }}>
    {children}
  </div>
);
```

### مثال 2: عنوان مع Typography

```javascript
import { typography, colors } from '@/design-system/tokens';

const Heading = ({ children }) => (
  <h1 style={{
    ...typography.styles.h1,
    color: colors.neutral[900],
    marginBottom: spacing[4],
  }}>
    {children}
  </h1>
);
```

### مثال 3: زر متحرك

```javascript
import { Button } from '@/design-system/components/Button';
import { animations } from '@/design-system/tokens';

const AnimatedButton = () => (
  <Button
    variant="primary"
    size="lg"
    style={{
      animation: animations.presets.pulse.animation,
    }}
  >
    اشترك الآن
  </Button>
);
```

---

## Best Practices

### ✅ Do's

```javascript
// استخدم ال tokens دائماً
const style = {
  color: colors.primary[500],
  padding: spacing[4],
};

// استخدم المكونات الجاهزة
<Button variant="success">حفظ</Button>

// اجعل الكود قابل لإعادة الاستخدام
const Card = ({ children, variant = 'primary' }) => {
  const cardColors = colors[variant];
  return <div style={{ background: cardColors[50] }}>{children}</div>;
};
```

### ❌ Don'ts

```javascript
// لا تستخدم قيم ثابتة
const style = {
  color: '#f59e0b',        // ❌
  padding: '16px',          // ❌
};

// لا تكرر الأنماط
<div style={{ color: '#f59e0b', fontSize: '16px' }}>Text 1</div>
<div style={{ color: '#f59e0b', fontSize: '16px' }}>Text 2</div>  // ❌
```

---

## الخطوات القادمة

### المكونات القادمة:
- [ ] Input Component
- [ ] Card Component
- [ ] Modal Component
- [ ] Badge Component
- [ ] Avatar Component
- [ ] Tooltip Component
- [ ] Progress Component

---

## 📝 ملاحظات

- جميع القيم مبنية على نظام 4px base
- الألوان متوافقة مع WCAG 2.1
- الخطوط تدعم اللغة العربية
- النظام قابل للتوسع بسهولة

---

**تم بناء هذا النظام بـ ❤️ لمشروع مدينة العطاء**
