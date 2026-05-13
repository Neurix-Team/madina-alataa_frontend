import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaMapMarkerAlt,
  FaGlobe,
  FaCompass,
  FaStar,
  FaSatellite,
  FaFingerprint,
  FaLayerGroup,
  FaInfoCircle,
  FaCalendarAlt,
  FaHistory,
  FaCheckCircle,
} from 'react-icons/fa';

const panelClass =
  'rounded-[28px] border border-sky-100 bg-white p-5 shadow-xl shadow-sky-100/70 md:p-6';

const itemClass =
  'rounded-[20px] border border-sky-100 bg-sky-50 px-4 py-4 text-slate-900 shadow-inner';

const formatDate = (dateString) => {
  if (!dateString) return 'غير متوفر';
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const LocationDetailModal = ({ isOpen, onClose, location }) => {
  if (!isOpen || !location) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-md" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[30px] border border-sky-100 bg-slate-50 shadow-2xl shadow-slate-300/60"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(240,249,255,0.98),rgba(255,255,255,0.5)_45%,rgba(236,253,245,0.58))]" />

            <div className="relative flex items-start justify-between gap-4 border-b border-slate-200 bg-white/90 px-6 py-5 md:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-lg">
                  <FaMapMarkerAlt className="text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-950 md:text-2xl">
                    {location.name || 'عنوان مجهول'}
                  </h3>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-medium text-slate-700">
                    <FaFingerprint className="text-sky-600" />
                    <span dir="ltr">{location.id || 'N/A'}</span>
                  </div>
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

            <div className="relative flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
              <div className="grid gap-7">
                <section className={panelClass}>
                  <div className="mb-5 flex flex-wrap gap-3">
                    <StatusBadge icon={FaLayerGroup} label={`المستوى المطلوب: ${location.requiredLevel ?? 1}`} tone="info" />
                    <StatusBadge icon={FaCheckCircle} label="الحالة: نشط" tone="success" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <InfoCard
                      icon={FaCompass}
                      title="خط الطول"
                      value={location.longitude || '0.000000'}
                      mono
                    />
                    <InfoCard
                      icon={FaGlobe}
                      title="خط العرض"
                      value={location.latitude || '0.000000'}
                      mono
                    />
                  </div>
                </section>

                <div className="grid gap-7 lg:grid-cols-2">
                  <section className={panelClass}>
                    <SectionTitle icon={FaInfoCircle} title="بيانات العنوان" />
                    <div className="mt-5 grid gap-4">
                      <MetaRow icon={FaStar} label="المستوى المطلوب" value={location.requiredLevel ?? 'غير متوفر'} />
                      <MetaRow icon={FaMapMarkerAlt} label="اسم العنوان" value={location.name || 'غير متوفر'} />
                      <MetaRow icon={FaSatellite} label="جاهزية الموقع" value="جاهز للاستخدام" />
                    </div>
                  </section>

                  <section className={panelClass}>
                    <SectionTitle icon={FaHistory} title="السجل الزمني" />
                    <div className="mt-5 grid gap-4">
                      <MetaRow icon={FaCalendarAlt} label="تاريخ الإنشاء" value={formatDate(location.createdAt)} />
                      <MetaRow icon={FaHistory} label="آخر تحديث" value={formatDate(location.updatedAt || location.createdAt)} />
                    </div>
                  </section>
                </div>

                <section className={panelClass}>
                  <SectionTitle icon={FaSatellite} title="نظرة سريعة" />
                  <div className="mt-5 rounded-[22px] border border-sky-100 bg-sky-50 px-5 py-5 text-center text-sm font-medium leading-7 text-slate-700">
                    هذا العنوان مسجل داخل النظام مع إحداثيات واضحة، ويمكن استخدامه مباشرة في المهام والطلبات المرتبطة بالموقع.
                  </div>
                </section>
              </div>
            </div>

            <div className="relative border-t border-slate-200 bg-white/90 px-6 py-5 md:px-8">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={onClose}
                className="w-full rounded-[22px] border border-slate-200 bg-white px-6 py-4 text-base font-semibold text-slate-700 shadow-sm"
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

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-700">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-100 bg-sky-50">
        <Icon className="text-sky-600" />
      </div>
      <span>{title}</span>
    </div>
  );
}

function StatusBadge({ icon: Icon, label, tone = 'info' }) {
  const tones = {
    info: 'border-sky-200 bg-sky-50 text-sky-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium ${tones[tone] || tones.info}`}>
      <Icon />
      <span>{label}</span>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value, mono = false }) {
  return (
    <div className={`${itemClass} space-y-3`}>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
        <Icon className="text-sky-600" />
        <span>{title}</span>
      </div>
      <div className={`text-base font-semibold text-slate-950 ${mono ? 'font-mono break-all' : ''}`} dir={mono ? 'ltr' : undefined}>
        {value}
      </div>
    </div>
  );
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[20px] border border-sky-100 bg-sky-50 px-4 py-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <Icon className="text-sky-600" />
        <span>{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export default LocationDetailModal;
