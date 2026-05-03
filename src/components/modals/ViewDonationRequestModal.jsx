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
} from 'react-icons/fa';
import { donationRequestsService } from '../../services/donationRequestsService';

const ViewDonationRequestModal = ({ isOpen, onClose, requestId, showDonateButton = false, onDonate }) => {
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

  const getUrgencyLabel = (level) => {
    const levels = {
      1: { label: 'منخفض', color: 'text-green-400', bg: 'bg-green-500/20' },
      2: { label: 'متوسط', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
      3: { label: 'عالي', color: 'text-orange-400', bg: 'bg-orange-500/20' },
      4: { label: 'حرج', color: 'text-red-400', bg: 'bg-red-500/20' },
      5: { label: 'طارئ', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    };

    return levels[level] || { label: 'غير محدد', color: 'text-gray-400', bg: 'bg-gray-500/20' };
  };

  const getStatusLabel = (status) => {
    const statuses = {
      pending: { label: 'قيد الانتظار', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
      approved: { label: 'تمت الموافقة', color: 'text-green-400', bg: 'bg-green-500/20' },
      rejected: { label: 'مرفوض', color: 'text-red-400', bg: 'bg-red-500/20' },
    };

    return statuses[status?.toLowerCase()] || {
      label: status || 'غير معروف',
      color: 'text-gray-400',
      bg: 'bg-gray-500/20',
    };
  };

  if (!isOpen) return null;

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
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] w-full max-w-lg border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-8 pb-0">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 flex items-center justify-center border border-blue-500/30">
                <FaHandHoldingHeart className="text-blue-400 text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">تفاصيل طلب التبرع</h2>
                <p className="text-blue-300/70 font-medium mt-1">معلومات الطلب</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <FaTimes className="text-white/80" />
            </motion.button>
          </div>

          <div className="p-8 pt-6 space-y-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-white/60">جاري تحميل التفاصيل...</p>
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 text-red-400 bg-red-500/10 p-4 rounded-xl">
                <FaExclamationTriangle className="text-xl" />
                <p>{error}</p>
              </div>
            ) : request ? (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <label className="text-white/50 text-sm font-medium mb-2 block">عنوان الطلب</label>
                  <p className="text-white text-lg font-bold">{request.title || 'غير متوفر'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`${getStatusLabel(request.status).bg} border border-white/10 rounded-2xl p-4`}>
                    <label className="text-white/50 text-sm font-medium mb-2 block">الحالة</label>
                    <span className={`${getStatusLabel(request.status).color} font-bold`}>
                      {getStatusLabel(request.status).label}
                    </span>
                  </div>
                  <div className={`${getUrgencyLabel(request.urgencyLevel).bg} border border-white/10 rounded-2xl p-4`}>
                    <label className="text-white/50 text-sm font-medium mb-2 block">مستوى الأهمية</label>
                    <span className={`${getUrgencyLabel(request.urgencyLevel).color} font-bold`}>
                      {getUrgencyLabel(request.urgencyLevel).label}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <FaMoneyBillWave className="text-green-400" />
                    <label className="text-white/50 text-sm font-medium">مبلغ التبرع</label>
                  </div>
                  <p className="text-white text-2xl font-black">
                    {request.donateAmount?.toLocaleString('ar-EG') || 0} ج.م
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FaMapMarkerAlt className="text-blue-400" />
                      <label className="text-white/50 text-sm font-medium">الموقع</label>
                    </div>
                    <p className="text-white font-medium text-sm">{request.locationId || request.location || 'غير متوفر'}</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FaBuilding className="text-purple-400" />
                      <label className="text-white/50 text-sm font-medium">معرف الشريك</label>
                    </div>
                    <p className="text-white font-medium text-sm">{request.partnerId || 'غير متوفر'}</p>
                  </div>
                </div>

                {request.briefDescription && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <FaInfoCircle className="text-cyan-400" />
                      <label className="text-white/50 text-sm font-medium">الوصف</label>
                    </div>
                    <p className="text-white/80 leading-relaxed">{request.briefDescription}</p>
                  </div>
                )}

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FaCalendarAlt className="text-yellow-400" />
                    <label className="text-white/50 text-sm font-medium">تاريخ الإنشاء</label>
                  </div>
                  <p className="text-white font-medium text-sm">
                    {request.createdAt ? new Date(request.createdAt).toLocaleString('ar-EG') : 'غير متوفر'}
                  </p>
                </div>

                <div className="bg-black/20 border border-white/5 rounded-xl p-3">
                  <label className="text-white/30 text-xs font-medium mb-1 block">معرف الطلب</label>
                  <p className="text-white/50 text-xs font-mono">{request.id || requestId}</p>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              {showDonateButton && request && typeof onDonate === 'function' && (
                <motion.button
                  onClick={() => onDonate(request)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
                >
                  <FaDonate />
                  أريد التبرع
                </motion.button>
              )}

              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all"
              >
                <FaTimes />
                إغلاق
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ViewDonationRequestModal;
