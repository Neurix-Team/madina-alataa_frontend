import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaHandHoldingHeart,
  FaSave,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSpinner,
  FaHeading,
  FaCoins,
  FaHandshake,
} from 'react-icons/fa';
import { donationRequestsService } from '../../services/donationRequestsService';
import partnersService from '../../services/partnersService';
import LocationIdMapSelector from '../shared/LocationIdMapSelector';

const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm';

const fieldClassBase =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200';

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
      { value: 1, label: 'منخفض', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
      { value: 2, label: 'متوسط', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
      { value: 3, label: 'عالي', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
      { value: 4, label: 'حرج', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
      { value: 5, label: 'طارئ', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100' },
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
    if (!formData.donateAmount || formData.donateAmount <= 0)
      newErrors.donateAmount = 'مبلغ التبرع يجب أن يكون أكبر من صفر';
    if (!formData.partnerId.trim()) newErrors.partnerId = 'الشريك المستلم مطلوب';

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

      await donationRequestsService.createDonationRequest(payload);

      alert('تم إنشاء طلب التبرع بنجاح.');

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

  const fieldClass =
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-blue-50/30 focus:ring-4 focus:ring-blue-100/50';

  const labelClass = 'block text-sm font-bold text-slate-700 mb-2 mr-1';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="app-modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="app-modal-card"
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="app-modal-header">
            <div className="flex items-center gap-4">
              <div className="w-[52px] h-[52px] rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
                <FaHandHoldingHeart className="text-xl" />
              </div>
              <div>
                <h3 className="app-modal-title">إنشاء طلب تبرع</h3>
                <p className="app-modal-subtitle">إضافة طلب تبرع جديد وتحديد الشريك والموقع</p>
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
                    <label className="app-form-label">عنوان الطلب</label>
                    <div className="relative">
                      <FaHeading className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="app-form-input w-full pr-12"
                        placeholder="مثال: شراء كراسي متحركة"
                      />
                    </div>
                    {errors.title && <p className="text-red-500 text-xs mt-1 mr-1 font-bold">{errors.title}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="app-form-group">
                      <label className="app-form-label">المبلغ المطلوب</label>
                      <div className="relative">
                        <FaCoins className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500" />
                        <input
                          type="number"
                          name="donateAmount"
                          value={formData.donateAmount}
                          onChange={handleInputChange}
                          className="app-form-input w-full pr-12"
                          min="1"
                        />
                      </div>
                      {errors.donateAmount && <p className="text-red-500 text-xs mt-1 mr-1 font-bold">{errors.donateAmount}</p>}
                    </div>
                    <div className="app-form-group">
                      <label className="app-form-label">الشريك المستلم</label>
                      <div className="relative">
                        <FaHandshake className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500" />
                        <select
                          name="partnerId"
                          value={formData.partnerId}
                          onChange={handleInputChange}
                          className="app-form-select w-full pr-12 appearance-none"
                        >
                          <option value="">اختر شريكاً</option>
                          {partnerOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      {errors.partnerId && <p className="text-red-500 text-xs mt-1 mr-1 font-bold">{errors.partnerId}</p>}
                    </div>
                  </div>

                  <div className="app-form-group">
                    <label className="app-form-label">مستوى الاستعجال</label>
                    <div className="grid grid-cols-5 gap-2">
                      {urgencyLevels.map((lvl) => (
                        <button
                          key={lvl.value}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, urgencyLevel: lvl.value }))}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                            formData.urgencyLevel === lvl.value
                              ? `${lvl.bg} ${lvl.border} ${lvl.color} ring-2 ring-offset-1 ring-blue-400`
                              : 'bg-white border-slate-200 text-slate-400 grayscale'
                          }`}
                        >
                          <span className="text-xs font-bold">{lvl.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="app-form-group">
                  <label className="app-form-label">اختيار الموقع من الخريطة</label>
                  <LocationIdMapSelector
                    locations={locations}
                    selectedLocationId={formData.locationId}
                    onSelect={handleLocationSelect}
                  />
                  {errors.locationId && <p className="text-red-500 text-xs mt-1 mr-1 font-bold">{errors.locationId}</p>}
                </div>
              </div>

              <div className="app-form-group">
                <label className="app-form-label">الوصف المختصر</label>
                <div className="relative">
                  <FaInfoCircle className="absolute right-4 top-4 text-slate-400" />
                  <textarea
                    name="briefDescription"
                    value={formData.briefDescription}
                    onChange={handleInputChange}
                    className="app-form-textarea w-full pr-12 min-h-[100px]"
                    placeholder="اكتب وصفاً مختصراً لطلب التبرع..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="app-form-actions pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="app-btn-secondary px-8 py-4"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary flex-1 py-4 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      <FaSave className="text-sm" />
                      <span>إنشاء الطلب</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateDonationRequestModal;
