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
    <div className="space-y-6 rounded-[2rem] border border-sky-100 bg-white p-8 shadow-xl shadow-sky-100/70">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-8 w-2 rounded-full bg-sky-500" />
        <h4 className="text-lg font-black text-slate-950">{title}</h4>
      </div>

      <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <div className="text-base font-black text-sky-700">{title}</div>
            <div className="mt-1 text-sm text-slate-600">{subtitle}</div>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm">
            {selectedLocation ? `المحدد: ${selectedLocation.name}` : 'لا يوجد عنوان محدد'}
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-sky-200 bg-white">
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
            <div className="p-8 text-center text-sm text-slate-500">
              لا توجد عناوين مضافة بإحداثيات صالحة حاليًا لعرضها على الخريطة.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <div className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">Location ID</div>
          <div className="break-all font-mono text-sm font-bold text-sky-700" dir="ltr">
            {selectedLocationId || 'غير محدد'}
          </div>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">الاسم</div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <FaMapMarkerAlt className="text-sky-600" />
            <span>{selectedLocation?.name || 'غير محدد'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
