import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaHandHoldingHeart,
  FaMapMarkerAlt,
  FaBuilding,
  FaMoneyBillWave,
  FaInfoCircle,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaDonate,
  FaFingerprint,
  FaCheckCircle,
} from 'react-icons/fa';
import { donationRequestsService } from '../../services/donationRequestsService';

const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm';

const ViewDonationRequestModal = ({
  isOpen,
  onClose,
  requestId,
  showDonateButton = false,
  onDonate,
}) => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && requestId) {
      fetchRequestDetails();
    }
  }, [isOpen, requestId]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await donationRequestsService.getDonationRequestDetails(requestId);
      setRequest(data);
    } catch (err) {
      setError(err.message || 'فشل في جلب تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  };

  const DetailItem = ({ label, value, icon: Icon, fullWidth = false }) => (
    <div className={`p-4 rounded-2xl bg-slate-50/95 border border-slate-200/90 flex flex-col gap-1.5 ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="flex items-center gap-2 text-slate-500">
        {Icon && <Icon className="text-sm" />}
        <span className="text-[12px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <strong className="text-slate-900 text-[14px] font-extrabold break-words">
        {value || 'غير محدد'}
      </strong>
    </div>
  );

  const getUrgencyLabel = (level) => {
    const levels = {
      1: { label: 'منخفض', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
      2: { label: 'متوسط', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
      3: { label: 'عالي', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
      4: { label: 'حرج', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
      5: { label: 'طارئ', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100' },
    };
    return levels[level] || { label: 'غير محدد', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' };
  };

  const getStatusLabel = (status) => {
    const statuses = {
      pending: { label: 'قيد الانتظار', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
      approved: { label: 'تمت الموافقة', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
      rejected: { label: 'مرفوض', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    };
    return (
      statuses[status?.toLowerCase()] || {
        label: status || 'غير معروف',
        color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100'
      }
    );
  };

  if (!isOpen) return null;

  const urgency = request ? getUrgencyLabel(request.urgencyLevel) : null;
  const statusInfo = request ? getStatusLabel(request.status) : null;

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
          style={{ maxWidth: '820px' }}
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="app-modal-header">
            <div>
              <h3 className="app-modal-title">تفاصيل طلب التبرع</h3>
              <p className="app-modal-subtitle">بيانات الطلب والوصف والحالة الحالية</p>
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
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-slate-500 font-bold">جاري تحميل البيانات...</p>
              </div>
            ) : error ? (
              <div className="p-8 rounded-2xl bg-red-50 border border-red-100 text-center">
                <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
                <p className="text-red-700 font-bold">{error}</p>
                <button onClick={fetchRequestDetails} className="mt-4 text-blue-600 font-black underline">إعادة المحاولة</button>
              </div>
            ) : request ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-[22px] font-black text-slate-900 m-0">{request.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${urgency.bg} ${urgency.color} ${urgency.border}`}>
                      الاستعجال: {urgency.label}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                      الحالة: {statusInfo.label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <DetailItem label="المبلغ المطلوب" value={`${request.donateAmount} عملة`} icon={FaMoneyBillWave} />
                  <DetailItem label="تاريخ الطلب" value={new Date(request.createdAt).toLocaleDateString('ar-EG')} icon={FaCalendarAlt} />
                  <DetailItem label="الشريك المستلم" value={request.partnerName || 'غير محدد'} icon={FaBuilding} />
                  <DetailItem label="الموقع" value={request.locationName || 'غير محدد'} icon={FaMapMarkerAlt} />
                </div>

                {request.briefDescription && (
                  <div>
                    <h4 className="text-slate-500 text-[12px] font-bold uppercase tracking-wider mb-2">الوصف</h4>
                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                      <p className="text-slate-700 text-[15px] leading-relaxed m-0">{request.briefDescription}</p>
                    </div>
                  </div>
                )}

                {showDonateButton && request.status?.toLowerCase() === 'approved' && (
                  <button
                    onClick={() => onDonate(request)}
                    className="app-btn-primary w-full py-4 text-lg mt-4 flex items-center justify-center gap-3"
                  >
                    <FaHandHoldingHeart className="text-xl" />
                    <span>تبرع الآن</span>
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

function InfoCard({ icon: Icon, iconBg, iconColor, label, value, mono = false }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
          <Icon className="text-sm" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      <div
        className={`break-words text-sm font-bold text-slate-900 ${mono ? 'font-mono break-all' : ''}`}
        dir={mono ? 'ltr' : undefined}
      >
        {value}
      </div>
    </div>
  );
}

export default ViewDonationRequestModal;
