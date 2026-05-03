import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaHandHoldingHeart,
  FaSave,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaBuilding,
  FaInfoCircle,
} from 'react-icons/fa';
import { donationRequestsService } from '../../services/donationRequestsService';

const CreateDonationRequestModal = ({ isOpen, onClose, onSuccess }) => {
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

  const urgencyLevels = [
    { value: 1, label: 'منخفض' },
    { value: 2, label: 'متوسط' },
    { value: 3, label: 'عالي' },
    { value: 4, label: 'حرج' },
    { value: 5, label: 'طارئ' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'عنوان الطلب مطلوب';
    if (!formData.locationId.trim()) newErrors.locationId = 'معرف الموقع مطلوب';
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
      const requestId = responseData?.id || responseData?.requestId || responseData?.donationRequestId || 'غير متوفر';

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

  if (!isOpen) return null;

  const fieldClass = (name) => `donation-modal__input ${errors[name] ? 'border-red-500/50' : ''}`;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="donation-modal-shell fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="donation-modal__card max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="donation-modal__header">
            <div className="donation-modal__hero">
              <div className="donation-modal__heroIcon">
                <FaHandHoldingHeart />
              </div>
              <div>
                <h2 className="donation-modal__heroTitle">طلب تبرع</h2>
                <p className="donation-modal__heroSubtitle">إدخال بيانات الطلب بدون التأثير على أي منطق داخل التطبيق.</p>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.05, rotate: 90 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="donation-modal__close">
              <FaTimes />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="donation-modal__form">
            <div className="donation-modal__field">
              <label className="donation-modal__label">
                <FaHandHoldingHeart className="text-pink-400" />
                عنوان الطلب
              </label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="أدخل عنوان الطلب" className={fieldClass('title')} dir="rtl" />
              {errors.title && <div className="donation-modal__error"><FaExclamationTriangle />{errors.title}</div>}
            </div>

            <div className="donation-modal__field">
              <label className="donation-modal__label">
                <FaMapMarkerAlt className="text-blue-400" />
                معرف الموقع
              </label>
              <input type="text" name="locationId" value={formData.locationId} onChange={handleInputChange} placeholder="أدخل معرف الموقع" className={fieldClass('locationId')} dir="ltr" />
              {errors.locationId && <div className="donation-modal__error"><FaExclamationTriangle />{errors.locationId}</div>}
            </div>

            <div className="donation-modal__field">
              <label className="donation-modal__label">
                <FaBuilding className="text-violet-400" />
                معرف الشريك
              </label>
              <input type="text" name="partnerId" value={formData.partnerId} onChange={handleInputChange} placeholder="أدخل معرف الشريك" className={fieldClass('partnerId')} dir="ltr" />
              {errors.partnerId && <div className="donation-modal__error"><FaExclamationTriangle />{errors.partnerId}</div>}
            </div>

            <div className="donation-modal__field">
              <label className="donation-modal__label">
                <FaMoneyBillWave className="text-green-400" />
                مبلغ التبرع
              </label>
              <input type="number" name="donateAmount" value={formData.donateAmount} onChange={handleInputChange} step="0.01" min="1" placeholder="أدخل المبلغ" className={fieldClass('donateAmount')} dir="ltr" />
              {errors.donateAmount && <div className="donation-modal__error"><FaExclamationTriangle />{errors.donateAmount}</div>}
            </div>

            <div className="donation-modal__field">
              <label className="donation-modal__label">
                <FaInfoCircle className="text-amber-400" />
                مستوى الأهمية
              </label>
              <select name="urgencyLevel" value={formData.urgencyLevel} onChange={handleInputChange} className="donation-modal__select" dir="rtl">
                {urgencyLevels.map((level) => (
                  <option key={level.value} value={level.value} className="bg-slate-800">
                    {level.label} ({level.value})
                  </option>
                ))}
              </select>
            </div>

            <div className="donation-modal__field">
              <label className="donation-modal__label">
                <FaInfoCircle className="text-cyan-400" />
                وصف مختصر
              </label>
              <textarea name="briefDescription" value={formData.briefDescription} onChange={handleInputChange} rows="4" placeholder="أدخل وصفًا مختصرًا للطلب" className="donation-modal__textarea" dir="rtl" />
            </div>

            {errors.submit && (
              <div className="donation-modal__submitError donation-modal__error">
                <FaExclamationTriangle />
                {errors.submit}
              </div>
            )}

            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className="donation-modal__submitBtn">
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>إنشاء طلب التبرع</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateDonationRequestModal;
