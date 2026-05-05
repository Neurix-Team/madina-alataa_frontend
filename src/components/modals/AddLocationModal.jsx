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
    <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 space-y-6 shadow-inner">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-8 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        <h4 className="text-white font-black text-lg">اختيار العنوان من الخريطة</h4>
      </div>

      <div className="bg-blue-500/5 rounded-2xl p-5 border border-blue-500/10 flex items-start gap-4">
        <FaSatellite className="text-blue-400 text-2xl mt-1" />
        <div>
          <p className="text-blue-200 text-sm font-bold leading-relaxed m-0">
            اضغط داخل الخريطة لتحديد مكان العنوان الجديد، وسيتم ملء `longitude` و`latitude` تلقائيًا وإرسالهم في body
            الـ API.
          </p>
          <p className="text-blue-300/60 text-xs font-medium leading-relaxed mt-2 mb-0">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-black/30 border border-white/10 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-bold mb-2">
            <FaCompass className="text-blue-400" />
            خط الطول المحدد
          </div>
          <div className="text-white font-mono font-bold text-lg" dir="ltr">
            {formatCoordinate(longitude) || 'غير محدد'}
          </div>
        </div>

        <div className="bg-black/30 border border-white/10 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-bold mb-2">
            <FaGlobe className="text-blue-400" />
            خط العرض المحدد
          </div>
          <div className="text-white font-mono font-bold text-lg" dir="ltr">
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-2xl flex items-center justify-center z-[100] p-4 md:p-8" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, rotateX: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40, rotateX: 15 }}
            transition={{ type: 'spring', duration: 0.7, bounce: 0.3 }}
            className="bg-[#0f172a]/90 rounded-[3rem] border border-white/10 w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)] flex flex-col relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -z-10" />

            <div className="flex justify-between items-center p-10 border-b border-white/5 bg-white/5 backdrop-blur-3xl sticky top-0 z-20">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-800 flex items-center justify-center shadow-2xl border border-white/20">
                  <FaPlus className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter">إضافة عنوان جديد</h3>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">
                    اختيار الموقع من الخريطة وإرساله إلى API
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl transition-all text-slate-400 border border-white/5"
              >
                <FaTimes className="text-xl" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 space-y-6 shadow-inner">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  <h4 className="text-white font-black text-lg">البيانات الأساسية</h4>
                </div>

                <div className="space-y-6">
                  <div className="group space-y-3">
                    <label className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest px-1">
                      <FaMapMarkerAlt className="text-indigo-500" />
                      اسم العنوان <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-black/40 border-2 border-white/5 rounded-[1.5rem] px-6 py-5 text-xl text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 transition-all duration-300 shadow-inner font-bold"
                      placeholder="أدخل اسمًا واضحًا للعنوان..."
                    />
                  </div>

                  <div className="group space-y-3">
                    <label className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest px-1">
                      <FaStar className="text-yellow-500" />
                      المستوى المطلوب
                    </label>
                    <input
                      type="number"
                      name="requiredLevel"
                      value={formData.requiredLevel}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      className="w-full bg-black/40 border-2 border-white/5 rounded-[1.5rem] px-6 py-5 text-xl text-white focus:outline-none focus:border-yellow-500/50 focus:ring-8 focus:ring-yellow-500/5 transition-all duration-300 shadow-inner font-bold"
                    />
                  </div>
                </div>
              </div>

              <LocationCoordinatePicker
                existingLocations={existingLocations}
                longitude={formData.longitude}
                latitude={formData.latitude}
                onPick={handleCoordinatePick}
              />

              <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 space-y-6 shadow-inner">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-8 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <h4 className="text-white font-black text-lg">الإحداثيات المرسلة إلى الـ API</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="group space-y-3">
                    <label className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest px-1">
                      <FaCompass className="text-blue-500" />
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      readOnly
                      className="w-full bg-black/40 border-2 border-white/5 rounded-[1.5rem] px-6 py-5 text-xl text-white focus:outline-none shadow-inner font-mono font-bold tabular-nums"
                      dir="ltr"
                    />
                  </div>

                  <div className="group space-y-3">
                    <label className="flex items-center gap-3 text-sm font-black text-slate-400 uppercase tracking-widest px-1">
                      <FaGlobe className="text-blue-500" />
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      readOnly
                      className="w-full bg-black/40 border-2 border-white/5 rounded-[1.5rem] px-6 py-5 text-xl text-white focus:outline-none shadow-inner font-mono font-bold tabular-nums"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-indigo-500/5 rounded-2xl p-6 border border-indigo-500/10 flex items-start gap-4">
                <FaCrosshairs className="text-indigo-400 text-2xl mt-1" />
                <p className="text-indigo-200/70 text-sm font-medium leading-relaxed m-0">
                  عند الضغط على حفظ، سيتم إرسال body بهذه الصيغة:
                  <br />
                  <span className="font-mono text-xs text-indigo-200">
                    {`{ name, requiredLevel, longitude, latitude }`}
                  </span>
                </p>
              </div>
            </form>

            <div className="p-10 border-t border-white/5 bg-white/5 backdrop-blur-3xl sticky bottom-0 z-20 flex gap-6">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="flex-1 px-8 py-5 bg-white/5 text-slate-400 rounded-2xl transition-all font-black text-xl border border-white/5 shadow-lg"
                disabled={loading}
              >
                تراجع
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -10px rgba(79,70,229,0.5)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                onClick={handleSubmit}
                className="flex-[2] px-8 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl transition-all duration-300 flex items-center justify-center gap-4 font-black text-xl shadow-2xl border border-white/10"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-8 h-8 border-[4px] border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FaPlus className="text-lg" />
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
