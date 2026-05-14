import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEdit,
  FaLeaf,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaStar,
  FaTasks,
  FaTimes,
  FaTrophy,
} from 'react-icons/fa';
import LocationIdMapSelector from '../shared/LocationIdMapSelector';

const rewardConfig = [
  { key: 'kpReward', label: 'نقاط الخير', icon: FaTrophy, accent: 'text-yellow-300' },
  { key: 'xpReward', label: 'نقاط الخبرة', icon: FaStar, accent: 'text-fuchsia-300' },
  { key: 'impactReward', label: 'نقاط التأثير', icon: FaLeaf, accent: 'text-emerald-300' },
];

export default function EditMissionModal({ isOpen, onClose, onSubmit, mission, locations = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 0,
    requiredLevel: '',
    kpReward: '',
    xpReward: '',
    impactReward: '',
    locationId: '',
    status: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mission) return;
    setFormData({
      title: mission.title || '',
      difficulty: mission.difficulty || 0,
      requiredLevel: mission.requiredLevel?.toString() || '',
      kpReward: mission.kpReward?.toString() || '',
      xpReward: mission.xpReward?.toString() || '',
      impactReward: mission.impactReward?.toString() || '',
      locationId: mission.locationId || '',
      status: mission.status !== undefined ? mission.status : 1,
    });
  }, [mission]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: name === 'difficulty' || name === 'status' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleLocationSelect = (location) => {
    setFormData((current) => ({
      ...current,
      locationId: String(location?.id || ''),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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
      await onSubmit(mission.id, {
        title: formData.title.trim(),
        difficulty: formData.difficulty,
        requiredLevel: formData.requiredLevel,
        kpReward: formData.kpReward,
        xpReward: formData.xpReward,
        impactReward: formData.impactReward,
        locationId: formData.locationId,
        status: formData.status,
      });
      onClose();
    } catch (error) {
      console.error('Error updating mission:', error);
      const apiErrors = error.response?.data?.errors;
      let errorMessage = 'فشل في تحديث المهمة.';
      if (apiErrors) {
        errorMessage += `\n${Object.values(apiErrors).flat().join('\n')}`;
      } else if (error.response?.data?.message || error.response?.data?.title) {
        errorMessage += `\n${error.response.data.message || error.response.data.title}`;
      }
      alert(errorMessage);
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
                <div className="w-[52px] h-[52px] rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                  <FaEdit className="text-xl" />
                </div>
                <div>
                  <h3 className="app-modal-title">تعديل المهمة</h3>
                  <p className="app-modal-subtitle">تحديث بيانات المهمة والمكافآت والموقع</p>
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
                        placeholder="عنوان المهمة"
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
                      {rewardConfig.map((reward) => (
                        <div key={reward.key} className="app-form-group">
                          <label className="app-form-label">{reward.label}</label>
                          <div className="relative">
                            <reward.icon className={`absolute right-3 top-1/2 -translate-y-1/2 ${reward.accent}`} />
                            <input
                              type="number"
                              name={reward.key}
                              value={formData[reward.key]}
                              onChange={handleChange}
                              className="app-form-input w-full pr-10 text-center"
                              min="0"
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="app-form-group">
                      <label className="app-form-label">حالة المهمة</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="app-form-select w-full"
                      >
                        <option value={1}>نشطة</option>
                        <option value={0}>غير نشطة</option>
                      </select>
                    </div>
                  </div>

                  <div className="app-form-group">
                    <label className="app-form-label">تغيير الموقع من الخريطة</label>
                    <LocationIdMapSelector
                      locations={locations}
                      selectedLocationId={formData.locationId}
                      onLocationSelect={handleLocationSelect}
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="app-form-actions pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="app-btn-primary flex-1 py-4 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <FaEdit className="text-sm" />
                        <span>تحديث المهمة</span>
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
  );
}

function ReviewRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-amber-100 bg-white px-4 py-3.5 shadow-sm">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className={`text-sm font-semibold text-slate-900 ${mono ? 'font-mono break-all text-left' : ''}`} dir={mono ? 'ltr' : undefined}>
        {value}
      </span>
    </div>
  );
}

function FaLayerGroupSafe() {
  return <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-300" />;
}
