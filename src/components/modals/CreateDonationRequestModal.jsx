import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaHandHoldingHeart,
  FaSave,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaBuilding,
  FaInfoCircle,
  FaSpinner,
} from 'react-icons/fa';
import { donationRequestsService } from '../../services/donationRequestsService';
import LocationIdMapSelector from '../shared/LocationIdMapSelector';

const CreateDonationRequestModal = ({ isOpen, onClose, onSuccess, locations = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    locationId: '',
    donateAmount: 1,
    urgencyLevel: 1,
    briefDescription: '',
    partnerId: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const urgencyLevels = useMemo(
    () => [
      { value: 1, label: 'منخفض' },
      { value: 2, label: 'متوسط' },
      { value: 3, label: 'عالي' },
      { value: 4, label: 'حرج' },
      { value: 5, label: 'طارئ' },
    ],
    []
  );

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'عنوان الطلب مطلوب';
    if (!formData.locationId.trim()) newErrors.locationId = 'اختيار العنوان من الخريطة مطلوب';
    if (!formData.donateAmount || formData.donateAmount <= 0) newErrors.donateAmount = 'مبلغ التبرع يجب أن يكون أكبر من صفر';
    if (!formData.partnerId.trim()) newErrors.partnerId = 'معرف الشريك مطلوب';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        locationId: formData.locationId.trim(),
        donateAmount: parseFloat(formData.donateAmount),
        urgencyLevel: parseInt(formData.urgencyLevel, 10),
        briefDescription: formData.briefDescription.trim() || null,
        partnerId: formData.partnerId.trim(),
      };

      const response = await donationRequestsService.createDonationRequest(payload);
      const responseData = response?.data || response;
      const requestId =
        responseData?.id || responseData?.requestId || responseData?.donationRequestId || 'غير متوفر';

      alert(`تم إنشاء طلب التبرع بنجاح.\nمعرف الطلب: ${requestId}`);

      setFormData({
        title: '',
        locationId: '',
        donateAmount: 1,
        urgencyLevel: 1,
        briefDescription: '',
        partnerId: '',
      });
      setErrors({});

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create donation request:', error);
      const errorMessage = error.message || 'فشل في إنشاء طلب التبرع';
      alert(`خطأ في إنشاء طلب التبرع:\n${errorMessage}`);
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      locationId: String(location?.id || ''),
    }));

    if (errors.locationId) {
      setErrors((prev) => ({ ...prev, locationId: '' }));
    }
  };

  if (!isOpen) return null;

  const fieldClass = (name) =>
    `w-full rounded-2xl border ${errors[name] ? 'border-red-500/50' : 'border-white/10'} bg-[#08101d]/85 px-4 py-3.5 text-white outline-none transition focus:border-blue-400/35 focus:bg-[#0d1728]`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-[34px] border border-white/10 bg-[#0b1220] shadow-[0_30px_120px_rgba(15,23,42,0.55)]"
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          <div className="relative border-b border-white/8 bg-white/5 px-6 py-5 md:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_25%)] pointer-events-none" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-xl">
                  <FaHandHoldingHeart className="text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">إضافة طلب تبرع جديد</h2>
                  <p className="mt-1 text-sm font-bold text-slate-400">إنشاء الطلب مع اختيار العنوان من الخريطة مباشرة</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-slate-300"
              >
                <FaTimes />
              </motion.button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-h-[calc(92vh-88px)] overflow-y-auto px-6 py-6 md:px-8 md:py-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
              <div className="grid gap-6">
                <section className="rounded-[28px] border border-white/8 bg-white/5 p-6 md:p-7">
                  <div className="mb-5 flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-pink-300">
                    <FaHandHoldingHeart />
                    <span>البيانات الأساسية</span>
                  </div>
                  <div className="grid gap-5">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-300">
                        <FaHandHoldingHeart className="text-pink-300" />
                        <span>عنوان الطلب</span>
                      </label>
                      <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="أدخل عنوان الطلب" className={fieldClass('title')} />
                      {errors.title && <div className="mt-2 text-sm font-bold text-red-300">{errors.title}</div>}
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-300">
                          <FaMoneyBillWave className="text-emerald-300" />
                          <span>مبلغ التبرع</span>
                        </label>
                        <input type="number" name="donateAmount" value={formData.donateAmount} onChange={handleInputChange} step="0.01" min="1" className={fieldClass('donateAmount')} dir="ltr" />
                        {errors.donateAmount && <div className="mt-2 text-sm font-bold text-red-300">{errors.donateAmount}</div>}
                      </div>

                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-300">
                          <FaInfoCircle className="text-amber-300" />
                          <span>مستوى الأهمية</span>
                        </label>
                        <select name="urgencyLevel" value={formData.urgencyLevel} onChange={handleInputChange} className={fieldClass('urgencyLevel')}>
                          {urgencyLevels.map((level) => (
                            <option key={level.value} value={level.value} className="bg-slate-900">
                              {level.label} ({level.value})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-300">
                        <FaBuilding className="text-violet-300" />
                        <span>معرف الشريك</span>
                      </label>
                      <input type="text" name="partnerId" value={formData.partnerId} onChange={handleInputChange} placeholder="أدخل معرف الشريك" className={fieldClass('partnerId')} dir="ltr" />
                      {errors.partnerId && <div className="mt-2 text-sm font-bold text-red-300">{errors.partnerId}</div>}
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-black text-slate-300">
                        <FaInfoCircle className="text-cyan-300" />
                        <span>وصف مختصر</span>
                      </label>
                      <textarea name="briefDescription" value={formData.briefDescription} onChange={handleInputChange} rows="5" placeholder="أدخل وصفًا مختصرًا للطلب" className={`${fieldClass('briefDescription')} resize-none`} />
                    </div>
                  </div>
                </section>

                <LocationIdMapSelector
                  locations={locations}
                  selectedLocationId={formData.locationId}
                  onSelect={handleLocationSelect}
                  title="اختيار عنوان الطلب"
                  subtitle="اختر عنوانًا من العناوين المضافة ليتم إرسال locationId في body طلب التبرع."
                />
                {errors.locationId && <div className="text-sm font-bold text-red-300 px-2">{errors.locationId}</div>}
              </div>

              <div className="grid gap-6">
                <section className="rounded-[28px] border border-white/8 bg-white/5 p-6 md:p-7">
                  <div className="mb-5 flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-slate-300">
                    <FaInfoCircle />
                    <span>مراجعة سريعة</span>
                  </div>
                  <div className="grid gap-3">
                    <ReviewRow label="العنوان" value={formData.title || 'غير محدد'} />
                    <ReviewRow label="المبلغ" value={`${formData.donateAmount || 0} ج.م`} />
                    <ReviewRow label="Partner ID" value={formData.partnerId || 'غير محدد'} mono />
                    <ReviewRow label="Location ID" value={formData.locationId || 'غير محدد'} mono />
                    <ReviewRow label="الأهمية" value={urgencyLevels.find((item) => item.value === Number(formData.urgencyLevel))?.label || 'غير محدد'} />
                  </div>
                </section>

                <section className="rounded-[28px] border border-white/8 bg-white/5 p-6 md:p-7">
                  <div className="mb-4 flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-amber-300">
                    <FaExclamationTriangle />
                    <span>ملاحظات</span>
                  </div>
                  <ul className="grid gap-3 text-sm font-bold text-slate-300">
                    <li className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3">سيتم إرسال التوكن تلقائيًا مع الطلب عبر `axiosClient`.</li>
                    <li className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3">اختيار العنوان من الخريطة يملأ `locationId` مباشرة من العناوين المسجلة.</li>
                    <li className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3">يمكنك ترك الوصف المختصر فارغًا، وسيُرسل `null` إلى الـ API.</li>
                  </ul>
                </section>
              </div>
            </div>

            {errors.submit && (
              <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
                {errors.submit}
              </div>
            )}

            <div className="mt-6 flex gap-4 border-t border-white/8 pt-6">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={onClose}
                className="flex-1 rounded-[22px] border border-white/8 bg-white/5 px-6 py-4 text-lg font-black text-slate-200"
                disabled={isSubmitting}
              >
                إلغاء
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="flex-[1.4] rounded-[22px] bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-4 text-lg font-black text-white shadow-xl"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <FaSpinner className="animate-spin" />
                    <span>جاري الإنشاء...</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <FaSave />
                    <span>إضافة طلب جديد</span>
                  </span>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

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

export default CreateDonationRequestModal;
