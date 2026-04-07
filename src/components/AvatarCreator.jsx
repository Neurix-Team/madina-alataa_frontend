// ═══════════════════════════════════════════════════════════════════════
// 🎨 AI-Powered Avatar Creator Component - Professional Edition
// ═══════════════════════════════════════════════════════════════════════
// Project: بطل العطاء (Madina Al-Ataa)
// Features: 
// - Photo upload + AI avatar generation
// - Manual customization (gender, skin, hair, accessories)
// - Live preview with 3D-like effects
// - Name input with validation
// - Step-by-step wizard
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect } from 'react';

// ═══════════════════════════════════════════════════════════════════════
// 🎨 Avatar Customization Options
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
  ],
  accessories: [
    { id: 'glasses', label: 'نظارة', emoji: '👓', unlocked: true },
    { id: 'hat', label: 'قبعة', emoji: '🎩', unlocked: true },
    { id: 'crown', label: 'تاج', emoji: '👑', unlocked: false, level: 5 },
    { id: 'mask', label: 'قناع بطل', emoji: '🦸', unlocked: false, level: 3 },
    { id: 'flower', label: 'زهرة', emoji: '🌸', unlocked: true },
    { id: 'bow', label: 'فيونكة', emoji: '🎀', unlocked: true },
    { id: 'headband', label: 'عصابة', emoji: '🎽', unlocked: true },
    { id: 'earrings', label: 'أقراط', emoji: '💍', unlocked: true },
  ],
};

// ═══════════════════════════════════════════════════════════════════════
// 🎨 Main Component
// ═══════════════════════════════════════════════════════════════════════

export default function AvatarCreator({ onComplete, onSkip }) {
  // ─────────────────────────────────────────────────────────────────────
  // 📦 State Management
  // ─────────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1); // 1: Method, 2: Customization, 3: Name
  const [creationMethod, setCreationMethod] = useState(null); // 'photo' | 'manual'
  
  // Avatar data
  const [avatarData, setAvatarData] = useState({
    name: '',
    gender: 'boy',
    skinTone: 'medium',
    hairStyle: 'short',
    hairColor: 'black',
    accessories: [],
    photoUrl: null,
    aiAvatarUrl: null,
  });

  // Photo upload
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isNarrow = windowWidth <= 900;
  const isMobile = windowWidth <= 640;
  const responsiveStyles = {
    card: { ...styles.card, padding: isNarrow ? 24 : 40 },
    cardWide: { ...styles.cardWide, padding: isNarrow ? 24 : 30 },
    methodGrid: { ...styles.methodGrid, gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr', gap: isMobile ? 14 : 20 },
    splitLayout: { ...styles.splitLayout, gridTemplateColumns: isNarrow ? '1fr' : '1fr 1.5fr', gap: isMobile ? 18 : 30 },
    previewSection: { ...styles.previewSection, alignItems: isMobile ? 'stretch' : 'center' },
    customSection: { ...styles.customSection, maxHeight: isMobile ? 'none' : styles.customSection.maxHeight },
    actionButtons: { ...styles.actionButtons, flexDirection: isMobile ? 'column' : 'row' },
    photoCard: { ...styles.photoCard, padding: isMobile ? 24 : styles.photoCard.padding },
    photoActions: { ...styles.photoActions, flexDirection: isMobile ? 'column' : 'row' },
    optionGrid: { ...styles.optionGrid, gridTemplateColumns: isMobile ? 'repeat(2, minmax(0,1fr))' : styles.optionGrid.gridTemplateColumns },
    nameInput: { ...styles.nameInput, fontSize: isMobile ? 16 : styles.nameInput.fontSize, padding: isMobile ? '12px 14px' : styles.nameInput.padding },
  };

  // Validation
  const [nameError, setNameError] = useState('');

  // ─────────────────────────────────────────────────────────────────────
  // 📸 Photo Upload & AI Generation
  // ─────────────────────────────────────────────────────────────────────
  
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار صورة صحيحة');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً. الرجاء اختيار صورة أصغر من 5 ميجابايت');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target.result);
      setAvatarData(prev => ({ ...prev, photoUrl: event.target.result }));
      
      // Simulate AI processing
      generateAIAvatar(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const generateAIAvatar = async (photoData) => {
    setIsProcessingAI(true);
    setAiProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAiProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // TODO: Replace with actual AI API call
      // const response = await fetch('/api/ai/generate-avatar', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ photo: photoData }),
      // });
      // const data = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock AI avatar URL (في الواقع، هيكون من الـ API)
      const mockAiAvatarUrl = photoData; // For demo purposes
      
      setAvatarData(prev => ({ ...prev, aiAvatarUrl: mockAiAvatarUrl }));
      setAiProgress(100);
      
      // Auto-proceed to customization after 1 second
      setTimeout(() => {
        setStep(2);
        setIsProcessingAI(false);
      }, 1000);
      
    } catch (error) {
      console.error('AI Avatar Generation Error:', error);
      alert('حدث خطأ في إنشاء الأفاتار. الرجاء المحاولة مرة أخرى');
      setIsProcessingAI(false);
      setPhotoPreview(null);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleRetakePhoto = () => {
    setPhotoPreview(null);
    setAvatarData(prev => ({ ...prev, photoUrl: null, aiAvatarUrl: null }));
    setIsProcessingAI(false);
    setAiProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // 🎨 Manual Customization
  // ─────────────────────────────────────────────────────────────────────

  const updateAvatarProp = (key, value) => {
    setAvatarData(prev => ({ ...prev, [key]: value }));
  };

  const toggleAccessory = (accessoryId) => {
    setAvatarData(prev => ({
      ...prev,
      accessories: prev.accessories.includes(accessoryId)
        ? prev.accessories.filter(id => id !== accessoryId)
        : [...prev.accessories, accessoryId],
    }));
  };

  // ─────────────────────────────────────────────────────────────────────
  // ✅ Name Validation & Completion
  // ─────────────────────────────────────────────────────────────────────

  const handleNameChange = (e) => {
    const value = e.target.value;
    setAvatarData(prev => ({ ...prev, name: value }));
    
    if (value.length < 2) {
      setNameError('الاسم قصير جداً');
    } else if (value.length > 20) {
      setNameError('الاسم طويل جداً');
    } else if (!/^[\u0621-\u064A\s]+$/.test(value)) {
      setNameError('الرجاء استخدام الأحرف العربية فقط');
    } else {
      setNameError('');
    }
  };

  const handleComplete = () => {
    if (!avatarData.name || nameError) {
      setNameError('الرجاء إدخال اسم صحيح');
      return;
    }
    onComplete(avatarData);
  };

  // ─────────────────────────────────────────────────────────────────────
  // 🎬 Render Methods
  // ─────────────────────────────────────────────────────────────────────

  // Step 1: Choose Creation Method
  if (step === 1) {
    return (
      <div style={styles.container}>
        <div style={responsiveStyles.card}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>🎨 أنشئ بطلك الخاص</h1>
            <p style={styles.subtitle}>اختر طريقة إنشاء شخصيتك</p>
          </div>

          {/* Method Selection */}
          <div style={responsiveStyles.methodGrid}>
            {/* AI Photo Method */}
            <button
              style={{
                ...styles.methodCard,
                ...(creationMethod === 'photo' ? styles.methodCardActive : {}),
              }}
              onClick={() => setCreationMethod('photo')}
            >
              <div style={styles.methodIcon}>📸</div>
              <h3 style={styles.methodTitle}>صورتك بتقنية AI</h3>
              <p style={styles.methodDesc}>
                التقط صورة شخصية وسنحولها لأفاتار كرتوني رائع!
              </p>
              <div style={styles.badge}>🌟 مميز</div>
            </button>

            {/* Manual Customization Method */}
            <button
              style={{
                ...styles.methodCard,
                ...(creationMethod === 'manual' ? styles.methodCardActive : {}),
              }}
              onClick={() => setCreationMethod('manual')}
            >
              <div style={styles.methodIcon}>🎨</div>
              <h3 style={styles.methodTitle}>تصميم يدوي</h3>
              <p style={styles.methodDesc}>
                اختر الشكل والألوان والإكسسوارات بنفسك
              </p>
              <div style={styles.badge}>🔧 مخصص</div>
            </button>
          </div>

          {/* Next Button */}
          {creationMethod && (
            <div style={responsiveStyles.actionButtons}>
              <button
                style={styles.btnPrimary}
                onClick={() => {
                  if (creationMethod === 'photo') {
                    fileInputRef.current?.click();
                  } else {
                    setStep(2);
                  }
                }}
              >
                {creationMethod === 'photo' ? '📸 التقط صورة' : '✨ ابدأ التصميم'}
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            style={{ display: 'none' }}
            onChange={handlePhotoUpload}
          />

          {/* Skip Button */}
          <button style={styles.btnSkip} onClick={onSkip}>
            تخطي الآن →
          </button>
        </div>

        {/* Photo Preview & AI Processing */}
        {photoPreview && (
          <div style={styles.overlay}>
            <div style={responsiveStyles.photoCard}>
              <h2 style={styles.photoTitle}>
                {isProcessingAI ? '🎨 جاري إنشاء الأفاتار...' : '📸 صورتك'}
              </h2>
              
              <div style={styles.photoPreviewContainer}>
                <img src={photoPreview} alt="Preview" style={styles.photoPreview} />
                
                {isProcessingAI && (
                  <div style={styles.aiOverlay}>
                    <div style={styles.spinner} />
                    <p style={styles.aiProgress}>{aiProgress}%</p>
                  </div>
                )}
              </div>

              {!isProcessingAI && (
                <div style={responsiveStyles.photoActions}>
                  <button style={styles.btnSecondary} onClick={handleRetakePhoto}>
                    🔄 إعادة التقاط
                  </button>
                  <button
                    style={styles.btnPrimary}
                    onClick={() => generateAIAvatar(photoPreview)}
                  >
                    ✨ إنشاء الأفاتار
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 2: Customization
  if (step === 2) {
    return (
      <div style={styles.container}>
        <div style={responsiveStyles.cardWide}>
          {/* Progress Indicator */}
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: '66%' }} />
          </div>

          <div style={responsiveStyles.splitLayout}>
            {/* Left: Preview */}
            <div style={responsiveStyles.previewSection}>
              <h3 style={styles.sectionTitle}>👀 المعاينة</h3>
              <AvatarPreview avatar={avatarData} />
              
              {avatarData.aiAvatarUrl && (
                <div style={styles.aiCredit}>
                  <span>✨ تم إنشاؤه بواسطة AI</span>
                </div>
              )}
            </div>

            {/* Right: Customization Options */}
            <div style={responsiveStyles.customSection}>
              <h3 style={styles.sectionTitle}>🎨 التخصيص</h3>
              
              <div style={styles.optionsContainer}>
                {/* Gender */}
                <CustomSection title="👤 الجنس">
                  <div style={responsiveStyles.optionGrid}>
                    {AVATAR_OPTIONS.gender.map(opt => (
                      <button
                        key={opt.id}
                        style={{
                          ...styles.optionBtn,
                          ...(avatarData.gender === opt.id ? styles.optionBtnActive : {}),
                          borderColor: opt.color,
                        }}
                        onClick={() => updateAvatarProp('gender', opt.id)}
                      >
                        <span style={{ fontSize: 32 }}>{opt.emoji}</span>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </CustomSection>

                {/* Skin Tone */}
                <CustomSection title="🎨 لون البشرة">
                  <div style={responsiveStyles.optionGrid}>
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

                {/* Hair Style */}
                <CustomSection title="💇 تسريحة الشعر">
                  <div style={responsiveStyles.optionGrid}>
                    {AVATAR_OPTIONS.hairStyle.map(opt => (
                      <button
                        key={opt.id}
                        style={{
                          ...styles.optionBtn,
                          ...(avatarData.hairStyle === opt.id ? styles.optionBtnActive : {}),
                        }}
                        onClick={() => updateAvatarProp('hairStyle', opt.id)}
                      >
                        <span style={{ fontSize: 24 }}>{opt.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 600 }}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </CustomSection>

                {/* Hair Color */}
                <CustomSection title="🎨 لون الشعر">
                  <div style={responsiveStyles.optionGrid}>
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

                {/* Accessories */}
                <CustomSection title="✨ الإكسسوارات">
                  <div style={responsiveStyles.optionGrid}>
                    {AVATAR_OPTIONS.accessories.map(opt => (
                      <button
                        key={opt.id}
                        style={{
                          ...styles.optionBtn,
                          ...(avatarData.accessories.includes(opt.id) ? styles.optionBtnActive : {}),
                          opacity: opt.unlocked ? 1 : 0.5,
                        }}
                        onClick={() => opt.unlocked && toggleAccessory(opt.id)}
                        disabled={!opt.unlocked}
                      >
                        <span style={{ fontSize: 28 }}>{opt.emoji}</span>
                        <span style={{ fontSize: 10, fontWeight: 600 }}>{opt.label}</span>
                        {!opt.unlocked && (
                          <span style={styles.lockBadge}>🔒 Lvl {opt.level}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </CustomSection>
              </div>

              {/* Navigation */}
              <div style={responsiveStyles.actionButtons}>
                <button style={styles.btnSecondary} onClick={() => setStep(1)}>
                  ← رجوع
                </button>
                <button style={styles.btnPrimary} onClick={() => setStep(3)}>
                  التالي →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Name Input
  if (step === 3) {
    return (
      <div style={styles.container}>
        <div style={responsiveStyles.card}>
          {/* Progress Indicator */}
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: '100%' }} />
          </div>

          <div style={styles.header}>
            <h1 style={styles.title}>✨ اللمسة الأخيرة</h1>
            <p style={styles.subtitle}>ما هو اسم بطلنا؟</p>
          </div>

          {/* Avatar Preview */}
          <div style={{ marginBottom: 30 }}>
            <AvatarPreview avatar={avatarData} size={isMobile ? 'medium' : 'large'} />
          </div>

          {/* Name Input */}
          <div style={styles.nameInputContainer}>
            <label style={styles.label}>اسم الشخصية</label>
            <input
              type="text"
              value={avatarData.name}
              onChange={handleNameChange}
              placeholder="اكتب اسمك هنا..."
              style={{
                ...responsiveStyles.nameInput,
                borderColor: nameError ? '#ef4444' : '#e5e7eb',
              }}
              maxLength={20}
              dir="rtl"
            />
            {nameError && <p style={styles.error}>{nameError}</p>}
            <p style={styles.hint}>
              {avatarData.name.length}/20 حرف
            </p>
          </div>

          {/* Action Buttons */}
          <div style={responsiveStyles.actionButtons}>
            <button style={styles.btnSecondary} onClick={() => setStep(2)}>
              ← رجوع
            </button>
            <button
              style={{
                ...styles.btnPrimary,
                opacity: !avatarData.name || nameError ? 0.5 : 1,
              }}
              onClick={handleComplete}
              disabled={!avatarData.name || !!nameError}
            >
              🚀 ابدأ المغامرة!
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════════════
// 🖼️ Avatar Preview Component
// ═══════════════════════════════════════════════════════════════════════

function AvatarPreview({ avatar, size = 'medium' }) {
  const dimensions = size === 'large' ? 300 : 250;
  const skinColor = AVATAR_OPTIONS.skinTone.find(s => s.id === avatar.skinTone)?.color || '#d4a574';
  const hairColor = AVATAR_OPTIONS.hairColor.find(h => h.id === avatar.hairColor)?.color || '#000';

  return (
    <div style={{
      ...styles.avatarPreview,
      width: dimensions,
      height: dimensions,
    }}>
      {/* AI Avatar or Custom Avatar */}
      {avatar.aiAvatarUrl ? (
        <img
          src={avatar.aiAvatarUrl}
          alt="AI Avatar"
          style={styles.aiAvatarImage}
        />
      ) : (
        <div style={styles.customAvatar}>
          {/* Face */}
          <div style={{
            ...styles.face,
            backgroundColor: skinColor,
          }}>
            {/* Eyes */}
            <div style={styles.eyes}>
              <div style={styles.eye} />
              <div style={styles.eye} />
            </div>
            
            {/* Mouth */}
            <div style={styles.smile} />
          </div>

          {/* Hair */}
          <div style={{
            ...styles.hair,
            backgroundColor: hairColor,
          }} />

          {/* Accessories */}
          {avatar.accessories.map(accId => {
            const acc = AVATAR_OPTIONS.accessories.find(a => a.id === accId);
            return acc ? (
              <div key={accId} style={styles.accessory}>
                <span style={{ fontSize: 48 }}>{acc.emoji}</span>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Name Tag */}
      {avatar.name && (
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
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    fontFamily: "'Cairo', sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    padding: 40,
    maxWidth: 600,
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  cardWide: {
    background: '#fff',
    borderRadius: 24,
    padding: 30,
    maxWidth: 1100,
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 900,
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 500,
  },
  methodGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
    marginBottom: 30,
  },
  methodCard: {
    background: '#f9fafb',
    border: '3px solid #e5e7eb',
    borderRadius: 20,
    padding: 30,
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative',
    textAlign: 'center',
  },
  methodCardActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: '3px solid #764ba2',
    color: '#fff',
    transform: 'scale(1.05)',
  },
  methodIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  methodTitle: {
    fontSize: 20,
    fontWeight: 800,
    marginBottom: 10,
  },
  methodDesc: {
    fontSize: 14,
    opacity: 0.9,
    lineHeight: 1.6,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: -10,
    background: '#fbbf24',
    color: '#78350f',
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 800,
  },
  progressBar: {
    height: 6,
    background: '#e5e7eb',
    borderRadius: 99,
    marginBottom: 30,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    transition: 'width 0.5s ease',
  },
  splitLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: 30,
  },
  previewSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  customSection: {
    overflowY: 'auto',
    maxHeight: '70vh',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 800,
    marginBottom: 20,
    color: '#1f2937',
  },
  avatarPreview: {
    position: 'relative',
    borderRadius: 20,
    background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    marginBottom: 15,
  },
  customAvatar: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    bottom: -10,
    background: '#fbbf24',
    color: '#78350f',
    padding: '6px 20px',
    borderRadius: 99,
    fontSize: 14,
    fontWeight: 800,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  aiCredit: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 10,
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 25,
  },
  customSectionWrapper: {
    marginBottom: 20,
  },
  customSectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#374151',
    marginBottom: 12,
  },
  optionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
    gap: 10,
  },
  optionBtn: {
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: 12,
    padding: '12px 8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  optionBtnActive: {
    background: '#ede9fe',
    border: '2px solid #7c3aed',
    transform: 'scale(1.05)',
  },
  colorBtn: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    border: '3px solid #fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  colorBtnActive: {
    border: '3px solid #7c3aed',
    transform: 'scale(1.15)',
    boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
  },
  lockBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 8,
    background: '#ef4444',
    color: '#fff',
    padding: '2px 4px',
    borderRadius: 4,
  },
  nameInputContainer: {
    marginBottom: 30,
  },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 700,
    color: '#374151',
    marginBottom: 8,
  },
  nameInput: {
    width: '100%',
    padding: '14px 20px',
    fontSize: 18,
    border: '2px solid',
    borderRadius: 12,
    fontFamily: "'Cairo', sans-serif",
    fontWeight: 600,
    transition: 'all 0.2s',
    outline: 'none',
  },
  error: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 6,
    fontWeight: 600,
  },
  hint: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  actionButtons: {
    display: 'flex',
    gap: 12,
    marginTop: 30,
  },
  btnPrimary: {
    flex: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '14px 24px',
    fontSize: 16,
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'Cairo', sans-serif",
  },
  btnSecondary: {
    flex: 1,
    background: '#f9fafb',
    color: '#374151',
    border: '2px solid #e5e7eb',
    borderRadius: 12,
    padding: '14px 24px',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: "'Cairo', sans-serif",
  },
  btnSkip: {
    background: 'transparent',
    color: '#6b7280',
    border: 'none',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 15,
    fontFamily: "'Cairo', sans-serif",
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
  photoCard: {
    background: '#fff',
    borderRadius: 24,
    padding: 40,
    maxWidth: 500,
    width: '90%',
  },
  photoTitle: {
    fontSize: 24,
    fontWeight: 800,
    textAlign: 'center',
    marginBottom: 20,
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
    width: 60,
    height: 60,
    border: '6px solid rgba(255,255,255,0.3)',
    borderTop: '6px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  aiProgress: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 800,
  },
  photoActions: {
    display: 'flex',
    gap: 12,
  },
};

// ═══════════════════════════════════════════════════════════════════════
// 🎬 CSS Keyframes (Add to global CSS)
// ═══════════════════════════════════════════════════════════════════════
/*
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
*/
