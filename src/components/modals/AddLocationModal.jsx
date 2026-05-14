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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
          <FaSatellite className="text-base" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">اختيار العنوان من الخريطة</h4>
          <p className="mt-0.5 text-xs font-medium text-slate-500">حدّد الإحداثيات بنقرة واحدة</p>
        </div>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-sky-100 bg-sky-50/70 p-4">
        <FaSatellite className="mt-1 text-base text-sky-600 shrink-0" />
        <div className="space-y-2">
          <p className="m-0 text-sm font-medium leading-6 text-slate-700">
            اضغط داخل الخريطة لتحديد مكان العنوان الجديد، وسيتم ملء خط الطول وخط العرض تلقائيًا.
          </p>
          <p className="m-0 text-xs font-medium leading-5 text-slate-500">
            النقاط الزرقاء تمثل العناوين الحالية كمرجع، والعلامة الحمراء هي العنوان الجديد.
          </p>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
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
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <FaCompass className="text-sky-600" />
            <span>خط الطول</span>
          </div>
          <div className="font-mono text-base font-bold text-slate-900" dir="ltr">
            {formatCoordinate(longitude) || '—'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <FaGlobe className="text-sky-600" />
            <span>خط العرض</span>
          </div>
          <div className="font-mono text-base font-bold text-slate-900" dir="ltr">
            {formatCoordinate(latitude) || '—'}
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
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-blue-50/30 focus:ring-4 focus:ring-blue-100/50';

  const labelClass = 'block text-sm font-bold text-slate-700 mb-2 mr-1';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="app-modal-overlay" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="app-modal-card"
          >
            {/* Header */}
            <div className="app-modal-header">
              <div className="flex items-center gap-4">
                <div className="w-[52px] h-[52px] rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <FaPlus className="text-xl" />
                </div>
                <div>
                  <h3 className="app-modal-title">إضافة عنوان جديد</h3>
                  <p className="app-modal-subtitle">قم بتحديد اسم العنوان واختيار موقعه الجغرافي</p>
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
                      <label className="app-form-label">اسم العنوان</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="app-form-input w-full"
                        placeholder="مثال: المستشفى المركزي"
                        required
                      />
                    </div>

                    <div className="app-form-group">
                      <label className="app-form-label">المستوى المطلوب لفتح العنوان</label>
                      <div className="relative">
                        <FaStar className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400" />
                        <input
                          type="number"
                          name="requiredLevel"
                          value={formData.requiredLevel}
                          onChange={handleChange}
                          className="app-form-input w-full pr-12"
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                      <p className="text-sm text-blue-700 leading-relaxed font-medium m-0">
                        <FaGlobe className="inline-block ml-2 mb-0.5" />
                        يتم تحديد الإحداثيات تلقائيًا عند الضغط على الخريطة المقابلة.
                      </p>
                    </div>
                  </div>

                  <div className="app-form-group">
                    <LocationCoordinatePicker
                      existingLocations={existingLocations}
                      longitude={formData.longitude}
                      latitude={formData.latitude}
                      onPick={handleCoordinatePick}
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="app-form-actions pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="app-btn-primary flex-1 py-4 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <FaPlus className="text-sm" />
                        <span>حفظ العنوان الجديد</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="app-btn-secondary px-8 py-4"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function SummaryRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span
        className={`text-sm font-bold text-slate-900 ${mono ? 'font-mono break-all text-left' : ''}`}
        dir={mono ? 'ltr' : undefined}
      >
        {value}
      </span>
    </div>
  );
}

export default AddLocationModal;
