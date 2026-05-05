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
  'w-full rounded-2xl border border-white/10 bg-[#08101d]/80 px-4 py-3.5 text-white outline-none transition focus:border-blue-400/35 focus:bg-[#0d1728]';

const cardShell = 'rounded-[28px] border border-white/8 bg-white/5 p-6 md:p-7';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/88 backdrop-blur-xl p-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-[34px] border border-white/10 bg-[#0b1220] shadow-[0_30px_120px_rgba(15,23,42,0.55)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.10),transparent_25%)] pointer-events-none" />

            <div className="relative flex items-center justify-between gap-4 border-b border-white/8 bg-white/5 px-6 py-5 md:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl">
                  <FaEdit className="text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">تعديل المهمة</h3>
                  <p className="mt-1 text-sm font-bold text-slate-400">واجهة أوضح لتعديل البيانات والمكافآت والعنوان</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.06, rotate: 90 }}
                whileTap={{ scale: 0.94 }}
                onClick={onClose}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-slate-300"
              >
                <FaTimes />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="relative max-h-[calc(92vh-88px)] overflow-y-auto px-6 py-6 md:px-8 md:py-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
                <div className="grid gap-6">
                  <section className={cardShell}>
                    <div className="mb-5 flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-blue-300">
                      <FaTasks />
                      <span>المعلومات الأساسية</span>
                    </div>
                    <div className="grid gap-5">
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-300">
                          <FaTasks className="text-blue-300" />
                          <span>عنوان المهمة</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          className={fieldShell}
                          placeholder="أدخل عنوان المهمة"
                        />
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-300">
                            <FaShieldAlt className="text-indigo-300" />
                            <span>مستوى الصعوبة</span>
                          </label>
                          <select name="difficulty" value={formData.difficulty} onChange={handleChange} className={fieldShell}>
                            <option value={0}>سهل</option>
                            <option value={1}>متوسط</option>
                            <option value={2}>صعب</option>
                            <option value={3}>أسطوري</option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-300">
                            <FaStar className="text-yellow-300" />
                            <span>الحالة</span>
                          </label>
                          <select name="status" value={formData.status} onChange={handleChange} className={fieldShell}>
                            <option value={1}>نشطة</option>
                            <option value={0}>غير نشطة</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-300">
                          <FaLayerGroupSafe />
                          <span>المستوى المطلوب</span>
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

                  <LocationIdMapSelector
                    locations={locations}
                    selectedLocationId={formData.locationId}
                    onSelect={handleLocationSelect}
                    title="تعديل العنوان"
                    subtitle="اختر عنوانًا واضحًا من الخريطة ليتم تحديث locationId."
                  />
                </div>

                <div className="grid gap-6">
                  <section className={cardShell}>
                    <div className="mb-5 flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-amber-300">
                      <FaTrophy />
                      <span>المكافآت</span>
                    </div>
                    <div className="grid gap-4">
                      {rewardConfig.map(({ key, label, icon: Icon, accent }) => (
                        <div key={key} className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                          <label className={`mb-3 flex items-center gap-2 text-sm font-black ${accent}`}>
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

                  <section className={cardShell}>
                    <div className="mb-5 flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-slate-300">
                      <FaMapMarkerAlt />
                      <span>مراجعة سريعة</span>
                    </div>
                    <div className="grid gap-3">
                      <ReviewRow label="معرف المهمة" value={mission?.id || 'غير متوفر'} mono />
                      <ReviewRow label="Location ID" value={formData.locationId || 'غير محدد'} mono />
                      <ReviewRow label="الصعوبة" value={['سهل', 'متوسط', 'صعب', 'أسطوري'][formData.difficulty] || 'غير محدد'} />
                      <ReviewRow label="الحالة" value={Number(formData.status) === 1 ? 'نشطة' : 'غير نشطة'} />
                    </div>
                  </section>
                </div>
              </div>

              <div className="mt-6 flex gap-4 border-t border-white/8 pt-6">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-[22px] border border-white/8 bg-white/5 px-6 py-4 text-lg font-black text-slate-200"
                  disabled={loading}
                >
                  إلغاء
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="flex-[1.4] rounded-[22px] bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4 text-lg font-black text-white shadow-xl"
                  disabled={loading}
                >
                  {loading ? 'جاري تحديث المهمة...' : 'حفظ التعديلات'}
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
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-white/8 bg-black/20 px-4 py-3">
      <span className="text-sm font-bold text-slate-400">{label}</span>
      <span className={`text-sm font-black text-white ${mono ? 'font-mono break-all text-left' : ''}`} dir={mono ? 'ltr' : undefined}>
        {value}
      </span>
    </div>
  );
}

function FaLayerGroupSafe() {
  return <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-300" />;
}
