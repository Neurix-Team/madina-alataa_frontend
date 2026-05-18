// ═══════════════════════════════════════════════════════════════════════
// 🎨 ProfileTab - Refactored & Clean (Professional)
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useRef } from 'react';
import JellyButton from '../common/JellyButton';
import AudioManager from '../../services/AudioManager';
import AvatarPreview from '../avatar/AvatarPreview';
import CustomSection from '../avatar/CustomSection';
import { AVATAR_OPTIONS } from '../../data/avatarOptions';
import { showAppConfirm } from '../../utils/appAlerts';

export default function ProfileTab({ avatarTheme, onSetColor, onSetAccessory, userStats }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [avatarData, setAvatarData] = useState({
    name: userStats?.name || 'البطل',
    gender: 'boy',
    skinTone: 'medium',
    hairStyle: 'short',
    hairColor: 'black',
    accessories: [],
    clothes: 'tshirt',
    background: 'gradient1',
    photoUrl: null,
    aiAvatarUrl: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const fileInputRef = useRef(null);

  const [savedPresets, setSavedPresets] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');

  const userKP = userStats?.kp || 0;
  const userLevel = userStats?.level || 1;

  // ─────────────────────────────────────────────────────────────────────
  // 🎨 Handlers
  // ─────────────────────────────────────────────────────────────────────

  const updateAvatarProp = (key, value) => {
    setAvatarData(prev => ({ ...prev, [key]: value }));
    AudioManager.getInstance().play('toggle');
  };

  const toggleAccessory = (accessoryId) => {
    const accessory = AVATAR_OPTIONS.accessories.find(a => a.id === accessoryId);
    
    if (!accessory.unlocked && userLevel < (accessory.level || 0)) {
      AudioManager.getInstance().play('error');
      alert(`هذا الإكسسوار مقفل! يتطلب المستوى ${accessory.level}`);
      return;
    }

    if (!accessory.unlocked && accessory.price > userKP) {
      AudioManager.getInstance().play('error');
      alert(`نقاطك غير كافية! تحتاج ${accessory.price} نقطة`);
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

  const purchaseItem = (item) => {
    if (userKP < item.price) {
      AudioManager.getInstance().play('error');
      alert(`نقاطك غير كافية! تحتاج ${item.price} نقطة`);
      return;
    }
    AudioManager.getInstance().play('success');
    alert(`تم الشراء بنجاح! 🎉`);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار صورة صحيحة');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً');
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
      await new Promise(resolve => setTimeout(resolve, 3000));
      const mockAiAvatarUrl = photoData;
      setAvatarData(prev => ({ ...prev, aiAvatarUrl: mockAiAvatarUrl, photoUrl: photoData }));
      setAiProgress(100);
      
      setTimeout(() => {
        setIsProcessingAI(false);
        AudioManager.getInstance().play('success');
      }, 1000);
    } catch (error) {
      console.error('AI Error:', error);
      alert('حدث خطأ في إنشاء الأفاتار');
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

  const savePreset = () => {
    if (!presetName.trim()) {
      alert('الرجاء إدخال اسم للحفظ');
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
    alert('تم حفظ التصميم بنجاح! ✨');
  };

  const loadPreset = (preset) => {
    setAvatarData(preset.data);
    AudioManager.getInstance().play('success');
  };

  const deletePreset = async (presetId) => {
    const confirmed = await showAppConfirm({
      title: 'حذف التصميم',
      message: 'هل تريد حذف هذا التصميم المحفوظ؟',
      type: 'warning',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
    });

    if (!confirmed) return;

    setSavedPresets(prev => prev.filter(p => p.id !== presetId));
    AudioManager.getInstance().play('click');
  };

  // ─────────────────────────────────────────────────────────────────────
  // 🎬 Render
  // ─────────────────────────────────────────────────────────────────────

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <h2 className="profile-title">🎨 غرفة التجهيزات</h2>
        <p className="profile-subtitle">خصّص مظهرك وشخصيتك بشكل احترافي!</p>
        <div className="profile-kp-badge">
          ✨ نقاطك: <strong>{userKP.toLocaleString()}</strong> KP
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="profile-tab-nav">
        {[
          { id: 'basic', label: 'أساسي', icon: '🎨' },
          { id: 'advanced', label: 'متقدم', icon: '⚡' },
          { id: 'photo', label: 'AI Photo', icon: '📸' },
          { id: 'shop', label: 'المتجر', icon: '🛍️' },
          { id: 'presets', label: 'المحفوظات', icon: '💾' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`profile-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id); AudioManager.getInstance().play('nav'); }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 800 }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="profile-main-content">
        {/* Preview Section */}
        <div className="profile-preview-section">
          <AvatarPreview avatar={avatarData} size="large" />
          
          <div className="profile-preview-actions">
            <JellyButton
              variant="primary"
              size="md"
              sound="click"
              onClick={() => setShowSaveModal(true)}
              style={{ flex: 1 }}
            >
              💾 حفظ
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

        {/* Customization Options */}
        <div className="profile-custom-section">
          {activeTab === 'basic' && <BasicTab avatarData={avatarData} updateAvatarProp={updateAvatarProp} />}
          {activeTab === 'advanced' && <AdvancedTab avatarData={avatarData} updateAvatarProp={updateAvatarProp} toggleAccessory={toggleAccessory} userLevel={userLevel} />}
          {activeTab === 'photo' && <PhotoTab avatarData={avatarData} fileInputRef={fileInputRef} handlePhotoUpload={handlePhotoUpload} handleRetakePhoto={handleRetakePhoto} />}
          {activeTab === 'shop' && <ShopTab userKP={userKP} userLevel={userLevel} purchaseItem={purchaseItem} />}
          {activeTab === 'presets' && <PresetsTab savedPresets={savedPresets} loadPreset={loadPreset} deletePreset={deletePreset} />}
        </div>
      </div>

      {/* Modals */}
      {photoPreview && <PhotoModal photoPreview={photoPreview} isProcessingAI={isProcessingAI} aiProgress={aiProgress} handleRetakePhoto={handleRetakePhoto} generateAIAvatar={generateAIAvatar} />}
      {showSaveModal && <SavePresetModal presetName={presetName} setPresetName={setPresetName} savePreset={savePreset} onClose={() => { setShowSaveModal(false); setPresetName(''); }} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// 📑 Tab Components (Separated for clarity)
// ═══════════════════════════════════════════════════════════════════════

function BasicTab({ avatarData, updateAvatarProp }) {
  return (
    <div className="profile-tab-content">
      <CustomSection title="الجنس" icon="👤">
        <div className="profile-option-grid-2">
          {AVATAR_OPTIONS.gender.map(opt => (
            <button
              key={opt.id}
              className={`profile-gender-btn ${avatarData.gender === opt.id ? 'active' : ''}`}
              style={{ borderColor: opt.color }}
              onClick={() => updateAvatarProp('gender', opt.id)}
            >
              <span style={{ fontSize: 48 }}>{opt.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 800 }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </CustomSection>

      <CustomSection title="لون البشرة" icon="🎨">
        <div className="profile-color-grid">
          {AVATAR_OPTIONS.skinTone.map(opt => (
            <button
              key={opt.id}
              className={`profile-color-btn ${avatarData.skinTone === opt.id ? 'active' : ''}`}
              style={{ backgroundColor: opt.color }}
              onClick={() => updateAvatarProp('skinTone', opt.id)}
              title={opt.label}
            />
          ))}
        </div>
      </CustomSection>

      <CustomSection title="تسريحة الشعر" icon="💇">
        <div className="profile-option-grid-4">
          {AVATAR_OPTIONS.hairStyle.map(opt => (
            <button
              key={opt.id}
              className={`profile-option-btn ${avatarData.hairStyle === opt.id ? 'active' : ''}`}
              onClick={() => updateAvatarProp('hairStyle', opt.id)}
            >
              <span style={{ fontSize: 32 }}>{opt.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700 }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </CustomSection>

      <CustomSection title="لون الشعر" icon="🌈">
        <div className="profile-color-grid">
          {AVATAR_OPTIONS.hairColor.map(opt => (
            <button
              key={opt.id}
              className={`profile-color-btn ${avatarData.hairColor === opt.id ? 'active' : ''}`}
              style={{ backgroundColor: opt.color }}
              onClick={() => updateAvatarProp('hairColor', opt.id)}
              title={opt.label}
            />
          ))}
        </div>
      </CustomSection>
    </div>
  );
}

function AdvancedTab({ avatarData, updateAvatarProp, toggleAccessory, userLevel }) {
  return (
    <div className="profile-tab-content">
      <CustomSection title="الإكسسوارات" icon="✨">
        <div className="profile-option-grid-4">
          {AVATAR_OPTIONS.accessories.map(opt => {
            const isLocked = !opt.unlocked && userLevel < (opt.level || 0);
            return (
              <button
                key={opt.id}
                className={`profile-accessory-btn ${avatarData.accessories.includes(opt.id) ? 'active' : ''}`}
                style={{ opacity: isLocked ? 0.4 : 1 }}
                onClick={() => toggleAccessory(opt.id)}
              >
                <span style={{ fontSize: 36 }}>{opt.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 700 }}>{opt.label}</span>
                {isLocked && <span className="profile-lock-badge">🔒 Lvl {opt.level}</span>}
                {!opt.unlocked && opt.price > 0 && !isLocked && (
                  <span className="profile-price-badge">{opt.price} KP</span>
                )}
              </button>
            );
          })}
        </div>
      </CustomSection>

      <CustomSection title="الملابس" icon="👕">
        <div className="profile-option-grid-3">
          {AVATAR_OPTIONS.clothes.map(opt => {
            const isLocked = !opt.unlocked && userLevel < (opt.level || 0);
            return (
              <button
                key={opt.id}
                className={`profile-clothes-btn ${avatarData.clothes === opt.id ? 'active' : ''}`}
                style={{ opacity: isLocked ? 0.4 : 1 }}
                onClick={() => !isLocked && updateAvatarProp('clothes', opt.id)}
              >
                <span style={{ fontSize: 32 }}>{opt.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{opt.label}</span>
                {isLocked && <span className="profile-lock-badge">🔒 Lvl {opt.level}</span>}
                {opt.price > 0 && <span className="profile-price-badge">{opt.price} KP</span>}
              </button>
            );
          })}
        </div>
      </CustomSection>

      <CustomSection title="الخلفية" icon="🌅">
        <div className="profile-option-grid-3">
          {AVATAR_OPTIONS.backgrounds.map(opt => {
            const isLocked = !opt.unlocked && userLevel < (opt.level || 0);
            const gradient = opt.colors.length > 1 
              ? `linear-gradient(135deg, ${opt.colors.join(', ')})`
              : opt.colors[0];
            
            return (
              <button
                key={opt.id}
                className={`profile-bg-btn ${avatarData.background === opt.id ? 'active' : ''}`}
                style={{ background: gradient, opacity: isLocked ? 0.4 : 1 }}
                onClick={() => !isLocked && updateAvatarProp('background', opt.id)}
              >
                <span className="profile-bg-label">{opt.label}</span>
                {isLocked && <span className="profile-lock-badge">🔒 Lvl {opt.level}</span>}
                {opt.price > 0 && <span className="profile-price-badge">{opt.price} KP</span>}
              </button>
            );
          })}
        </div>
      </CustomSection>
    </div>
  );
}

function PhotoTab({ avatarData, fileInputRef, handlePhotoUpload, handleRetakePhoto }) {
  return (
    <div className="profile-tab-content">
      <div className="profile-photo-section">
        <h3 className="profile-section-title">📸 أنشئ أفاتار بالذكاء الاصطناعي</h3>
        <p className="profile-photo-desc">
          التقط صورة شخصية أو ارفع صورة وسنحولها لأفاتار كرتوني رائع!
        </p>

        {!avatarData.aiAvatarUrl ? (
          <div className="profile-photo-upload-area">
            <div className="profile-photo-icon">📷</div>
            <p className="profile-photo-text">اضغط لالتقاط صورة</p>
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
              📸 التقط صورة
            </JellyButton>
          </div>
        ) : (
          <div className="profile-ai-avatar-result">
            <img src={avatarData.aiAvatarUrl} alt="AI Avatar" className="profile-ai-avatar-img" />
            <p className="profile-ai-credit">✨ تم إنشاؤه بواسطة الذكاء الاصطناعي</p>
            <JellyButton variant="secondary" size="md" sound="click" onClick={handleRetakePhoto}>
              🔄 إعادة التقاط
            </JellyButton>
          </div>
        )}
      </div>
    </div>
  );
}

function ShopTab({ userKP, userLevel, purchaseItem }) {
  return (
    <div className="profile-tab-content">
      <div className="profile-shop-header">
        <h3 className="profile-section-title">🛍️ متجر الإكسسوارات</h3>
        <div className="profile-kp-balance">
          رصيدك: <strong>{userKP.toLocaleString()}</strong> KP
        </div>
      </div>

      <CustomSection title="إكسسوارات مميزة" icon="👑">
        <div className="profile-shop-grid">
          {AVATAR_OPTIONS.accessories.filter(a => a.price > 0 && !a.unlocked).map(item => (
            <div key={item.id} className="profile-shop-item">
              <span style={{ fontSize: 48 }}>{item.emoji}</span>
              <h4 className="profile-shop-item-name">{item.label}</h4>
              <div className="profile-shop-item-price">💰 {item.price} KP</div>
              {item.level && <div className="profile-shop-item-level">المستوى {item.level} مطلوب</div>}
              <JellyButton
                variant={userKP >= item.price ? 'primary' : 'disabled'}
                size="sm"
                sound="success"
                onClick={() => purchaseItem(item)}
                disabled={userKP < item.price}
              >
                {userKP >= item.price ? '✅ شراء' : '🔒 مقفل'}
              </JellyButton>
            </div>
          ))}
        </div>
      </CustomSection>

      <CustomSection title="ملابس حصرية" icon="👕">
        <div className="profile-shop-grid">
          {AVATAR_OPTIONS.clothes.filter(c => c.price > 0 && !c.unlocked).map(item => (
            <div key={item.id} className="profile-shop-item">
              <span style={{ fontSize: 48 }}>{item.emoji}</span>
              <h4 className="profile-shop-item-name">{item.label}</h4>
              <div className="profile-shop-item-price">💰 {item.price} KP</div>
              {item.level && <div className="profile-shop-item-level">المستوى {item.level} مطلوب</div>}
              <JellyButton
                variant={userKP >= item.price ? 'primary' : 'disabled'}
                size="sm"
                sound="success"
                onClick={() => purchaseItem(item)}
                disabled={userKP < item.price}
              >
                {userKP >= item.price ? '✅ شراء' : '🔒 مقفل'}
              </JellyButton>
            </div>
          ))}
        </div>
      </CustomSection>
    </div>
  );
}

function PresetsTab({ savedPresets, loadPreset, deletePreset }) {
  return (
    <div className="profile-tab-content">
      <h3 className="profile-section-title">💾 التصاميم المحفوظة</h3>
      
      {savedPresets.length === 0 ? (
        <div className="profile-empty-state">
          <span style={{ fontSize: 64 }}>📭</span>
          <p style={{ fontSize: 16, color: '#64748b', marginTop: 10 }}>
            لم تحفظ أي تصاميم بعد
          </p>
        </div>
      ) : (
        <div className="profile-presets-grid">
          {savedPresets.map(preset => (
            <div key={preset.id} className="profile-preset-card">
              <AvatarPreview avatar={preset.data} size="small" />
              <h4 className="profile-preset-name">{preset.name}</h4>
              <p className="profile-preset-date">
                {new Date(preset.timestamp).toLocaleDateString('ar-EG')}
              </p>
              <div className="profile-preset-actions">
                <JellyButton variant="primary" size="sm" sound="click" onClick={() => loadPreset(preset)}>
                  📥 تحميل
                </JellyButton>
                <JellyButton variant="secondary" size="sm" sound="click" onClick={() => deletePreset(preset.id)}>
                  🗑️
                </JellyButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoModal({ photoPreview, isProcessingAI, aiProgress, handleRetakePhoto, generateAIAvatar }) {
  return (
    <div className="profile-overlay">
      <div className="profile-photo-modal">
        <h2 className="profile-photo-modal-title">
          {isProcessingAI ? '🎨 جاري إنشاء الأفاتار...' : '📸 صورتك'}
        </h2>
        
        <div className="profile-photo-preview-container">
          <img src={photoPreview} alt="Preview" className="profile-photo-preview" />
          
          {isProcessingAI && (
            <div className="profile-ai-overlay">
              <div className="profile-spinner" />
              <p className="profile-ai-progress-text">{aiProgress}%</p>
            </div>
          )}
        </div>

        {!isProcessingAI && (
          <div className="profile-photo-modal-actions">
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
  );
}

function SavePresetModal({ presetName, setPresetName, savePreset, onClose }) {
  return (
    <div className="profile-overlay">
      <div className="profile-save-modal">
        <h2 className="profile-save-modal-title">💾 حفظ التصميم</h2>
        <p className="profile-save-modal-desc">اختر اسماً لتصميمك الرائع</p>
        
        <input
          type="text"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          placeholder="اسم التصميم..."
          className="profile-preset-input"
          maxLength={20}
          dir="rtl"
        />

        <div className="profile-save-modal-actions">
          <JellyButton variant="secondary" size="md" sound="click" onClick={onClose}>
            إلغاء
          </JellyButton>
          <JellyButton variant="primary" size="md" sound="success" onClick={savePreset} disabled={!presetName.trim()}>
            ✅ حفظ
          </JellyButton>
        </div>
      </div>
    </div>
  );
}
