// ═══════════════════════════════════════════════════════════════════════
// 🎨 Avatar Configuration Data
// ═══════════════════════════════════════════════════════════════════════
// Separated from components for better maintainability
// ═══════════════════════════════════════════════════════════════════════

export const AVATAR_OPTIONS = {
  gender: [
    { id: 'boy', label: 'ولد', emoji: '👦', color: '#3b82f6' },
    { id: 'girl', label: 'بنت', emoji: '👧', color: '#ec4899' },
  ],
  
  skinTone: [
    { id: 'light', color: '#ffd1a9', label: 'فاتح' },
    { id: 'medium', color: '#d4a574', label: 'متوسط' },
    { id: 'tan', color: '#c4915c', label: 'حنطي' },
    { id: 'olive', color: '#a67c52', label: 'زيتوني' },
    { id: 'brown', color: '#8b6f47', label: 'بني' },
    { id: 'dark', color: '#6d5a3e', label: 'داكن' },
  ],
  
  hairStyle: [
    { id: 'short', label: 'قصير', icon: '✂️' },
    { id: 'medium', label: 'متوسط', icon: '💇' },
    { id: 'long', label: 'طويل', icon: '💇‍♀️' },
    { id: 'curly', label: 'كيرلي', icon: '🌀' },
    { id: 'wavy', label: 'مموج', icon: '〰️' },
    { id: 'braid', label: 'ضفيرة', icon: '🎀' },
    { id: 'bun', label: 'كعكة', icon: '🥯' },
    { id: 'ponytail', label: 'ذيل حصان', icon: '🎀' },
  ],
  
  hairColor: [
    { id: 'black', color: '#000000', label: 'أسود' },
    { id: 'brown', color: '#5c4033', label: 'بني' },
    { id: 'blonde', color: '#f0d478', label: 'أشقر' },
    { id: 'red', color: '#c1440e', label: 'أحمر' },
    { id: 'blue', color: '#1e3a8a', label: 'أزرق' },
    { id: 'purple', color: '#7c3aed', label: 'بنفسجي' },
    { id: 'pink', color: '#ec4899', label: 'وردي' },
    { id: 'green', color: '#059669', label: 'أخضر' },
  ],
  
  accessories: [
    { id: 'glasses', label: 'نظارة', emoji: '👓', price: 0, unlocked: true },
    { id: 'hat', label: 'قبعة', emoji: '🎩', price: 0, unlocked: true },
    { id: 'crown', label: 'تاج', emoji: '👑', price: 500, unlocked: false, level: 5 },
    { id: 'mask', label: 'قناع بطل', emoji: '🦸', price: 300, unlocked: false, level: 3 },
    { id: 'flower', label: 'زهرة', emoji: '🌸', price: 0, unlocked: true },
    { id: 'bow', label: 'فيونكة', emoji: '🎀', price: 0, unlocked: true },
    { id: 'headband', label: 'عصابة', emoji: '🎽', price: 100, unlocked: true },
    { id: 'earrings', label: 'أقراط', emoji: '💍', price: 150, unlocked: true },
    { id: 'sunglasses', label: 'نظارة شمس', emoji: '🕶️', price: 200, unlocked: true },
    { id: 'bandana', label: 'باندانا', emoji: '🧣', price: 250, unlocked: true },
  ],
  
  clothes: [
    { id: 'tshirt', label: 'تيشيرت', emoji: '👕', color: '#ffffff', price: 0, unlocked: true },
    { id: 'hoodie', label: 'هودي', emoji: '🧥', color: '#374151', price: 200, unlocked: true },
    { id: 'jacket', label: 'جاكيت', emoji: '🧥', color: '#1e40af', price: 300, unlocked: true },
    { id: 'dress', label: 'فستان', emoji: '👗', color: '#ec4899', price: 250, unlocked: true },
    { id: 'superhero', label: 'بطل خارق', emoji: '🦸', color: '#dc2626', price: 500, unlocked: false, level: 5 },
    { id: 'wizard', label: 'ساحر', emoji: '🧙', color: '#7c3aed', price: 600, unlocked: false, level: 7 },
  ],
  
  backgrounds: [
    { id: 'gradient1', label: 'تدرج أزرق', colors: ['#3b82f6', '#1d4ed8'], price: 0, unlocked: true },
    { id: 'gradient2', label: 'تدرج وردي', colors: ['#ec4899', '#db2777'], price: 100, unlocked: true },
    { id: 'gradient3', label: 'تدرج أخضر', colors: ['#10b981', '#059669'], price: 100, unlocked: true },
    { id: 'gradient4', label: 'تدرج برتقالي', colors: ['#f59e0b', '#d97706'], price: 150, unlocked: true },
    { id: 'gradient5', label: 'تدرج بنفسجي', colors: ['#8b5cf6', '#7c3aed'], price: 200, unlocked: true },
    { id: 'stars', label: 'نجوم', colors: ['#1e293b', '#0f172a'], price: 300, unlocked: false, level: 4 },
    { id: 'rainbow', label: 'قوس قزح', colors: ['#ec4899', '#8b5cf6', '#3b82f6'], price: 500, unlocked: false, level: 6 },
  ],
};

export default AVATAR_OPTIONS;
