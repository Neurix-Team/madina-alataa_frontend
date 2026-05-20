import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaPlus,
  FaTasks,
  FaShieldAlt,
  FaStar,
  FaTrophy,
  FaLeaf,
  FaChartPie,
} from 'react-icons/fa';
import LocationIdMapSelector from '../shared/LocationIdMapSelector';

const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm';

const fieldClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200';

const rewardsConfig = [
  {
    name: 'kpReward',
    icon: FaTrophy,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'نقاط الخير',
    description: 'مكافأة عمل الخير',
  },
  {
    name: 'xpReward',
    icon: FaStar,
    iconColor: 'text-fuchsia-600',
    bgColor: 'bg-fuchsia-100',
    label: 'نقاط الخبرة',
    description: 'تساعد على رفع المستوى',
  },
  {
    name: 'impactReward',
    icon: FaLeaf,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    label: 'نقاط التأثير',
    description: 'قياس الأثر المجتمعي',
  },
];

const AddMissionModal = ({ isOpen, onClose, onSubmit, locations = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 1,
    requiredLevel: 1,
    kpReward: 1,
    xpReward: 1,
    impactReward: 1,
    locationId: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'difficulty' ||
        name === 'requiredLevel' ||
        name === 'kpReward' ||
        name === 'xpReward' ||
        name === 'impactReward'
          ? parseInt(value, 10) || 0
          : value,
    }));
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      locationId: String(location?.id || ''),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('يرجى إدخال عنوان المهمة');
      return;
    }

    if (!formData.locationId.trim()) {
      alert('يرجى اختيار العنوان من الخريطة');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: formData.title.trim(),
        difficulty: Number(formData.difficulty) || 1,
        requiredLevel: Number(formData.requiredLevel) || 1,
        kpReward: Number(formData.kpReward) || 1,
        xpReward: Number(formData.xpReward) || 1,
        impactReward: Number(formData.impactReward) || 1,
        locationId: String(formData.locationId),
      });
      setFormData({
        title: '',
        difficulty: 1,
        requiredLevel: 1,
        kpReward: 1,
        xpReward: 1,
        impactReward: 1,
        locationId: '',
      });
      onClose();
    } catch (err) {
      console.error('Error in AddMissionModal:', err);
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-blue-50/30 focus:ring-4 focus:ring-blue-100/50';

  const labelClass = 'block text-sm font-bold text-slate-700 mb-2 mr-1';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="app-modal-overlay" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="app-modal-card"
          >
            {/* Header */}
            <div className="app-modal-header">
              <div className="flex items-center gap-4">
                <div
                  className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ background: 'var(--bg-card-2)', color: 'var(--primary)', border: '1px solid var(--border)' }}
                >
                  <FaPlus className="text-xl" />
                </div>
                <div>
                  <h3 className="app-modal-title">إضافة مهمة جديدة</h3>
                  <p className="app-modal-subtitle">قم بتحديد عنوان المهمة والمكافآت والموقع</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="app-modal-close"
              >
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto">
              <form onSubmit={handleSubmit} className="app-form">
                <div className="app-form-grid">
                  <div className="space-y-5">
                    <div className="app-form-group">
                      <label className="app-form-label">عنوان المهمة</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="app-form-input w-full"
                        placeholder="مثال: تنظيف الحديقة المركزية"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="app-form-group">
                        <label className="app-form-label">الصعوبة</label>
                        <select
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleChange}
                          className="app-form-select w-full"
                        >
                          <option value={1}>سهل</option>
                          <option value={2}>متوسط</option>
                          <option value={3}>صعب</option>
                        </select>
                      </div>
                      <div className="app-form-group">
                        <label className="app-form-label">المستوى المطلوب</label>
                        <input
                          type="number"
                          name="requiredLevel"
                          value={formData.requiredLevel}
                          onChange={handleChange}
                          className="app-form-input w-full"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {rewardsConfig.map((reward) => (
                        <div key={reward.name} className="app-form-group">
                          <label className="app-form-label">{reward.label}</label>
                          <div className="relative">
                            <reward.icon className={`absolute right-3 top-1/2 -translate-y-1/2 ${reward.iconColor}`} />
                            <input
                              type="number"
                              name={reward.name}
                              value={formData[reward.name]}
                              onChange={handleChange}
                              className="app-form-input w-full pr-10 text-center"
                              min="0"
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="app-form-group">
                    <label className="app-form-label">اختر الموقع من الخريطة</label>
                    <LocationIdMapSelector
                      locations={locations}
                      selectedLocationId={formData.locationId}
                      onLocationSelect={handleLocationSelect}
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="app-form-actions pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="app-btn-primary flex-1 py-4 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <FaPlus className="text-sm" />
                        <span>إضافة المهمة الجديدة</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="app-btn-secondary px-8 py-4"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );};

export default AddMissionModal;
