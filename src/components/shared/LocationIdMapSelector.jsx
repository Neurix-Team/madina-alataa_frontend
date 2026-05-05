import React, { useMemo } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

function normalizeLocation(location) {
  if (!location || typeof location !== 'object') return null;

  const latitude = Number(
    location?.latitude ?? location?.Latitude ?? location?.lat ?? location?.Lat ?? 0
  );
  const longitude = Number(
    location?.longitude ?? location?.Longitude ?? location?.lng ?? location?.Lng ?? 0
  );

  return {
    ...location,
    id: location?.id || location?.Id || location?.locationId || location?.LocationId || '',
    name: location?.name ?? location?.Name ?? 'موقع بدون اسم',
    latitude,
    longitude,
  };
}

export default function LocationIdMapSelector({
  locations = [],
  selectedLocationId,
  onSelect,
  title = 'اختيار الموقع من الخريطة',
  subtitle = 'اضغط على أي عنوان لاختيار locationId.',
}) {
  const normalizedLocations = useMemo(
    () => (Array.isArray(locations) ? locations : []).map(normalizeLocation).filter((location) => location?.id),
    [locations]
  );

  const validMapLocations = normalizedLocations.filter(
    (location) =>
      Number.isFinite(location.latitude) &&
      Number.isFinite(location.longitude) &&
      location.latitude !== 0 &&
      location.longitude !== 0
  );

  const selectedLocation =
    normalizedLocations.find((location) => String(location.id) === String(selectedLocationId)) || null;

  const latValues = validMapLocations.map((location) => location.latitude);
  const lngValues = validMapLocations.map((location) => location.longitude);
  const minLat = latValues.length ? Math.min(...latValues) : 0;
  const maxLat = latValues.length ? Math.max(...latValues) : 1;
  const minLng = lngValues.length ? Math.min(...lngValues) : 0;
  const maxLng = lngValues.length ? Math.max(...lngValues) : 1;

  const xFor = (lng) => {
    if (maxLng === minLng) return 180;
    return 28 + ((lng - minLng) / (maxLng - minLng)) * 304;
  };

  const yFor = (lat) => {
    if (maxLat === minLat) return 100;
    return 24 + ((maxLat - lat) / (maxLat - minLat)) * 152;
  };

  return (
    <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-2 h-8 bg-indigo-500 rounded-full" />
        <h4 className="text-white font-black text-lg">{title}</h4>
      </div>

      <div className="rounded-3xl border border-white/10 bg-blue-500/5 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="text-blue-300 font-black text-base">{title}</div>
            <div className="text-slate-400 text-sm mt-1">{subtitle}</div>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/10 text-white text-sm font-bold">
            {selectedLocation ? `المحدد: ${selectedLocation.name}` : 'لا يوجد عنوان محدد'}
          </div>
        </div>

        <div className="rounded-[1.5rem] overflow-hidden border border-blue-500/20 bg-white/5">
          {validMapLocations.length > 0 ? (
            <svg viewBox="0 0 360 200" style={{ width: '100%', display: 'block' }}>
              <defs>
                <linearGradient id="missionLocationMapBg" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#f8fbff" />
                  <stop offset="100%" stopColor="#dbeafe" />
                </linearGradient>
              </defs>
              <rect width="360" height="200" fill="url(#missionLocationMapBg)" />
              <path
                d="M18 154 C74 128, 110 164, 166 136 S278 118, 342 148"
                fill="none"
                stroke="rgba(59,130,246,0.24)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M34 42 C94 84, 126 24, 186 66 S276 96, 326 48"
                fill="none"
                stroke="rgba(14,165,233,0.2)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {validMapLocations.map((location) => {
                const isSelected = String(location.id) === String(selectedLocationId);
                const x = xFor(location.longitude);
                const y = yFor(location.latitude);

                return (
                  <g
                    key={location.id}
                    onClick={() => onSelect(location)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 16 : 11}
                      fill={isSelected ? 'rgba(37,99,235,0.18)' : 'rgba(37,99,235,0.1)'}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 8 : 6}
                      fill={isSelected ? '#1d4ed8' : '#2563eb'}
                    />
                    <text
                      x={x}
                      y={y - 14}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill="#0f172a"
                    >
                      {location.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              لا توجد عناوين مضافة بإحداثيات صالحة حاليًا لعرضها على الخريطة.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Location ID</div>
          <div className="text-blue-300 font-mono text-sm break-all" dir="ltr">
            {selectedLocationId || 'غير محدد'}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">الاسم</div>
          <div className="text-white font-bold text-sm flex items-center gap-2">
            <FaMapMarkerAlt className="text-indigo-400" />
            <span>{selectedLocation?.name || 'غير محدد'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
