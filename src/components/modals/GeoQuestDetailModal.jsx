import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMapMarkerAlt, FaInfoCircle, FaCalendar, FaUserShield } from 'react-icons/fa';

const GeoQuestDetailModal = ({ isOpen, onClose, geoQuest }) => {
  if (!isOpen || !geoQuest) return null;

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
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] w-full max-w-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-br from-slate-900 to-slate-800/95 backdrop-blur-md p-8 pb-0 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center border border-green-500/30">
                  <FaMapMarkerAlt className="text-green-400 text-2xl" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white">تفاصيل المهمة الجغرافية</h2>
                  <p className="text-green-300/70 font-medium mt-1">عرض معلومات المهمة بالكامل</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <FaTimes className="text-white/80" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Main Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
            >
              <h3 className="text-xl font-black text-white mb-4 flex items-center gap-3">
                <FaInfoCircle className="text-blue-400" />
                معلومات أساسية
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60 text-sm font-medium mb-1">عنوان المهمة</p>
                    <p className="text-white font-bold text-lg">{geoQuest.title || 'غير محدد'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60 text-sm font-medium mb-1">معرف الموقع</p>
                    <p className="text-white font-mono text-sm bg-black/30 rounded-lg px-3 py-2 inline-block">
                      {geoQuest.locationId || 'غير محدد'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <FaUserShield className="text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60 text-sm font-medium mb-1">معرف المهمة</p>
                    <p className="text-white font-mono text-sm bg-black/30 rounded-lg px-3 py-2 inline-block">
                      {geoQuest.id || 'غير محدد'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Timestamps Card */}
            {geoQuest.createdAt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-3">
                  <FaCalendar className="text-orange-400" />
                  معلومات الوقت
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <FaCalendar className="text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white/60 text-sm font-medium mb-1">تاريخ الإنشاء</p>
                      <p className="text-white font-bold">
                        {new Date(geoQuest.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Additional Info */}
            {geoQuest.additionalInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-3">
                  <FaInfoCircle className="text-cyan-400" />
                  معلومات إضافية
                </h3>
                <div className="bg-black/30 rounded-lg p-4">
                  <pre className="text-white/80 text-sm font-mono whitespace-pre-wrap">
                    {JSON.stringify(geoQuest.additionalInfo, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gradient-to-br from-slate-900 to-slate-800/95 backdrop-blur-md p-8 pt-0 border-t border-white/10">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full bg-white/10 hover:bg-white/20 text-white rounded-2xl px-8 py-4 font-bold text-lg transition-all border border-white/20"
            >
              إغلاق
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GeoQuestDetailModal;
