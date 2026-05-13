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

const fieldShell =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-sky-50 focus:ring-4 focus:ring-sky-100';

const cardShell = 'rounded-[28px] border border-amber-100 bg-white p-5 shadow-xl shadow-amber-100/60 md:p-6';

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-md" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.2 }}
            className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[30px] border border-amber-100 bg-slate-50 shadow-2xl shadow-slate-300/60"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,251,235,0.95),rgba(255,255,255,0.54)_45%,rgba(240,249,255,0.58))]" />

            <div className="relative flex items-start justify-between gap-4 border-b border-slate-200 bg-white/90 px-6 py-5 md:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                  <FaEdit className="text-lg" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-950">تعديل المهمة</h3>
                  <p className="mt-1 text-sm font-medium text-slate-600">واجهة واضحة لتعديل بيانات المهمة والمكافآت والموقع.</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.06, rotate: 90 }}
                whileTap={{ scale: 0.94 }}
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm"
              >
                <FaTimes />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="relative max-h-[calc(92vh-88px)] overflow-y-auto px-6 py-6 md:px-8 md:py-8">
              <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="grid gap-7">
                  <section className={cardShell}>
                    <div className="mb-6 flex items-center gap-3 px-1 text-sm font-bold uppercase tracking-[0.16em] text-sky-700">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
                        <FaTasks className="text-sky-600" />
                      </div>
                      <span>المعلومات الجوهرية للمهمة</span>
                    </div>
                    <div className="grid gap-6">
                      <div className="space-y-2.5">
                        <label className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-700">
                          <span>عنوان المهمة</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          className={fieldShell}
                          placeholder="أدخل عنوان المهمة بشكل احترافي"
                        />
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2.5">
                          <label className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-700">
                            <span>مستوى الصعوبة</span>
                          </label>
                          <select name="difficulty" value={formData.difficulty} onChange={handleChange} className={fieldShell}>
                            <option value={0}>سهل</option>
                            <option value={1}>متوسط</option>
                            <option value={2}>صعب</option>
                            <option value={3}>أسطوري</option>
                          </select>
                        </div>

                        <div className="space-y-2.5">
                          <label className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-700">
                            <span>الحالة التشغيلية</span>
                          </label>
                          <select name="status" value={formData.status} onChange={handleChange} className={fieldShell}>
                            <option value={1}>نشطة</option>
                            <option value={0}>غير نشطة</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <label className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-700">
                          <span>الحد الأدنى للمستوى</span>
                        </label>
                        <input
                          type="number"
                          name="requiredLevel"
                          value={formData.requiredLevel}
                          onChange={handleChange}
                          min="1"
                          max="100"
                          className={fieldShell}
                        />
                      </div>
                    </div>
                  </section>

                  <div className="overflow-hidden rounded-[28px] border border-amber-100 bg-white shadow-xl shadow-amber-100/70">
                    <LocationIdMapSelector
                      locations={locations}
                      selectedLocationId={formData.locationId}
                      onSelect={handleLocationSelect}
                      title="تحديث الإحداثيات"
                      subtitle="قم بتحديد الموقع الجغرافي الدقيق للمهمة عبر الخريطة التفاعلية."
                    />
                  </div>
                </div>

                <div className="grid gap-7">
                  <section className={cardShell}>
                    <div className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-amber-200 px-1">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
                        <FaTrophy className="text-amber-600" />
                      </div>
                      <span>نظام المكافآت الاستحقاقية</span>
                    </div>
                    <div className="grid gap-5">
                      {rewardConfig.map(({ key, label, icon: Icon, accent }) => (
                        <div key={key} className="space-y-3 rounded-[20px] border border-amber-100 bg-white p-4 shadow-sm">
                          <label className={`flex items-center gap-2 text-sm font-semibold ${accent}`}>
                            <Icon />
                            <span>{label}</span>
                          </label>
                          <input
                            type="number"
                            name={key}
                            value={formData[key]}
                            onChange={handleChange}
                            min="1"
                            className={fieldShell}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-4 border-t border-slate-200 pt-7 md:flex-row">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-[22px] border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-700 shadow-sm transition-all"
                  disabled={loading}
                >
                  إلغاء
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="flex-[1.6] rounded-[22px] bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-4 text-base font-semibold text-white shadow-xl transition-all"
                  disabled={loading}
                >
                  {loading ? 'جاري المزامنة...' : 'اعتماد وحفظ المهمة'}
                </motion.button>
              </div>
            </form>
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
