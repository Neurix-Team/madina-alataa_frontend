import React, { useEffect, useMemo, useState } from 'react';
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
import partnersService from '../../services/partnersService';
import LocationIdMapSelector from '../shared/LocationIdMapSelector';

const panelClass =
  'rounded-[28px] border border-white/12 bg-white/[0.06] p-5 md:p-6 shadow-[0_16px_48px_rgba(15,23,42,0.28)] backdrop-blur-sm';

const fieldClassBase =
  'w-full rounded-2xl border border-white/12 bg-[#112033] px-4 py-3 text-base font-medium text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-sky-400/45 focus:bg-[#16283d]';

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
  const [partners, setPartners] = useState([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(false);

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

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadPartners = async () => {
      setIsLoadingPartners(true);
      try {
        const response = await partnersService.getPartners(1, 100);
        if (!isMounted) return;
        setPartners(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch partners for donation request modal:', error);
        if (!isMounted) return;
        setPartners([]);
      } finally {
        if (isMounted) {
          setIsLoadingPartners(false);
        }
      }
    };

    loadPartners();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const partnerOptions = useMemo(
    () =>
      partners.map((partner) => ({
        id: String(partner?.id || partner?.partnerId || ''),
        label: partner?.orgName || partner?.name || partner?.email || partner?.id || 'شريك',
      })),
    [partners]
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
    `${fieldClassBase} ${errors[name] ? 'border-red-400/55' : ''}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-[30px] border border-white/12 bg-[#0f1b2d] shadow-[0_28px_90px_rgba(15,23,42,0.5)]"
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          <div className="relative border-b border-white/10 bg-white/[0.05] px-6 py-5 md:px-8">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.08),transparent_24%)]" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg">
                  <FaHandHoldingHeart className="text-lg" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">إضافة طلب تبرع جديد</h2>
                  <p className="mt-1 text-sm font-medium text-slate-300">نموذج منظم لإنشاء الطلب مع اختيار العنوان من الخريطة مباشرة.</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-slate-200"
              >
                <FaTimes />
              </motion.button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-h-[calc(92vh-88px)] overflow-y-auto px-6 py-6 md:px-8 md:py-8">
            <div className="grid gap-7 lg:grid-cols-[1fr_0.95fr]">
              <div className="grid gap-7">
                <section className={panelClass}>
                  <div className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-rose-200">
                    <FaHandHoldingHeart />
                    <span>البيانات الأساسية</span>
                  </div>
                  <div className="grid gap-6">
                    <div>
                      <label className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <FaHandHoldingHeart className="text-rose-300" />
                        <span>عنوان الطلب</span>
                      </label>
                      <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="أدخل عنوان الطلب" className={fieldClass('title')} />
                      {errors.title && <div className="mt-2 text-sm font-medium text-red-300">{errors.title}</div>}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
                          <FaMoneyBillWave className="text-emerald-300" />
                          <span>مبلغ التبرع</span>
                        </label>
                        <input type="number" name="donateAmount" value={formData.donateAmount} onChange={handleInputChange} step="0.01" min="1" className={fieldClass('donateAmount')} dir="ltr" />
                        {errors.donateAmount && <div className="mt-2 text-sm font-medium text-red-300">{errors.donateAmount}</div>}
                      </div>

                      <div>
                        <label className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
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
                      <label className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
                        <FaBuilding className="text-violet-300" />
                        <span>الشريك</span>
                      </label>
                      <select name="partnerId" value={formData.partnerId} onChange={handleInputChange} className={fieldClass('partnerId')}>
                        <option value="" className="bg-slate-900">
                          {isLoadingPartners ? 'جاري تحميل الشركاء...' : 'اختر الشريك'}
                        </option>
                        {partnerOptions.map((partner) => (
                          <option key={partner.id} value={partner.id} className="bg-slate-900">
                            {partner.label}
                          </option>
                        ))}
                      </select>
                      {errors.partnerId && <div className="mt-2 text-sm font-medium text-red-300">{errors.partnerId}</div>}
                    </div>

                    <div>
                      <label className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-slate-200">
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
                {errors.locationId && <div className="px-2 text-sm font-medium text-red-300">{errors.locationId}</div>}
              </div>

              <div className="grid gap-7">
                <section className={panelClass}>
                  <div className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-200">
                    <FaInfoCircle />
                    <span>مراجعة سريعة</span>
                  </div>
                  <div className="grid gap-4">
                    <ReviewRow label="العنوان" value={formData.title || 'غير محدد'} />
                    <ReviewRow label="المبلغ" value={`${formData.donateAmount || 0} ج.م`} />
                    <ReviewRow
                      label="الشريك"
                      value={partnerOptions.find((partner) => partner.id === formData.partnerId)?.label || 'غير محدد'}
                    />
                    <ReviewRow label="Location ID" value={formData.locationId || 'غير محدد'} mono />
                    <ReviewRow label="الأهمية" value={urgencyLevels.find((item) => item.value === Number(formData.urgencyLevel))?.label || 'غير محدد'} />
                  </div>
                </section>

                <section className={panelClass}>
                  <div className="mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-amber-200">
                    <FaExclamationTriangle />
                    <span>ملاحظات</span>
                  </div>
                  <ul className="grid gap-4 text-sm font-medium leading-6 text-slate-200">
                    <li className="rounded-[18px] border border-white/10 bg-[#112033] px-4 py-3.5">سيتم إرسال التوكن تلقائيًا مع الطلب عبر `axiosClient`.</li>
                    <li className="rounded-[18px] border border-white/10 bg-[#112033] px-4 py-3.5">اختيار العنوان من الخريطة يملأ `locationId` مباشرة من العناوين المسجلة.</li>
                    <li className="rounded-[18px] border border-white/10 bg-[#112033] px-4 py-3.5">يمكنك ترك الوصف المختصر فارغًا، وسيُرسل `null` إلى الـ API.</li>
                  </ul>
                </section>
              </div>
            </div>

            {errors.submit && (
              <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3.5 text-sm font-medium text-red-200">
                {errors.submit}
              </div>
            )}

            <div className="mt-7 flex gap-4 border-t border-white/10 pt-7">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={onClose}
                className="flex-1 rounded-[22px] border border-white/10 bg-white/[0.06] px-6 py-4 text-base font-semibold text-slate-200"
                disabled={isSubmitting}
              >
                إلغاء
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className="flex-[1.4] rounded-[22px] bg-gradient-to-r from-rose-400 to-pink-500 px-6 py-4 text-base font-semibold text-white shadow-xl"
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
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-[#112033] px-4 py-3.5">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <span className={`text-sm font-semibold text-slate-100 ${mono ? 'font-mono break-all text-left' : ''}`} dir={mono ? 'ltr' : undefined}>
        {value}
      </span>
    </div>
  );
}

export default CreateDonationRequestModal;
