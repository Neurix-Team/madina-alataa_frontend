import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaPlus,
  FaMapMarkerAlt,
  FaGlobe,
  FaCompass,
  FaStar,
  FaSatellite,
  FaCrosshairs,
} from 'react-icons/fa';

const EGYPT_BOUNDS = {
  minLat: 22,
  maxLat: 32.5,
  minLng: 25,
  maxLng: 36.5,
};

const MAP_WIDTH = 360;
const MAP_HEIGHT = 220;
const MAP_PADDING_X = 28;
const MAP_PADDING_Y = 24;
const DRAWABLE_WIDTH = MAP_WIDTH - MAP_PADDING_X * 2;
const DRAWABLE_HEIGHT = MAP_HEIGHT - MAP_PADDING_Y * 2;

function normalizeReferenceLocation(location) {
  if (!location || typeof location !== 'object') return null;

  const latitude = Number(
    location?.latitude ?? location?.Latitude ?? location?.lat ?? location?.Lat ?? 0
  );
  const longitude = Number(
    location?.longitude ?? location?.Longitude ?? location?.lng ?? location?.Lng ?? 0
  );

  return {
    id: location?.id || location?.Id || '',
    name: location?.name ?? location?.Name ?? 'موقع',
    latitude,
    longitude,
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lngToX(longitude) {
  const ratio =
    (clamp(longitude, EGYPT_BOUNDS.minLng, EGYPT_BOUNDS.maxLng) - EGYPT_BOUNDS.minLng) /
    (EGYPT_BOUNDS.maxLng - EGYPT_BOUNDS.minLng);
  return MAP_PADDING_X + ratio * DRAWABLE_WIDTH;
}

function latToY(latitude) {
  const ratio =
    (EGYPT_BOUNDS.maxLat - clamp(latitude, EGYPT_BOUNDS.minLat, EGYPT_BOUNDS.maxLat)) /
    (EGYPT_BOUNDS.maxLat - EGYPT_BOUNDS.minLat);
  return MAP_PADDING_Y + ratio * DRAWABLE_HEIGHT;
}

function xToLng(x) {
  const ratio = clamp((x - MAP_PADDING_X) / DRAWABLE_WIDTH, 0, 1);
  return EGYPT_BOUNDS.minLng + ratio * (EGYPT_BOUNDS.maxLng - EGYPT_BOUNDS.minLng);
}

function yToLat(y) {
  const ratio = clamp((y - MAP_PADDING_Y) / DRAWABLE_HEIGHT, 0, 1);
  return EGYPT_BOUNDS.maxLat - ratio * (EGYPT_BOUNDS.maxLat - EGYPT_BOUNDS.minLat);
}

function formatCoordinate(value) {
  return Number.isFinite(Number(value)) ? Number(value).toFixed(6) : '';
}

function LocationCoordinatePicker({ existingLocations, longitude, latitude, onPick }) {
  const normalizedLocations = useMemo(
    () =>
      (Array.isArray(existingLocations) ? existingLocations : [])
        .map(normalizeReferenceLocation)
        .filter(
          (location) =>
            location &&
            Number.isFinite(location.latitude) &&
            Number.isFinite(location.longitude) &&
            location.latitude !== 0 &&
            location.longitude !== 0
        ),
    [existingLocations]
  );

  const hasSelectedPoint =
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    Number(longitude) !== 0 &&
    Number(latitude) !== 0;

  const handleMapClick = (event) => {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clickX = ((event.clientX - rect.left) / rect.width) * MAP_WIDTH;
    const clickY = ((event.clientY - rect.top) / rect.height) * MAP_HEIGHT;

    const lng = xToLng(clickX);
    const lat = yToLat(clickY);

    onPick({
      longitude: Number(lng.toFixed(6)),
      latitude: Number(lat.toFixed(6)),
    });
  };

  return (
    <div className="rounded-[28px] border border-white/12 bg-white/[0.06] p-5 md:p-6 shadow-[0_16px_48px_rgba(15,23,42,0.28)]">
      <div className="mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-sky-200">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
          <FaSatellite className="text-sky-300" />
        </div>
        <h4>اختيار العنوان من الخريطة</h4>
      </div>

      <div className="mb-5 flex items-start gap-4 rounded-2xl border border-sky-400/15 bg-sky-400/10 p-4">
        <FaSatellite className="mt-1 text-xl text-sky-300" />
        <div>
          <p className="m-0 text-sm font-medium leading-7 text-slate-100">
            اضغط داخل الخريطة لتحديد مكان العنوان الجديد، وسيتم ملء `longitude` و`latitude` تلقائيًا وإرسالهم في body
            الـ API.
          </p>
          <p className="mb-0 mt-2 text-xs font-medium leading-6 text-slate-300">
            النقاط الصغيرة تمثل العناوين الحالية كمرجع فقط، أما العلامة الحمراء فهي العنوان الجديد الذي تختاره الآن.
          </p>
        </div>
      </div>

      <div
        className="rounded-[1.75rem] overflow-hidden border border-white/10 bg-white/5"
        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
      >
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          style={{ width: '100%', display: 'block', cursor: 'crosshair' }}
          onClick={handleMapClick}
        >
          <defs>
            <linearGradient id="locationMapBg" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id="locationLand" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#bfdbfe" />
            </linearGradient>
          </defs>

          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#locationMapBg)" />
          <rect
            x={MAP_PADDING_X}
            y={MAP_PADDING_Y}
            width={DRAWABLE_WIDTH}
            height={DRAWABLE_HEIGHT}
            rx="18"
            fill="url(#locationLand)"
            opacity="0.95"
          />

          {Array.from({ length: 5 }).map((_, index) => {
            const x = MAP_PADDING_X + (DRAWABLE_WIDTH / 4) * index;
            return (
              <line
                key={`v-${index}`}
                x1={x}
                y1={MAP_PADDING_Y}
                x2={x}
                y2={MAP_PADDING_Y + DRAWABLE_HEIGHT}
                stroke="rgba(30, 64, 175, 0.18)"
                strokeWidth="1"
              />
            );
          })}

          {Array.from({ length: 5 }).map((_, index) => {
            const y = MAP_PADDING_Y + (DRAWABLE_HEIGHT / 4) * index;
            return (
              <line
                key={`h-${index}`}
                x1={MAP_PADDING_X}
                y1={y}
                x2={MAP_PADDING_X + DRAWABLE_WIDTH}
                y2={y}
                stroke="rgba(30, 64, 175, 0.18)"
                strokeWidth="1"
              />
            );
          })}

          <path
            d="M88 38 C120 54, 132 92, 154 102 C171 112, 200 116, 222 140 C241 160, 244 182, 236 194"
            fill="none"
            stroke="rgba(37,99,235,0.35)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {normalizedLocations.map((location) => {
            const x = lngToX(location.longitude);
            const y = latToY(location.latitude);

            return (
              <g key={location.id || `${location.longitude}-${location.latitude}`}>
                <circle cx={x} cy={y} r="4.5" fill="#1d4ed8" opacity="0.95" />
                <circle cx={x} cy={y} r="9" fill="rgba(37,99,235,0.18)" />
              </g>
            );
          })}

          {hasSelectedPoint && (
            <g>
              <circle
                cx={lngToX(Number(longitude))}
                cy={latToY(Number(latitude))}
                r="14"
                fill="rgba(239,68,68,0.18)"
              />
              <circle
                cx={lngToX(Number(longitude))}
                cy={latToY(Number(latitude))}
                r="7"
                fill="#ef4444"
              />
              <path
                d={`M ${lngToX(Number(longitude)) - 10} ${latToY(Number(latitude))} L ${lngToX(Number(longitude)) + 10} ${latToY(Number(latitude))} M ${lngToX(Number(longitude))} ${latToY(Number(latitude)) - 10} L ${lngToX(Number(longitude))} ${latToY(Number(latitude)) + 10}`}
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          )}
        </svg>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-[20px] border border-white/10 bg-[#112033] px-4 py-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
            <FaCompass className="text-sky-300" />
            خط الطول المحدد
          </div>
          <div className="font-mono text-sm font-semibold text-white" dir="ltr">
            {formatCoordinate(longitude) || 'غير محدد'}
          </div>
        </div>

        <div className="rounded-[20px] border border-white/10 bg-[#112033] px-4 py-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
            <FaGlobe className="text-sky-300" />
            خط العرض المحدد
          </div>
          <div className="font-mono text-sm font-semibold text-white" dir="ltr">
            {formatCoordinate(latitude) || 'غير محدد'}
          </div>
        </div>
      </div>
    </div>
  );
}

const AddLocationModal = ({ isOpen, onClose, onSubmit, existingLocations = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    requiredLevel: 1,
    longitude: '',
    latitude: '',
  });
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      requiredLevel: 1,
      longitude: '',
      latitude: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'requiredLevel'
          ? (value === '' ? '' : parseInt(value, 10) || 1)
          : value,
    }));
  };

  const handleCoordinatePick = ({ longitude, latitude }) => {
    setFormData((prev) => ({
      ...prev,
      longitude: formatCoordinate(longitude),
      latitude: formatCoordinate(latitude),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('يرجى إدخال اسم العنوان');
      return;
    }

    if (!String(formData.longitude).trim() || !String(formData.latitude).trim()) {
      alert('يرجى اختيار العنوان من الخريطة أولًا');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        requiredLevel: Number(formData.requiredLevel) || 1,
        longitude: String(formData.longitude).trim(),
        latitude: String(formData.latitude).trim(),
      };

      await onSubmit(submitData);
      resetForm();
      onClose();
    } catch (err) {
      console.error('Error in AddLocationModal:', err);
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    'w-full rounded-2xl border border-white/12 bg-[#112033] px-4 py-3 text-base font-medium text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-sky-400/45 focus:bg-[#16283d]';

  const cardClass =
    'rounded-[28px] border border-white/12 bg-white/[0.06] p-5 md:p-6 shadow-[0_16px_48px_rgba(15,23,42,0.28)]';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 md:p-8 backdrop-blur-md" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.2 }}
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-white/12 bg-[#0f1b2d] shadow-[0_28px_90px_rgba(15,23,42,0.5)]"
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.10),transparent_25%)]" />

            <div className="relative flex items-start justify-between gap-4 border-b border-white/10 bg-white/[0.05] px-6 py-5 md:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow-lg">
                  <FaPlus className="text-lg" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">إضافة عنوان جديد</h3>
                  <p className="mt-1 text-sm font-medium text-slate-300">
                    واجهة أوضح لإضافة العنوان واختيار الإحداثيات من الخريطة.
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-slate-200"
              >
                <FaTimes />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="relative flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
              <div className="grid gap-7 lg:grid-cols-[1.02fr_0.98fr]">
                <div className="grid gap-7">
                  <section className={cardClass}>
                    <div className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-sky-200">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                        <FaMapMarkerAlt className="text-sky-300" />
                      </div>
                      <h4>البيانات الأساسية</h4>
                    </div>

                    <div className="grid gap-6">
                      <div className="space-y-2.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                          <FaMapMarkerAlt className="text-sky-300" />
                          <span>اسم العنوان</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className={fieldClass}
                          placeholder="أدخل اسمًا واضحًا للعنوان"
                        />
                      </div>

                      <div className="space-y-2.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                          <FaStar className="text-amber-300" />
                          <span>المستوى المطلوب</span>
                        </label>
                        <input
                          type="number"
                          name="requiredLevel"
                          value={formData.requiredLevel}
                          onChange={handleChange}
                          min="1"
                          max="100"
                          className={fieldClass}
                        />
                      </div>
                    </div>
                  </section>

                  <LocationCoordinatePicker
                    existingLocations={existingLocations}
                    longitude={formData.longitude}
                    latitude={formData.latitude}
                    onPick={handleCoordinatePick}
                  />
                </div>

                <div className="grid gap-7">
                  <section className={cardClass}>
                    <div className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-sky-200">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                        <FaGlobe className="text-sky-300" />
                      </div>
                      <h4>الإحداثيات المرسلة</h4>
                    </div>

                    <div className="grid gap-4">
                      <div className="rounded-[20px] border border-white/10 bg-[#112033] p-4">
                        <label className="mb-2 block text-sm font-medium text-slate-300">Longitude</label>
                        <input
                          type="text"
                          name="longitude"
                          value={formData.longitude}
                          readOnly
                          className={`${fieldClass} font-mono`}
                          dir="ltr"
                        />
                      </div>

                      <div className="rounded-[20px] border border-white/10 bg-[#112033] p-4">
                        <label className="mb-2 block text-sm font-medium text-slate-300">Latitude</label>
                        <input
                          type="text"
                          name="latitude"
                          value={formData.latitude}
                          readOnly
                          className={`${fieldClass} font-mono`}
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </section>

                  <section className={cardClass}>
                    <div className="mb-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-slate-200">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                        <FaCrosshairs className="text-sky-300" />
                      </div>
                      <h4>ملخص الإرسال</h4>
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-[#112033] p-4 text-sm font-medium leading-7 text-slate-100">
                      عند الضغط على حفظ، سيتم إرسال البيانات بهذه الصيغة:
                      <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 font-mono text-xs text-sky-100" dir="ltr">
                        {'{ name, requiredLevel, longitude, latitude }'}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </form>

            <div className="relative flex gap-4 border-t border-white/10 bg-white/[0.05] px-6 py-5 md:px-8">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="flex-1 rounded-[22px] border border-white/10 bg-white/[0.06] px-6 py-4 text-base font-semibold text-slate-200 shadow-lg"
                disabled={loading}
              >
                إلغاء
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                onClick={handleSubmit}
                className="flex flex-[1.4] items-center justify-center gap-3 rounded-[22px] bg-gradient-to-r from-sky-400 to-indigo-500 px-6 py-4 text-base font-semibold text-white shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>جاري الحفظ...</span>
                  </span>
                ) : (
                  <>
                    <FaPlus />
                    <span>حفظ العنوان</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddLocationModal;
