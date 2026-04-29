import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMapMarkerAlt, FaGlobe, FaCompass, FaStar, FaSatellite, FaFingerprint, FaLayerGroup, FaInfoCircle, FaCalendarAlt, FaHistory, FaCheckCircle } from 'react-icons/fa';

const LocationDetailModal = ({ isOpen, onClose, location }) => {
  if (!isOpen || !location) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'غير متوفر';
    return new Date(dateString).toLocaleDateString('ar-EG', {
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
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-2xl flex items-center justify-center z-[100] p-4 md:p-8" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="bg-[#0f172a] rounded-[3.5rem] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-[0_0_120px_rgba(79,70,229,0.25)] flex flex-col relative"
          >
            {/* Animated Background Orbs */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Header */}
            <div className="flex justify-between items-start p-10 border-b border-white/5 bg-white/5 backdrop-blur-3xl sticky top-0 z-20">
              <div className="flex-1">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-800 flex items-center justify-center shadow-2xl border border-white/20 group">
                    <FaMapMarkerAlt className="text-white text-3xl group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-white tracking-tighter leading-tight mb-2">
                      {location.name || 'عنوان مجهول'}
                    </h3>
                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm uppercase tracking-[0.2em]">
                      <FaFingerprint className="text-indigo-500/50" />
                      {location.id || 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <div className="px-6 py-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg">
                    <FaLayerGroup className="text-sm" />
                    المستوى: {location.requiredLevel}
                  </div>
                  <div className="px-6 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg">
                    <FaCheckCircle className="text-sm" />
                    موقع نشط
                  </div>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-14 h-14 flex items-center justify-center bg-white/5 rounded-[1.5rem] transition-all text-slate-400 border border-white/5 shadow-xl"
              >
                <FaTimes className="text-2xl" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              {/* Coordinates Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-white font-black text-xl tracking-tighter px-2">
                  <FaSatellite className="text-indigo-500 animate-pulse" />
                  <h4>بيانات التموضع الجغرافي</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div whileHover={{ y: -5 }} className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-4 group transition-all duration-500">
                    <div className="flex items-center gap-3 text-blue-400 font-black text-sm uppercase tracking-widest mb-2">
                      <FaCompass className="text-xl" />
                      <span>خط الطول</span>
                    </div>
                    <div className="text-white font-mono text-3xl font-black tabular-nums break-all group-hover:text-blue-300 transition-colors">
                      {location.longitude || '0.000000'}
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -5 }} className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-4 group transition-all duration-500">
                    <div className="flex items-center gap-3 text-indigo-400 font-black text-sm uppercase tracking-widest mb-2">
                      <FaGlobe className="text-xl" />
                      <span>خط العرض</span>
                    </div>
                    <div className="text-white font-mono text-3xl font-black tabular-nums break-all group-hover:text-indigo-300 transition-colors">
                      {location.latitude || '0.000000'}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Stats & History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Information Card */}
                <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-6">
                  <div className="flex items-center gap-3 text-slate-400 font-black text-sm uppercase tracking-widest mb-2">
                    <FaInfoCircle className="text-lg" />
                    <span>المتطلبات</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-black/20 p-5 rounded-2xl border border-white/5 group hover:bg-black/40 transition-all">
                      <span className="text-slate-500 font-bold text-sm">المستوى الأدنى</span>
                      <div className="flex items-center gap-2 font-black text-xl text-yellow-500">
                        <FaStar />
                        <span className="tabular-nums">{location.requiredLevel}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-black/20 p-5 rounded-2xl border border-white/5 group hover:bg-black/40 transition-all">
                      <span className="text-slate-500 font-bold text-sm">حالة الوصول</span>
                      <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full font-black text-xs uppercase tracking-widest">
                        متاح الآن
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline Card */}
                <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-6">
                  <div className="flex items-center gap-3 text-slate-400 font-black text-sm uppercase tracking-widest mb-2">
                    <FaHistory className="text-lg" />
                    <span>تاريخ السجل</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2 bg-black/20 p-5 rounded-2xl border border-white/5 group hover:bg-black/40 transition-all">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                        <FaCalendarAlt className="text-blue-500" />
                        تاريخ الإنشاء
                      </div>
                      <span className="text-white font-black text-sm tabular-nums">
                        {formatDate(location.createdAt)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 bg-black/20 p-5 rounded-2xl border border-white/5 group hover:bg-black/40 transition-all">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                        <FaHistory className="text-purple-500" />
                        آخر مزامنة
                      </div>
                      <span className="text-white font-black text-sm tabular-nums">
                        {formatDate(location.updatedAt || location.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Preview Placeholder */}
              <div className="bg-white/5 rounded-[2.5rem] p-10 border border-white/5 text-center space-y-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner relative z-10 group-hover:scale-110 transition-transform duration-500">
                  <FaSatellite className="text-5xl text-indigo-500/30 group-hover:text-indigo-500/50 transition-colors" />
                </div>
                <h4 className="text-white font-black text-xl relative z-10">معاينة القمر الصناعي</h4>
                <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto relative z-10 leading-relaxed">
                  هذا الموقع مسجل بدقة عالية في قاعدة البيانات المركزية ومتاح لجميع العمليات الميدانية المتوافقة مع المستوى {location.requiredLevel}.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-10 border-t border-white/5 bg-white/5 backdrop-blur-3xl sticky bottom-0 z-20">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full px-10 py-6 bg-white/5 text-slate-300 rounded-[2rem] transition-all font-black text-xl border border-white/5 shadow-2xl"
              >
                إغلاق سجل الموقع
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LocationDetailModal;
