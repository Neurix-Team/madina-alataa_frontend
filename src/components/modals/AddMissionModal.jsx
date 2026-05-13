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

const cardClass =
  'rounded-[28px] border border-sky-100 bg-white p-5 shadow-xl shadow-sky-100/70 md:p-6';

const fieldClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-sky-50 focus:ring-4 focus:ring-sky-100';

const rewardsConfig = [
  { name: 'kpReward', icon: FaTrophy, color: 'text-yellow-300', label: 'نقاط الخير' },
  { name: 'xpReward', icon: FaStar, color: 'text-fuchsia-300', label: 'نقاط الخبرة' },
  { name: 'impactReward', icon: FaLeaf, color: 'text-emerald-300', label: 'نقاط التأثير' },
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
        locationId: formData.locationId.trim(),
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-md md:p-8" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.2 }}
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-sky-100 bg-slate-50 shadow-2xl shadow-slate-300/60"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(240,249,255,0.98),rgba(255,255,255,0.5)_45%,rgba(238,242,255,0.58))]" />

            <div className="relative flex items-start justify-between gap-4 border-b border-slate-200 bg-white/90 px-6 py-5 md:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-lg">
                  <FaPlus className="text-lg" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-slate-950">إضافة مهمة جديدة</h3>
                  <p className="mt-1 text-sm font-medium text-slate-600">واجهة واضحة لإدخال بيانات المهمة والمكافآت وربطها بعنوان محدد.</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm"
              >
                <FaTimes />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="relative flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
              <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="grid gap-7">
                  <section className={cardClass}>
                    <div className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-sky-700">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600">
                        <FaTasks className="text-sky-600" />
                      </div>
                      <span>البيانات الأساسية</span>
                    </div>

                    <div className="grid gap-6">
                      <div className="space-y-2.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <FaTasks className="text-sky-600" />
                          <span>عنوان المهمة</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          className={fieldClass}
                          placeholder="أدخل عنوان المهمة"
                        />
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2.5">
                          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <FaShieldAlt className="text-violet-300" />
                            <span>درجة الصعوبة</span>
                          </label>
                          <div className="relative">
                            <select
                              name="difficulty"
                              value={formData.difficulty}
                              onChange={handleChange}
                              className={fieldClass}
                            >
                              <option value={0}>سهل</option>
                              <option value={1}>متوسط</option>
                              <option value={2}>صعب</option>
                              <option value={3}>أسطوري</option>
                            </select>
                            <FaChartPie className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <FaStar className="text-amber-600" />
                            <span>المستوى الأدنى</span>
                          </label>
                          <input
                            type="number"
                            name="requiredLevel"
                            value={formData.requiredLevel}
                            onChange={handleChange}
                            min="1"
                            max="100"
                            className={fieldClass}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="overflow-hidden rounded-[28px] border border-sky-100 bg-white shadow-xl shadow-sky-100/70">
                    <LocationIdMapSelector
                      locations={locations}
                      selectedLocationId={formData.locationId}
                      onSelect={handleLocationSelect}
                      title="تحديد عنوان المهمة"
                      subtitle="اختر عنوانًا من العناوين المضافة ليتم إرسال `locationId` داخل الطلب."
                    />
                  </div>
                </div>

                <div className="grid gap-7">
                  <section className={cardClass}>
                    <div className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600">
                        <FaTrophy className="text-emerald-300" />
                      </div>
                      <span>المكافآت</span>
                    </div>

                    <div className="grid gap-5">
                      {rewardsConfig.map((reward) => (
                        <div key={reward.name} className="rounded-[20px] border border-sky-100 bg-white p-4 shadow-sm">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <label className={`flex items-center gap-2 text-sm font-semibold ${reward.color}`}>
                              <reward.icon />
                              <span>{reward.label}</span>
                            </label>
                            <span className="text-sm font-semibold text-slate-900">{formData[reward.name]}</span>
                          </div>
                          <input
                            type="number"
                            name={reward.name}
                            value={formData[reward.name]}
                            onChange={handleChange}
                            min="0"
                            className={fieldClass}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </form>

            <div className="relative flex gap-4 border-t border-slate-200 bg-white/90 px-6 py-5 md:px-8">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={onClose}
                className="flex-1 rounded-[22px] border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-700 shadow-sm"
                disabled={loading}
              >
                إلغاء
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                onClick={handleSubmit}
                className="flex flex-[1.4] items-center justify-center gap-3 rounded-[22px] bg-gradient-to-r from-sky-400 to-indigo-500 px-6 py-4 text-base font-semibold text-white shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>جاري الحفظ...</span>
                  </span>
                ) : (
                  <>
                    <FaPlus />
                    <span>إضافة المهمة</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function ReviewRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-sky-100 bg-white px-4 py-3.5 shadow-sm">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className={`text-sm font-semibold text-slate-900 ${mono ? 'font-mono break-all text-left' : ''}`} dir={mono ? 'ltr' : undefined}>
        {value}
      </span>
    </div>
  );
}

export default AddMissionModal;
