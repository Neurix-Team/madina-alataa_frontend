import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMapMarkerAlt, FaGlobe, FaCompass, FaStar, FaMapPin, FaLock, FaUnlock } from 'react-icons/fa';

const LocationDetailModal = ({ isOpen, onClose, location }) => {
  if (!location) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gradient-to-br from-[#0a192f] to-[#112240] rounded-3xl border border-blue-800/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(30,58,138,0.3)]"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-blue-900/50 bg-[#0a192f]/50 sticky top-0 z-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  <FaMapMarkerAlt className="text-blue-400 text-xl" />
                </div>
                <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 leading-tight">
                  تفاصيل العنوان
                </h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors text-red-400 hover:text-red-300 border border-red-500/20"
              >
                <FaTimes className="text-lg" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Location Name */}
              <div className="bg-[#112240]/50 rounded-2xl p-5 border border-blue-900/30">
                <h4 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500/70" /> اسم العنوان
                </h4>
                <p className="text-2xl text-blue-100 font-bold bg-[#0a192f] p-4 rounded-xl border border-blue-900/50">
                  {location.name}
                </p>
              </div>

              {/* Required Level */}
              <div className="bg-[#112240]/50 rounded-2xl p-5 border border-blue-900/30">
                <h4 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                  <FaStar className="text-yellow-500" /> المستوى المطلوب
                </h4>
                <div className="flex items-center gap-3 text-xl text-yellow-400">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                    <FaStar className="text-yellow-400" />
                  </div>
                  <span className="font-black text-2xl">{location.requiredLevel}</span>
                </div>
              </div>

              {/* Coordinates */}
              <div className="bg-[#112240]/50 rounded-2xl p-5 border border-blue-900/30">
                <h4 className="text-lg font-bold text-blue-300 mb-4 flex items-center gap-2">
                  <FaGlobe className="text-blue-400" /> الإحداثيات الجغرافية
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Longitude */}
                  <div className="bg-[#0a192f] p-4 rounded-xl border border-blue-900/50">
                    <div className="flex items-center gap-2 text-sm text-blue-300 mb-2">
                      <FaCompass className="text-blue-400" />
                      <span className="font-bold">خط الطول (Longitude)</span>
                    </div>
                    <div className="text-blue-100 font-mono text-xl">
                      {location.longitude || 'غير محدد'}
                    </div>
                  </div>
                  
                  {/* Latitude */}
                  <div className="bg-[#0a192f] p-4 rounded-xl border border-blue-900/50">
                    <div className="flex items-center gap-2 text-sm text-blue-300 mb-2">
                      <FaGlobe className="text-blue-400" />
                      <span className="font-bold">خط العرض (Latitude)</span>
                    </div>
                    <div className="text-blue-100 font-mono text-xl">
                      {location.latitude || 'غير محدد'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location ID */}
              <div className="bg-[#112240]/50 rounded-2xl p-5 border border-blue-900/30">
                <h4 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                  <FaMapPin className="text-blue-500/70" /> معرف العنوان
                </h4>
                <p className="text-blue-100 font-mono text-lg tracking-wider bg-[#0a192f] p-4 rounded-xl border border-blue-900/50 break-all">
                  {location.id}
                </p>
              </div>

              {/* Status Information */}
              <div className="bg-[#112240]/50 rounded-2xl p-5 border border-blue-900/30">
                <h4 className="text-lg font-bold text-blue-300 mb-4 flex items-center gap-2">
                  <FaLock className="text-blue-500/70" /> حالة العنوان
                </h4>
                <div className="space-y-3 bg-[#0a192f] p-4 rounded-xl border border-blue-900/50">
                  <div className="flex justify-between items-center pb-3 border-b border-blue-900/30">
                    <span className="text-blue-200 font-bold">المستوى المطلوب</span>
                    <span className="text-yellow-400 font-bold text-lg flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      {location.requiredLevel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200 font-bold">الإحداثيات</span>
                    <span className="text-blue-100 font-mono text-sm">
                      {location.longitude && location.latitude 
                        ? `${location.longitude}, ${location.latitude}` 
                        : 'غير محدد'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              {location.createdAt && (
                <div className="bg-[#112240]/50 rounded-2xl p-5 border border-blue-900/30">
                  <h4 className="text-lg font-bold text-blue-300 mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-500/70" /> التواريخ
                  </h4>
                  <div className="space-y-3 bg-[#0a192f] p-4 rounded-xl border border-blue-900/50">
                    {location.createdAt && (
                      <div className="flex justify-between items-center pb-3 border-b border-blue-900/30">
                        <span className="text-blue-200 font-bold">تاريخ الإنشاء</span>
                        <span className="text-blue-100 font-medium bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-800/30 text-sm">
                          {formatDate(location.createdAt)}
                        </span>
                      </div>
                    )}
                    {location.updatedAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200 font-bold">آخر تحديث</span>
                        <span className="text-blue-100 font-medium bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-800/30 text-sm">
                          {formatDate(location.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="bg-[#112240]/50 rounded-2xl p-5 border border-blue-900/30">
                <h4 className="text-lg font-bold text-blue-300 mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-blue-500/70" /> معلومات إضافية
                </h4>
                <div className="space-y-3 bg-[#0a192f] p-4 rounded-xl border border-blue-900/50">
                  <div className="flex items-center gap-3 text-blue-200">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                      {location.requiredLevel <= 5 ? (
                        <FaUnlock className="text-green-400" />
                      ) : (
                        <FaLock className="text-red-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-lg">
                        {location.requiredLevel <= 5 ? 'متاح للمستويات المنخفضة' : 'يتطلب مستوى عالي'}
                      </div>
                      <div className="text-sm text-blue-300/60">
                        المستوى المطلوب: {location.requiredLevel}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-blue-900/50 bg-[#0a192f]/50 backdrop-blur-xl sticky bottom-0 z-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#112240] to-[#1a365d] hover:from-[#1a365d] hover:to-[#112240] text-blue-200 rounded-2xl transition-all font-bold text-xl border border-blue-800/50 shadow-lg"
              >
                إغلاق التفاصيل
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LocationDetailModal;
