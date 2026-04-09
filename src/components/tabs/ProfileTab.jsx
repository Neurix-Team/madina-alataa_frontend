
import React, { useState, useRef, useEffect } from 'react';
import JellyButton from '../common/JellyButton';
import AudioManager from '../../services/AudioManager';
import {
  getSavedAvatarProfile,
  saveAvatarProfile,
  buildAvatarUrlFromProfile,
} from '../../utils/avatarProfile';

// ═══════════════════════════════════════════════════════════════════════
// 🎨 Complete Avatar Options (Same as AvatarCreator)
// ═══════════════════════════════════════════════════════════════════════

const AVATAR_OPTIONS = {
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
    { id: 'silver', color: '#9ca3af', label: 'فضي' },
    { id: 'gold', color: '#f59e0b', label: 'ذهبي' },
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
    { id: 'sport', label: 'رياضي', emoji: '🏃', color: '#0ea5e9', price: 350, unlocked: true },
    { id: 'formal', label: 'رسمي', emoji: '🤵', color: '#111827', price: 450, unlocked: true },
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

// ═══════════════════════════════════════════════════════════════════════
// 🎨 Main Component
// ═══════════════════════════════════════════════════════════════════════

export default function ProfileTab({ avatarTheme, onSetColor, onSetAccessory, userStats }) {
  // ─────────────────────────────────────────────────────────────────────
  // 📦 State Management
  // ─────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('basic'); // basic, advanced, photo, shop, presets
  const [avatarData, setAvatarData] = useState(() => {
    const saved = getSavedAvatarProfile();
    return {
      name: saved.name || userStats?.name || 'البطل',
      gender: saved.gender || 'boy',
      skinTone: saved.skinTone || 'medium',
      hairStyle: saved.hairStyle || 'short',
      hairColor: saved.hairColor || 'black',
      accessories: saved.accessories || [],
      clothes: saved.clothes || 'tshirt',
      background: saved.background || 'gradient1',
      photoUrl: saved.photoUrl || null,
      aiAvatarUrl: saved.aiAvatarUrl || null,
      seed: saved.seed || (saved.name || userStats?.name || 'madina-avatar'),
    };
  });

  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const fileInputRef = useRef(null);

  const [savedPresets, setSavedPresets] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [toast, setToast] = useState({ open: false, text: '', tone: 'success' });

  // KP points from userStats
  const userKP = userStats?.kp || 0;
  const userLevel = userStats?.level || 1;

  // ─────────────────────────────────────────────────────────────────────
  // 🎨 Avatar Update Functions
  // ─────────────────────────────────────────────────────────────────────

  const showToast = (text, tone = 'success') => {
    setToast({ open: true, text, tone });
    window.clearTimeout(window.__avatarToastTimer);
    window.__avatarToastTimer = window.setTimeout(() => {
      setToast({ open: false, text: '', tone: 'success' });
    }, 2200);
  };

  const updateAvatarProp = (key, value) => {
    setAvatarData(prev => ({ ...prev, [key]: value }));
    AudioManager.getInstance().play('toggle');
  };

  const toggleAccessory = (accessoryId) => {
    const accessory = AVATAR_OPTIONS.accessories.find(a => a.id === accessoryId);
    
    // Check if locked
    if (!accessory.unlocked && userLevel < (accessory.level || 0)) {
      AudioManager.getInstance().play('error');
      showToast(`هذا الإكسسوار مقفل! يتطلب المستوى ${accessory.level}`, 'error');
      return;
    }

    // Check if needs purchase
    if (!accessory.unlocked && accessory.price > userKP) {
      AudioManager.getInstance().play('error');
      showToast(`نقاطك غير كافية! تحتاج ${accessory.price} نقطة`, 'error');
      return;
    }

    setAvatarData(prev => ({
      ...prev,
      accessories: prev.accessories.includes(accessoryId)
        ? prev.accessories.filter(id => id !== accessoryId)
        : [...prev.accessories, accessoryId],
    }));
    AudioManager.getInstance().play('toggle');
  };

  const purchaseItem = (item, category) => {
    if (userKP < item.price) {
      AudioManager.getInstance().play('error');
      showToast(`نقاطك غير كافية! تحتاج ${item.price} نقطة`, 'error');
      return;
    }

    AudioManager.getInstance().play('success');
    showToast('تم الشراء بنجاح! 🎉', 'success');
    // TODO: Deduct KP and unlock item in backend
  };

  // ─────────────────────────────────────────────────────────────────────
  // 📸 Photo Upload & AI Generation
  // ─────────────────────────────────────────────────────────────────────

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار صورة صحيحة');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً. الرجاء اختيار صورة أصغر من 5 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target.result);
      generateAIAvatar(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const generateAIAvatar = async (photoData) => {
    setIsProcessingAI(true);
    setAiProgress(0);

    const progressInterval = setInterval(() => {
      setAiProgress(prev => (prev >= 90 ? 90 : prev + 10));
    }, 300);

    try {
      // Use the uploaded photo directly as the avatar
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAvatarData(prev => ({ ...prev, aiAvatarUrl: photoData, photoUrl: photoData }));
      setAiProgress(100);

      setTimeout(() => {
        setIsProcessingAI(false);
        setPhotoPreview(null);
        AudioManager.getInstance().play('success');
      }, 500);

    } catch (error) {
      console.error('Error:', error);
      setIsProcessingAI(false);
      setPhotoPreview(null);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleRetakePhoto = () => {
    setPhotoPreview(null);
    setAvatarData(prev => ({ ...prev, photoUrl: null, aiAvatarUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─────────────────────────────────────────────────────────────────────
  // 💾 Presets Management
  // ─────────────────────────────────────────────────────────────────────

  const savePreset = () => {
    if (!presetName.trim()) {
      showToast('الرجاء إدخال اسم للحفظ', 'error');
      return;
    }

    const newPreset = {
      id: Date.now(),
      name: presetName,
      data: { ...avatarData },
      timestamp: new Date().toISOString(),
    };

    setSavedPresets(prev => [...prev, newPreset]);
    setShowSaveModal(false);
    setPresetName('');
    AudioManager.getInstance().play('success');
    showToast('تم حفظ التصميم بنجاح! ✨', 'success');
  };

  const loadPreset = (preset) => {
    setAvatarData(preset.data);
    AudioManager.getInstance().play('success');
  };

  const deletePreset = (presetId) => {
    if (confirm('هل تريد حذف هذا التصميم المحفوظ؟')) {
      setSavedPresets(prev => prev.filter(p => p.id !== presetId));
      AudioManager.getInstance().play('click');
    }
  };

  const handleSaveAvatarGlobal = () => {
    const payload = saveAvatarProfile({
      ...avatarData,
      seed: avatarData.seed || avatarData.name || userStats?.name || 'madina-avatar',
    });
    setAvatarData((prev) => ({ ...prev, seed: payload.seed }));
    AudioManager.getInstance().play('success');
    showToast('تم حفظ الأفاتار وتطبيقه على كل الصفحات بنجاح ✅', 'success');
  };

  // ─────────────────────────────────────────────────────────────────────
  // 🎬 Render Methods
  // ─────────────────────────────────────────────────────────────────────

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>🎨 غرفة التجهيزات</h2>
        <p style={styles.subtitle}>خصّص مظهرك وشخصيتك بشكل احترافي!</p>
        <div style={styles.kpBadge}>
          ✨ نقاطك: <strong>{userKP.toLocaleString()}</strong> KP
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabNav}>
        {[
          { id: 'basic', label: '🎨 أساسي', icon: '🎨' },
          { id: 'advanced', label: '⚡ متقدم', icon: '⚡' },
          { id: 'photo', label: '📸 AI Photo', icon: '📸' },
          { id: 'shop', label: '🛍️ المتجر', icon: '🛍️' },
          { id: 'presets', label: '💾 المحفوظات', icon: '💾' },
        ].map(tab => (
          <button
            key={tab.id}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab.id ? styles.tabBtnActive : {}),
            }}
            onClick={() => { setActiveTab(tab.id); AudioManager.getInstance().play('nav'); }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 800 }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        {/* Left: Avatar Preview */}
        <div style={styles.previewSection}>
          <AvatarPreview avatar={avatarData} size="large" />
          
          <div style={styles.previewActions}>
            <JellyButton
              variant="primary"
              size="md"
              sound="success"
              onClick={handleSaveAvatarGlobal}
              style={{ flex: 1 }}
            >
              💾 حفظ التعديلات
            </JellyButton>
            <JellyButton
              variant="secondary"
              size="md"
              sound="click"
              onClick={() => alert('مشاركة قريباً!')}
              style={{ flex: 1 }}
            >
              📤 مشاركة
            </JellyButton>
          </div>
        </div>

        {/* Right: Customization Options */}
        <div style={styles.customSection}>
          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div style={styles.tabContent}>
              <CustomSection title="👤 الجنس">
                <div style={styles.optionGrid2}>
                  {AVATAR_OPTIONS.gender.map(opt => (
                    <button
                      key={opt.id}
                      style={{
                        ...styles.genderBtn,
                        ...(avatarData.gender === opt.id ? styles.genderBtnActive : {}),
                        borderColor: opt.color,
                      }}
                      onClick={() => updateAvatarProp('gender', opt.id)}
                    >
                      <span style={{ fontSize: 48 }}>{opt.emoji}</span>
                      <span style={{ fontSize: 14, fontWeight: 800 }}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </CustomSection>

              <CustomSection title="🎨 لون البشرة">
                <div style={styles.colorGrid}>
                  {AVATAR_OPTIONS.skinTone.map(opt => (
                    <button
                      key={opt.id}
                      style={{
                        ...styles.colorBtn,
                        backgroundColor: opt.color,
                        ...(avatarData.skinTone === opt.id ? styles.colorBtnActive : {}),
                      }}
                      onClick={() => updateAvatarProp('skinTone', opt.id)}
                      title={opt.label}
                    />
                  ))}
                </div>
              </CustomSection>

              <CustomSection title="💇 تسريحة الشعر">
                <div style={styles.optionGrid4}>
                  {AVATAR_OPTIONS.hairStyle.map(opt => (
                    <button
                      key={opt.id}
                      style={{
                        ...styles.optionBtn,
                        ...(avatarData.hairStyle === opt.id ? styles.optionBtnActive : {}),
                      }}
                      onClick={() => updateAvatarProp('hairStyle', opt.id)}
                    >
                      <span style={{ fontSize: 32 }}>{opt.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </CustomSection>

              <CustomSection title="🌈 لون الشعر">
                <div style={styles.colorGrid}>
                  {AVATAR_OPTIONS.hairColor.map(opt => (
                    <button
                      key={opt.id}
                      style={{
                        ...styles.colorBtn,
                        backgroundColor: opt.color,
                        ...(avatarData.hairColor === opt.id ? styles.colorBtnActive : {}),
                      }}
                      onClick={() => updateAvatarProp('hairColor', opt.id)}
                      title={opt.label}
                    />
                  ))}
                </div>
              </CustomSection>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div style={styles.tabContent}>
              <CustomSection title="✨ الإكسسوارات">
                <div style={styles.optionGrid4}>
                  {AVATAR_OPTIONS.accessories.map(opt => {
                    const isLocked = !opt.unlocked && userLevel < (opt.level || 0);
                    const needsPurchase = !opt.unlocked && opt.price > 0;
                    
                    return (
                      <button
                        key={opt.id}
                        style={{
                          ...styles.accessoryBtn,
                          ...(avatarData.accessories.includes(opt.id) ? styles.optionBtnActive : {}),
                          opacity: isLocked ? 0.4 : 1,
                        }}
                        onClick={() => toggleAccessory(opt.id)}
                      >
                        <span style={{ fontSize: 36 }}>{opt.emoji}</span>
                        <span style={{ fontSize: 10, fontWeight: 700 }}>{opt.label}</span>
                        {isLocked && (
                          <span style={styles.lockBadge}>🔒 Lvl {opt.level}</span>
                        )}
                        {needsPurchase && !isLocked && (
                          <span style={styles.priceBadge}>{opt.price} KP</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CustomSection>

              <CustomSection title="👕 الملابس">
                <div style={styles.optionGrid3}>
                  {AVATAR_OPTIONS.clothes.map(opt => {
                    const isLocked = !opt.unlocked && userLevel < (opt.level || 0);
                    
                    return (
                      <button
                        key={opt.id}
                        style={{
                          ...styles.clothesBtn,
                          ...(avatarData.clothes === opt.id ? styles.optionBtnActive : {}),
                          opacity: isLocked ? 0.4 : 1,
                        }}
                        onClick={() => !isLocked && updateAvatarProp('clothes', opt.id)}
                      >
                        <span style={{ fontSize: 32 }}>{opt.emoji}</span>
                        <span style={{ fontSize: 11, fontWeight: 700 }}>{opt.label}</span>
                        {isLocked && (
                          <span style={styles.lockBadge}>🔒 Lvl {opt.level}</span>
                        )}
                        {opt.price > 0 && (
                          <span style={styles.priceBadge}>{opt.price} KP</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CustomSection>

              <CustomSection title="🌅 الخلفية">
                <div style={styles.optionGrid3}>
                  {AVATAR_OPTIONS.backgrounds.map(opt => {
                    const isLocked = !opt.unlocked && userLevel < (opt.level || 0);
                    const gradient = opt.colors.length > 1 
                      ? `linear-gradient(135deg, ${opt.colors.join(', ')})`
                      : opt.colors[0];
                    
                    return (
                      <button
                        key={opt.id}
                        style={{
                          ...styles.bgBtn,
                          background: gradient,
                          ...(avatarData.background === opt.id ? styles.bgBtnActive : {}),
                          opacity: isLocked ? 0.4 : 1,
                        }}
                        onClick={() => !isLocked && updateAvatarProp('background', opt.id)}
                      >
                        <span style={styles.bgLabel}>{opt.label}</span>
                        {isLocked && (
                          <span style={styles.lockBadge}>🔒 Lvl {opt.level}</span>
                        )}
                        {opt.price > 0 && (
                          <span style={styles.priceBadge}>{opt.price} KP</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CustomSection>
            </div>
          )}

          {/* Photo Tab */}
          {activeTab === 'photo' && (
            <div style={styles.tabContent}>

              {/* ── Upload Photo ── */}
              <div style={styles.photoSection}>
                <h3 style={styles.sectionTitle}>📸 صورتك الشخصية</h3>
                <p style={styles.photoDesc}>
                  ارفع صورتك الشخصية لتظهر في الأفاتار!
                </p>

                {!avatarData.aiAvatarUrl ? (
                  <div style={styles.photoUploadArea}>
                    <div style={styles.photoIcon}>📷</div>
                    <p style={styles.photoText}>اضغط لرفع صورة</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      style={{ display: 'none' }}
                      onChange={handlePhotoUpload}
                    />
                    <JellyButton
                      variant="primary"
                      size="lg"
                      sound="click"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      📸 ارفع صورة
                    </JellyButton>
                  </div>
                ) : (
                  <div style={styles.aiAvatarResult}>
                    <img src={avatarData.aiAvatarUrl} alt="AI Avatar" style={styles.aiAvatarImg} />
                    <p style={styles.aiCredit}>✨ صورتك الشخصية</p>
                    <JellyButton
                      variant="secondary"
                      size="md"
                      sound="click"
                      onClick={handleRetakePhoto}
                    >
                      🔄 إعادة التوليد
                    </JellyButton>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Shop Tab */}
          {activeTab === 'shop' && (
            <div style={styles.tabContent}>
              <div style={styles.shopHeader}>
                <h3 style={styles.sectionTitle}>🛍️ متجر الإكسسوارات</h3>
                <div style={styles.kpBalance}>
                  رصيدك: <strong>{userKP.toLocaleString()}</strong> KP
                </div>
              </div>

              <CustomSection title="👑 إكسسوارات مميزة">
                <div style={styles.shopGrid}>
                  {AVATAR_OPTIONS.accessories.filter(a => a.price > 0 && !a.unlocked).map(item => (
                    <div key={item.id} style={styles.shopItem}>
                      <span style={{ fontSize: 48 }}>{item.emoji}</span>
                      <h4 style={styles.shopItemName}>{item.label}</h4>
                      <div style={styles.shopItemPrice}>💰 {item.price} KP</div>
                      {item.level && (
                        <div style={styles.shopItemLevel}>المستوى {item.level} مطلوب</div>
                      )}
                      <JellyButton
                        variant={userKP >= item.price ? 'primary' : 'disabled'}
                        size="sm"
                        sound="success"
                        onClick={() => purchaseItem(item, 'accessories')}
                        disabled={userKP < item.price}
                      >
                        {userKP >= item.price ? '✅ شراء' : '🔒 مقفل'}
                      </JellyButton>
                    </div>
                  ))}
                </div>
              </CustomSection>

              <CustomSection title="👕 ملابس حصرية">
                <div style={styles.shopGrid}>
                  {AVATAR_OPTIONS.clothes.filter(c => c.price > 0 && !c.unlocked).map(item => (
                    <div key={item.id} style={styles.shopItem}>
                      <span style={{ fontSize: 48 }}>{item.emoji}</span>
                      <h4 style={styles.shopItemName}>{item.label}</h4>
                      <div style={styles.shopItemPrice}>💰 {item.price} KP</div>
                      {item.level && (
                        <div style={styles.shopItemLevel}>المستوى {item.level} مطلوب</div>
                      )}
                      <JellyButton
                        variant={userKP >= item.price ? 'primary' : 'disabled'}
                        size="sm"
                        sound="success"
                        onClick={() => purchaseItem(item, 'clothes')}
                        disabled={userKP < item.price}
                      >
                        {userKP >= item.price ? '✅ شراء' : '🔒 مقفل'}
                      </JellyButton>
                    </div>
                  ))}
                </div>
              </CustomSection>
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div style={styles.tabContent}>
              <h3 style={styles.sectionTitle}>💾 التصاميم المحفوظة</h3>
              
              {savedPresets.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={{ fontSize: 64 }}>📭</span>
                  <p style={{ fontSize: 16, color: '#64748b', marginTop: 10 }}>
                    لم تحفظ أي تصاميم بعد
                  </p>
                </div>
              ) : (
                <div style={styles.presetsGrid}>
                  {savedPresets.map(preset => (
                    <div key={preset.id} style={styles.presetCard}>
                      <AvatarPreview avatar={preset.data} size="small" />
                      <h4 style={styles.presetName}>{preset.name}</h4>
                      <p style={styles.presetDate}>
                        {new Date(preset.timestamp).toLocaleDateString('ar-EG')}
                      </p>
                      <div style={styles.presetActions}>
                        <JellyButton
                          variant="primary"
                          size="sm"
                          sound="click"
                          onClick={() => loadPreset(preset)}
                        >
                          📥 تحميل
                        </JellyButton>
                        <JellyButton
                          variant="secondary"
                          size="sm"
                          sound="click"
                          onClick={() => deletePreset(preset.id)}
                        >
                          🗑️
                        </JellyButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Photo Upload Modal */}
      {photoPreview && (
        <div style={styles.overlay}>
          <div style={styles.photoModal}>
            <h2 style={styles.photoModalTitle}>
              {isProcessingAI ? '🎨 جاري إنشاء الأفاتار...' : '📸 صورتك'}
            </h2>
            
            <div style={styles.photoPreviewContainer}>
              <img src={photoPreview} alt="Preview" style={styles.photoPreview} />
              
              {isProcessingAI && (
                <div style={styles.aiOverlay}>
                  <div style={styles.spinner} />
                  <p style={styles.aiProgressText}>{aiProgress}%</p>
                </div>
              )}
            </div>

            {!isProcessingAI && (
              <div style={styles.photoModalActions}>
                <JellyButton variant="secondary" size="md" sound="click" onClick={handleRetakePhoto}>
                  🔄 إعادة
                </JellyButton>
                <JellyButton variant="primary" size="md" sound="click" onClick={() => generateAIAvatar(photoPreview)}>
                  ✨ إنشاء
                </JellyButton>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Preset Modal */}
      {showSaveModal && (
        <div style={styles.overlay}>
          <div style={styles.saveModal}>
            <h2 style={styles.saveModalTitle}>💾 حفظ التصميم</h2>
            <p style={styles.saveModalDesc}>اختر اسماً لتصميمك الرائع</p>
            
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="اسم التصميم..."
              style={styles.presetInput}
              maxLength={20}
              dir="rtl"
            />

            <div style={styles.saveModalActions}>
              <JellyButton
                variant="secondary"
                size="md"
                sound="click"
                onClick={() => { setShowSaveModal(false); setPresetName(''); }}
              >
                إلغاء
              </JellyButton>
              <JellyButton
                variant="primary"
                size="md"
                sound="success"
                onClick={savePreset}
                disabled={!presetName.trim()}
              >
                ✅ حفظ
              </JellyButton>
            </div>
          </div>
        </div>
      )}

      {toast.open && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 1200,
            background: toast.tone === 'error'
              ? 'linear-gradient(135deg,#ef4444,#b91c1c)'
              : 'linear-gradient(135deg,#10b981,#059669)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: 14,
            fontWeight: 800,
            fontSize: 14,
            boxShadow: '0 10px 24px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.25)',
            maxWidth: 360,
            direction: 'rtl',
          }}
        >
          {toast.text}
        </div>
      )}

      {/* Global styles for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 🖼️ Avatar Preview Component
// ═══════════════════════════════════════════════════════════════════════

function AvatarPreview({ avatar, size = 'medium' }) {
  const dimensions = size === 'large' ? 350 : size === 'small' ? 150 : 250;
  const skinColor = AVATAR_OPTIONS.skinTone.find(s => s.id === avatar.skinTone)?.color || '#d4a574';
  const hairColor = AVATAR_OPTIONS.hairColor.find(h => h.id === avatar.hairColor)?.color || '#000';
  const background = AVATAR_OPTIONS.backgrounds.find(b => b.id === avatar.background);
  const bgGradient = background?.colors.length > 1 
    ? `linear-gradient(135deg, ${background.colors.join(', ')})`
    : (background?.colors[0] || '#e0f2fe');

  return (
    <div style={{
      ...styles.avatarPreview,
      width: dimensions,
      height: dimensions,
      background: bgGradient,
    }}>
      {avatar.aiAvatarUrl ? (
        <img src={avatar.aiAvatarUrl} alt="AI Avatar" style={styles.aiAvatarImage} />
      ) : (
        <img
          src={buildAvatarUrlFromProfile(avatar)}
          alt="Cartoon Avatar"
          style={styles.aiAvatarImage}
        />
      )}
      {!avatar.aiAvatarUrl && (
        <div style={styles.customAvatarOverlay}>
          <div style={{ ...styles.face, backgroundColor: skinColor }}>
            <div style={styles.eyes}>
              <div style={styles.eye} />
              <div style={styles.eye} />
            </div>
            <div style={styles.smile} />
          </div>
          <div style={{ ...styles.hair, backgroundColor: hairColor }} />
          
          {avatar.accessories.map(accId => {
            const acc = AVATAR_OPTIONS.accessories.find(a => a.id === accId);
            return acc ? (
              <div key={accId} style={styles.accessory}>
                <span style={{ fontSize: size === 'large' ? 56 : size === 'small' ? 24 : 40 }}>{acc.emoji}</span>
              </div>
            ) : null;
          })}
        </div>
      )}

      {avatar.name && size !== 'small' && (
        <div style={styles.nameTag}>{avatar.name}</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 🎨 Custom Section Component
// ═══════════════════════════════════════════════════════════════════════

function CustomSection({ title, children }) {
  return (
    <div style={styles.customSectionWrapper}>
      <h4 style={styles.customSectionTitle}>{title}</h4>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 💅 Styles
// ═══════════════════════════════════════════════════════════════════════

const styles = {
  container: {
    fontFamily: "'Cairo', sans-serif",
    direction: 'rtl',
  },
  header: {
    background: 'var(--bg-card)',
    borderRadius: 20,
    padding: '24px 28px',
    marginBottom: 20,
    boxShadow: 'var(--shadow-md)',
    border: '1.5px solid var(--border)',
    textAlign: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 28,
    fontWeight: 900,
    color: 'var(--text-primary)',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
  kpBadge: {
    position: 'absolute',
    top: 24,
    left: 28,
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    color: '#78350f',
    padding: '6px 16px',
    borderRadius: 99,
    fontSize: 13,
    fontWeight: 800,
    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
  },
  tabNav: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
    overflowX: 'auto',
    padding: '0 4px',
  },
  tabBtn: {
    flex: '1 0 auto',
    background: 'var(--bg-card)',
    border: '2px solid var(--border)',
    borderRadius: 12,
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    minWidth: 100,
    color: 'var(--text-primary)',
  },
  tabBtnActive: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    border: '2px solid #764ba2',
    color: '#fff',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(118, 75, 162, 0.3)',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: 20,
  },
  previewSection: {
    background: 'var(--bg-card)',
    borderRadius: 20,
    padding: 24,
    boxShadow: 'var(--shadow-md)',
    border: '1.5px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    position: 'sticky',
    top: 20,
    height: 'fit-content',
  },
  previewActions: {
    display: 'flex',
    gap: 10,
    width: '100%',
  },
  customSection: {
    background: 'var(--bg-card)',
    borderRadius: 20,
    padding: 24,
    boxShadow: 'var(--shadow-md)',
    border: '1.5px solid var(--border)',
    maxHeight: 'calc(100vh - 200px)',
    overflowY: 'auto',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  customSectionWrapper: {
    marginBottom: 24,
  },
  customSectionTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: 'var(--text-primary)',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: 'var(--text-primary)',
    marginBottom: 12,
  },
  optionGrid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  optionGrid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
  },
  optionGrid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10,
  },
  colorGrid: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  genderBtn: {
    background: 'var(--bg-card-2)',
    border: '3px solid var(--border)',
    borderRadius: 16,
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    color: 'var(--text-primary)',
  },
  genderBtnActive: {
    background: '#ede9fe',
    border: '3px solid currentColor',
    transform: 'scale(1.05)',
  },
  optionBtn: {
    background: 'var(--bg-card-2)',
    border: '2px solid var(--border)',
    borderRadius: 12,
    padding: '12px 8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    color: 'var(--text-primary)',
  },
  optionBtnActive: {
    background: '#ede9fe',
    border: '2px solid #7c3aed',
    transform: 'scale(1.05)',
  },
  accessoryBtn: {
    background: 'var(--bg-card-2)',
    border: '2px solid var(--border)',
    borderRadius: 12,
    padding: '12px 8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
    color: 'var(--text-primary)',
  },
  clothesBtn: {
    background: 'var(--bg-card-2)',
    border: '2px solid var(--border)',
    borderRadius: 12,
    padding: '16px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    position: 'relative',
    color: 'var(--text-primary)',
  },
  bgBtn: {
    border: '3px solid var(--border)',
    borderRadius: 12,
    padding: '40px 16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgBtnActive: {
    border: '3px solid #7c3aed',
    transform: 'scale(1.05)',
    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)',
  },
  bgLabel: {
    fontSize: 12,
    fontWeight: 800,
    color: '#fff',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  colorBtn: {
    width: 54,
    height: 54,
    borderRadius: '50%',
    border: '3px solid #fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  colorBtnActive: {
    border: '3px solid #7c3aed',
    transform: 'scale(1.15)',
    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4)',
  },
  lockBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 9,
    background: '#ef4444',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: 6,
    fontWeight: 800,
  },
  priceBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    fontSize: 9,
    background: '#fbbf24',
    color: '#78350f',
    padding: '2px 6px',
    borderRadius: 6,
    fontWeight: 800,
  },
  avatarPreview: {
    position: 'relative',
    borderRadius: 20,
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  },
  customAvatar: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customAvatarOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'none',
  },
  face: {
    width: 120,
    height: 140,
    borderRadius: '50%',
    position: 'relative',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  eyes: {
    display: 'flex',
    justifyContent: 'space-around',
    paddingTop: 45,
    paddingLeft: 20,
    paddingRight: 20,
  },
  eye: {
    width: 12,
    height: 12,
    background: '#000',
    borderRadius: '50%',
  },
  smile: {
    width: 40,
    height: 20,
    border: '3px solid #000',
    borderTop: 'none',
    borderRadius: '0 0 40px 40px',
    margin: '15px auto 0',
  },
  hair: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 130,
    height: 60,
    borderRadius: '60px 60px 0 0',
    zIndex: -1,
  },
  accessory: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  aiAvatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 16,
  },
  nameTag: {
    position: 'absolute',
    bottom: -12,
    background: '#fbbf24',
    color: '#78350f',
    padding: '6px 20px',
    borderRadius: 99,
    fontSize: 14,
    fontWeight: 800,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  photoSection: {
    textAlign: 'center',
  },
  photoDesc: {
    color: 'var(--text-secondary)',
    fontSize: 14,
    marginBottom: 20,
  },
  photoUploadArea: {
    background: 'var(--bg-card-2)',
    border: '3px dashed var(--border)',
    borderRadius: 16,
    padding: 60,
    textAlign: 'center',
  },
  photoIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  photoText: {
    color: 'var(--text-secondary)',
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 20,
  },
  aiAvatarResult: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  aiAvatarImg: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  },
  aiCredit: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
  },
  shopHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  kpBalance: {
    background: '#fef3c7',
    color: '#78350f',
    padding: '8px 16px',
    borderRadius: 99,
    fontSize: 14,
    fontWeight: 800,
  },
  shopGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  shopItem: {
    background: 'var(--bg-card-2)',
    border: '2px solid var(--border)',
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  shopItemName: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  shopItemPrice: {
    fontSize: 14,
    fontWeight: 800,
    color: '#f59e0b',
  },
  shopItemLevel: {
    fontSize: 11,
    color: 'var(--text-secondary)',
  },
  emptyState: {
    textAlign: 'center',
    padding: 60,
  },
  presetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  presetCard: {
    background: 'var(--bg-card-2)',
    border: '2px solid var(--border)',
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
  },
  presetName: {
    fontSize: 14,
    fontWeight: 800,
    color: 'var(--text-primary)',
    marginTop: 12,
  },
  presetDate: {
    fontSize: 11,
    color: 'var(--text-secondary)',
    marginBottom: 12,
  },
  presetActions: {
    display: 'flex',
    gap: 8,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  photoModal: {
    background: 'var(--bg-card)',
    borderRadius: 24,
    padding: 40,
    maxWidth: 500,
    width: '90%',
    border: '1.5px solid var(--border)',
  },
  photoModalTitle: {
    fontSize: 24,
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: 20,
    color: 'var(--text-primary)',
  },
  photoPreviewContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1/1',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  aiOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  spinner: {
    width: 50,
    height: 50,
    border: '5px solid rgba(124,58,237,0.2)',
    borderTop: '5px solid #7c3aed',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
  aiProgressText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 800,
  },
  photoModalActions: {
    display: 'flex',
    gap: 12,
  },
  saveModal: {
    background: 'var(--bg-card)',
    borderRadius: 24,
    padding: 40,
    maxWidth: 400,
    width: '90%',
    border: '1.5px solid var(--border)',
  },
  saveModalTitle: {
    fontSize: 24,
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: 8,
    color: 'var(--text-primary)',
  },
  saveModalDesc: {
    fontSize: 14,
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginBottom: 20,
  },
  presetInput: {
    width: '100%',
    padding: '14px 18px',
    fontSize: 16,
    border: '2px solid var(--border)',
    borderRadius: 12,
    fontFamily: "'Cairo', sans-serif",
    fontWeight: 600,
    marginBottom: 20,
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
  },
  saveModalActions: {
    display: 'flex',
    gap: 12,
  },
};
