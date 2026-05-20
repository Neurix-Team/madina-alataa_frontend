import React, { useEffect, useMemo, useState } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaEye,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaRedo,
  FaSave,
  FaSearch,
  FaTrash,
} from 'react-icons/fa';
import { geoQuestsService } from '../../services/geoQuestsService';
import { locationsService } from '../../services/locationsService';
import {
  getUserGeoQuestId,
  normalizeUserGeoQuest,
  userGeoQuestsService,
} from '../../services/userGeoQuestsService';
import { showAppConfirm } from '../../utils/appAlerts';

const panelStyles = {
  card: {
    borderRadius: 20,
    border: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    padding: 20,
    boxShadow: 'var(--shadow-md)',
  },
  lightCard: {
    borderRadius: 20,
    border: '1px solid var(--border)',
    background: 'var(--bg-card-2)',
    padding: 20,
    boxShadow: 'var(--shadow-sm)',
  },
  btn: {
    border: 'none',
    borderRadius: 10,
    width: 36,
    height: 36,
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

function toText(value, fallback = 'غير متوفر') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDate(value) {
  if (!value) return 'غير متوفر';

  try {
    return new Date(value).toLocaleString('ar-EG');
  } catch {
    return String(value);
  }
}

function resolveCoordinates(...sources) {
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue;

    const latitude = toNumber(
      source.latitude ?? source.Latitude ?? source.lat ?? source.Lat ?? source.currentLatitude
    );
    const longitude = toNumber(
      source.longitude ?? source.Longitude ?? source.lng ?? source.Lng ?? source.currentLongitude
    );

    if (latitude !== null && longitude !== null) {
      return { latitude, longitude };
    }
  }

  return null;
}

function buildMapUrl(coords) {
  if (!coords) return '';
  return `https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&z=15&output=embed`;
}

function getTargetUserIds(targetUser) {
  if (!targetUser) return [];

  if (typeof targetUser === 'string') {
    const trimmed = targetUser.trim();
    return trimmed ? [trimmed] : [];
  }

  if (typeof targetUser !== 'object') return [];

  return Array.from(
    new Set(
      [
        targetUser.id,
        targetUser.Id,
        targetUser.userId,
        targetUser.UserId,
        targetUser.profileId,
        targetUser.ProfileId,
      ]
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    )
  );
}

function filterItemsForTargetUser(items, targetUser) {
  const targetIds = getTargetUserIds(targetUser);
  if (targetIds.length === 0) return items;

  return items.filter((item) => {
    const itemIds = [
      item?.userId,
      item?.UserId,
      item?.user?.id,
      item?.user?.Id,
      item?.user?.userId,
      item?.user?.profileId,
      item?.user?.ProfileId,
      item?.profileId,
      item?.ProfileId,
    ]
      .map((value) => String(value || '').trim())
      .filter(Boolean);

    return itemIds.some((value) => targetIds.includes(value));
  });
}

function Field({ label, value, mono = false, light = false }) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 12,
        background: 'var(--bg-card-2)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', opacity: 0.7, marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          wordBreak: 'break-word',
          fontFamily: mono ? 'monospace' : 'inherit',
          color: 'var(--text-primary)',
        }}
      >
        {toText(value)}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, light = false, maxWidth = 760 }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.75)',
        display: 'grid',
        placeItems: 'center',
        padding: 16,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 24,
          border: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-lg)',
          padding: 24,
          direction: 'rtl',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              ...panelStyles.btn,
              width: 38,
              height: 38,
              background: 'var(--bg-card-2)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function UserGeoQuestsPanel({
  mode = 'profile',
  isAdmin = false,
  targetUser = null,
  availableUsers = [],
  title,
  light = false,
  disableFilter = false,
}) {
//   const [pageNumber, setPageNumber] = useState(1);
//   // const [pageSize, setPageSize] = useState(5);
// const [pageSize, setPageSize] = useState(100);
//   const [items, setItems] = useState([]);
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalItems: 0,
// pageSize: 100,  });
const [pageNumber, setPageNumber] = useState(1);
// const [pageSize, setPageSize] = useState(100);
const [pageSize, setPageSize] = useState(10);
const [items, setItems] = useState([]);
const [pagination, setPagination] = useState({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  // pageSize: 100,
pageSize: 10,
});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);
  const [detailsStatus, setDetailsStatus] = useState(null);

  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', geoQuestId: '', userId: '' });
  const [saving, setSaving] = useState(false);
  const [geoQuestOptions, setGeoQuestOptions] = useState([]);
  const [geoQuestOptionsLoading, setGeoQuestOptionsLoading] = useState(false);

  const [verifyItem, setVerifyItem] = useState(null);
  const [verifyForm, setVerifyForm] = useState({ latitude: '', longitude: '' });
  const [verifying, setVerifying] = useState(false);
  const [targetLocationCoords, setTargetLocationCoords] = useState(null);
  const [targetLocationLoading, setTargetLocationLoading] = useState(false);

  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', geoQuestId: '', userId: '' });
  const [creating, setCreating] = useState(false);

  const cardStyle = light ? panelStyles.lightCard : panelStyles.card;
  const activeTitle = title || (mode === 'admin' ? 'مهام المستخدم الجغرافية' : 'User GeoQuests');
  const canVerifyLocation = mode === 'profile' && !isAdmin;

  const normalizedUsers = useMemo(
    () =>
      (Array.isArray(availableUsers) ? availableUsers : [])
        .map((user) => ({
          id: user?.id || user?.userId || user?.Id || user?.UserId || '',
          name: user?.fullName || user?.fullname || user?.name || user?.email || 'مستخدم',
        }))
        .filter((user) => user.id),
    [availableUsers]
  );

  const loadGeoQuestsOptions = async () => {
    try {
      setGeoQuestOptionsLoading(true);
      const payload = await geoQuestsService.getGeoQuests(1, 100);
      setGeoQuestOptions(Array.isArray(payload?.items) ? payload.items : []);
    } catch (requestError) {
      console.error('FAILED TO LOAD GEOQUEST OPTIONS:', requestError);
    } finally {
      setGeoQuestOptionsLoading(false);
    }
  };

//   const loadItems = async (nextPage = pageNumber, nextSize = pageSize) => {
//     try {
//       setLoading(true);
//       setError(null);
//       console.log('🔍 Loading UserGeoQuests - Mode:', mode, 'TargetUser:', targetUser);
//       const response = await userGeoQuestsService.getUserGeoQuests(nextPage, nextSize);
//       console.log('📊 USER GEOQUESTS LIST RAW RESPONSE (from component):', JSON.stringify(response, null, 2));
      
//       // const normalizedItems = (response?.items || []).map(normalizeUserGeoQuest);
//       // console.log('🔄 Normalized Items:', normalizedItems);
      
//       // const scopedItems = disableFilter 
//       //   ? normalizedItems 
//       //   : filterItemsForTargetUser(normalizedItems, targetUser);
        
//       // console.log('🎯 Scoped Items:', scopedItems);

//       // setItems(scopedItems);
//       // setPagination({
//       //   currentPage: Number(response?.pagination?.currentPage || nextPage) || nextPage,
//       //   totalPages: Number(response?.pagination?.totalPages || 1) || 1,
//       //   totalItems: Number(response?.pagination?.totalItems || scopedItems.length) || scopedItems.length,
//       //   pageSize: Number(response?.pagination?.pageSize || nextSize) || nextSize,
//       // });
//       const normalizedItems = (response?.items || []).map(normalizeUserGeoQuest);
// console.log('🔄 Normalized Items:', normalizedItems);

// const scopedItems = disableFilter
//   ? normalizedItems
//   : filterItemsForTargetUser(normalizedItems, targetUser);

// console.log('🎯 Scoped Items:', scopedItems);

// const finalItems = mode === 'admin' || disableFilter
//   ? normalizedItems
//   : scopedItems;

// console.log('✅ Final Items To Render:', finalItems);

// setItems(finalItems);

// setPagination({
//   currentPage: Number(response?.pagination?.currentPage || nextPage) || nextPage,
//   totalPages: Number(response?.pagination?.totalPages || 1) || 1,
//   totalItems: Number(response?.pagination?.totalItems || finalItems.length) || finalItems.length,
//   pageSize: Number(response?.pagination?.pageSize || nextSize) || nextSize,
// });
//     } catch (requestError) {
//       console.error('FAILED TO LOAD USER GEOQUESTS:', requestError);
//       setError(requestError?.response?.data?.message || requestError?.message || 'فشل في تحميل UserGeoQuests.');
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   };
// const loadItems = async (nextPage = pageNumber, nextSize = pageSize) => {
//   try {
//     setLoading(true);
//     setError(null);

//     const response = await userGeoQuestsService.getUserGeoQuests(nextPage, nextSize);

//     const normalizedItems = Array.isArray(response?.items)
//       ? response.items.map(normalizeUserGeoQuest)
//       : [];

//     console.log('✅ USER GEOQUESTS FINAL ITEMS TO SET:', normalizedItems);

//     setItems(normalizedItems);

//     setPagination({
//       currentPage: Number(response?.pagination?.currentPage || nextPage) || nextPage,
//       totalPages: Number(response?.pagination?.totalPages || 1) || 1,
//       totalItems: Number(response?.pagination?.totalItems || normalizedItems.length) || normalizedItems.length,
//       pageSize: Number(response?.pagination?.pageSize || nextSize) || nextSize,
//     });
//   } catch (requestError) {
//     console.error('FAILED TO LOAD USER GEOQUESTS:', requestError);
//     setError(
//       requestError?.response?.data?.message ||
//       requestError?.message ||
//       'فشل في تحميل UserGeoQuests.'
//     );
//     setItems([]);
//   } finally {
//     setLoading(false);
//   }
// };
// const loadItems = async (nextPage = pageNumber, nextSize = pageSize) => {
//   try {
//     setLoading(true);
//     setError(null);

//     const safePage = Math.max(1, Number(nextPage) || 1);
//     const safeSize = Math.min(100, Math.max(1, Number(nextSize) || 10));

//     console.log('🔍 Loading UserGeoQuests - Page:', safePage, 'Size:', safeSize, 'Admin:', isAdmin);

//     const response = await userGeoQuestsService.getUserGeoQuests(safePage, safeSize);
    
//     const normalizedItems = Array.isArray(response?.items)
//       ? response.items.map(normalizeUserGeoQuest)
//       : [];

//     // const finalItems = (mode === 'admin' || isAdmin || disableFilter)
//     //   ? normalizedItems
//     //   : normalizedItems.filter(item => {
//     //       const itemUserId = String(item.userId || '').toLowerCase();
//     //       const targetId = String(targetUser?.id || targetUser?.userId || '').toLowerCase();
//     //       return itemUserId === targetId;
//     //     });

//     // console.log('✅ USER GEOQUESTS FINAL ITEMS TO DISPLAY:', finalItems);
//     // setItems(finalItems);
//     const finalItems = normalizedItems;

// console.log('✅ USER GEOQUESTS FINAL ITEMS TO DISPLAY:', finalItems);
// setItems(finalItems);

//     setPagination({
//       currentPage: Number(response?.pagination?.currentPage || response?.pagination?.pageNumber || safePage) || safePage,
//       totalPages: Number(response?.pagination?.totalPages || 1) || 1,
//       totalItems: Number(response?.pagination?.totalItems || response?.pagination?.totalCount || finalItems.length) || finalItems.length,
//       pageSize: Number(response?.pagination?.pageSize || safeSize) || safeSize,
//     });
//   } catch (requestError) {
//     console.error('FAILED TO LOAD USER GEOQUESTS:', requestError);
//     setError(
//       requestError?.response?.data?.message ||
//       requestError?.message ||
//       'فشل في تحميل UserGeoQuests.'
//     );
//     setItems([]);
//   } finally {
//     setLoading(false);
//   }
// };
const loadItems = async (nextPage = pageNumber, nextSize = pageSize) => {
  try {
    setLoading(true);
    setError(null);

    const safePage = Math.max(1, Number(nextPage) || 1);
    const safeSize = Math.min(100, Math.max(1, Number(nextSize) || 10));

    console.log('🔍 Loading UserGeoQuests - Page:', safePage, 'Size:', safeSize);

    const response = await userGeoQuestsService.getUserGeoQuests(safePage, safeSize);

    const normalizedItems = Array.isArray(response?.items)
      ? response.items.map(normalizeUserGeoQuest)
      : [];

    // مهم: لا تعمل filter هنا لأن API response لا يحتوي userId
    const finalItems = normalizedItems;

    console.log('✅ USER GEOQUESTS FINAL ITEMS TO DISPLAY:', finalItems);

    setItems(finalItems);

    setPagination({
      currentPage:
        Number(response?.pagination?.currentPage || response?.pagination?.pageNumber || safePage) ||
        safePage,
      totalPages: Number(response?.pagination?.totalPages || 1) || 1,
      totalItems:
        Number(response?.pagination?.totalItems || response?.pagination?.totalCount || finalItems.length) ||
        finalItems.length,
      pageSize: Number(response?.pagination?.pageSize || safeSize) || safeSize,
    });
  } catch (requestError) {
    console.error('FAILED TO LOAD USER GEOQUESTS:', requestError);
    setError(
      requestError?.response?.data?.message ||
      requestError?.message ||
      'فشل في تحميل UserGeoQuests.'
    );
    setItems([]);
  } finally {
    setLoading(false);
  }
};
  // useEffect(() => {
  //   loadItems(pageNumber, pageSize);
  // }, [pageNumber, pageSize, mode, targetUser?.id, targetUser?.userId]);

  useEffect(() => {
  loadItems(pageNumber, pageSize);
}, [pageNumber, pageSize, mode, isAdmin, disableFilter, targetUser?.id, targetUser?.userId]);
useEffect(() => {
  console.log('🧩 ITEMS STATE TO RENDER:', items);
}, [items]);

  useEffect(() => {
    setPageNumber(1);
    setDetailsOpen(false);
    setEditItem(null);
    setVerifyItem(null);
  }, [targetUser?.id, targetUser?.userId]);

  const openDetails = async (item) => {
    const id = getUserGeoQuestId(item);
    if (!id) return;

    try {
      setDetailsOpen(true);
      setDetailsLoading(true);
      setDetailsItem(normalizeUserGeoQuest(item)); // Fallback to existing data
      setDetailsStatus(null);

      // Fetch details and status independently
      const [detailRes, statusRes] = await Promise.allSettled([
        userGeoQuestsService.getUserGeoQuestById(id),
        userGeoQuestsService.getUserGeoQuestStatus(id),
      ]);

      if (detailRes.status === 'fulfilled') {
        setDetailsItem(detailRes.value);
      } else {
        console.warn('FAILED TO LOAD FULL USER GEOQUEST DETAILS:', detailRes.reason);
        // We already set fallback data above
      }

      if (statusRes.status === 'fulfilled') {
        setDetailsStatus(statusRes.value);
      } else {
        console.warn('FAILED TO LOAD USER GEOQUEST STATUS:', statusRes.reason);
        setDetailsStatus({ status: 'تعذر جلب الحالة من السيرفر' });
      }
    } catch (requestError) {
      console.error('CRITICAL ERROR IN openDetails:', requestError);
    } finally {
      setDetailsLoading(false);
    }
  };

  const refreshStatus = async (item) => {
    const id = getUserGeoQuestId(item);
    if (!id) return;

    try {
      const status = await userGeoQuestsService.getUserGeoQuestStatus(id);
      setDetailsStatus(status);
    } catch (requestError) {
      console.error('FAILED TO REFRESH USER GEOQUEST STATUS:', requestError);
    }
  };

  const openEdit = async (item) => {
    const normalized = normalizeUserGeoQuest(item);
    setEditItem(normalized);
    setEditForm({
      title: normalized?.title || '',
      geoQuestId: normalized?.geoQuestId || '',
      userId: normalized?.userId || '',
    });

    if (geoQuestOptions.length === 0) {
      await loadGeoQuestsOptions();
    }
  };

  const openCreate = async () => {
    setCreateOpen(true);
    setCreateForm({
      title: '',
      geoQuestId: '',
      userId: targetUser?.id || targetUser?.userId || '',
    });

    if (geoQuestOptions.length === 0) {
      await loadGeoQuestsOptions();
    }
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    try {
      setCreating(true);
      await userGeoQuestsService.createUserGeoQuest(createForm);
      setCreateOpen(false);
      await loadItems(pageNumber, pageSize);
      window.alert('تم إنشاء المهمة للمستخدم بنجاح.');
    } catch (requestError) {
      console.error('FAILED TO CREATE USER GEOQUEST:', requestError);
      window.alert(requestError?.response?.data?.message || requestError?.message || 'فشل في إنشاء المهمة.');
    } finally {
      setCreating(false);
    }
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    const id = getUserGeoQuestId(editItem);
    if (!id) return;

    try {
      setSaving(true);
      await userGeoQuestsService.updateUserGeoQuest(id, editForm);
      setEditItem(null);
      await loadItems(pageNumber, pageSize);

      if (detailsOpen && detailsItem && String(getUserGeoQuestId(detailsItem)) === String(id)) {
        await openDetails({ id });
      }
    } catch (requestError) {
      console.error('FAILED TO UPDATE USER GEOQUEST:', requestError);
      if (requestError?.response?.data) {
        console.error('SERVER ERROR DETAILS:', requestError.response.data);
      }
      
      // التعامل مع رسائل الخطأ المختلفة
      const errorMsg = requestError?.response?.data?.message || 
                       requestError?.message || 
                       'فشل في تعديل العنصر.';
                       
      window.alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (item) => {
    const id = getUserGeoQuestId(item);
    if (!id) return;

    const confirmed = await showAppConfirm({
      title: 'تأكيد الحذف',
      message: 'هل تريد حذف هذا العنصر من قاعدة البيانات؟',
      type: 'danger',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
    });

    if (!confirmed) return;

    try {
      await userGeoQuestsService.deleteUserGeoQuest(id);

      if (detailsOpen && String(getUserGeoQuestId(detailsItem)) === String(id)) {
        setDetailsOpen(false);
      }

      await loadItems(pageNumber, pageSize);
    } catch (requestError) {
      console.error('FAILED TO DELETE USER GEOQUEST:', requestError);
      window.alert(requestError?.response?.data?.message || requestError?.message || 'فشل في حذف العنصر.');
    }
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      window.alert('المتصفح لا يدعم تحديد الموقع.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setVerifyForm({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        });
      },
      () => window.alert('تعذر تحديد موقعك الحالي.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleMapSearch = async () => {
    if (!mapSearchQuery.trim()) return;

    try {
      setIsSearchingMap(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        setVerifyForm({
          latitude: Number(parseFloat(result.lat).toFixed(6)),
          longitude: Number(parseFloat(result.lon).toFixed(6)),
        });
        console.log('🔍 Map Search Result:', result);
      } else {
        window.alert('لم يتم العثور على نتائج لهذا الموقع.');
      }
    } catch (err) {
      console.error('Map search failed:', err);
      window.alert('فشل البحث في الخريطة.');
    } finally {
      setIsSearchingMap(false);
    }
  };

  const openVerify = async (item) => {
    const normalized = normalizeUserGeoQuest(item);
    setVerifyItem(normalized);
    setVerifyForm({
      latitude: normalized?.latitude ?? '',
      longitude: normalized?.longitude ?? '',
    });
    setTargetLocationCoords(null);
    setMapSearchQuery('');

    // Fetch Target Location (from DB)
    const geoQuestId = normalized?.geoQuestId;
    if (geoQuestId) {
      try {
        setTargetLocationLoading(true);
        const geoQuest = await geoQuestsService.getGeoQuestById(geoQuestId);
        const locationId = geoQuest?.locationId;
        if (locationId) {
          const location = await locationsService.getLocationById(locationId);
          const coords = resolveCoordinates(location);
          if (coords) {
            console.log('🎯 Target Location Found for Verification:', coords);
            setTargetLocationCoords(coords);
          }
        }
      } catch (err) {
        console.error('Failed to fetch target location for verification:', err);
      } finally {
        setTargetLocationLoading(false);
      }
    }
  };

  const submitVerifyLocation = async (event) => {
    event.preventDefault();
    const id = getUserGeoQuestId(verifyItem);
    if (!id) return;

    try {
      setVerifying(true);
      await userGeoQuestsService.verifyLocation({
        userGeoQuestId: id,
        latitude: verifyForm.latitude,
        longitude: verifyForm.longitude,
      });
      setVerifyItem(null);
      await loadItems(pageNumber, pageSize);

      if (detailsOpen && String(getUserGeoQuestId(detailsItem)) === String(id)) {
        await openDetails({ id });
      }
    } catch (requestError) {
      console.error('FAILED TO VERIFY LOCATION:', requestError);
      if (requestError?.response?.data) {
        console.error('VERIFY LOCATION ERROR DETAILS:', requestError.response.data);
      }
      window.alert(requestError?.response?.data?.message || requestError?.message || 'فشل في حفظ الموقع.');
    } finally {
      setVerifying(false);
    }
  };

  const detailsCoordinates = resolveCoordinates(detailsItem, detailsStatus);
  const verifyCoordinates = resolveCoordinates(verifyForm);

  return (
    <div style={{ ...cardStyle, direction: 'rtl', color: 'var(--text-primary)', fontFamily: "'Cairo', sans-serif" }}>
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>{activeTitle}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', opacity: 0.75 }}>
            {disableFilter ? 'عرض جميع المهام من الريسبونس (بدون فلترة)' : 'يتم عرض المهام الخاصة بهذا المستخدم فقط.'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', opacity: 0.6, marginTop: 4 }}>
            API: /api/UserGeoQuests?PageNumber={pageNumber}&PageSize={pageSize}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {isAdmin && (
            <button
              type="button"
              onClick={openCreate}
              style={{
                ...panelStyles.btn,
                width: 'auto',
                padding: '0 16px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--success)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              إضافة مهمة جديدة
            </button>
          )}

          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPageNumber(1);
            }}
            style={{
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg-card-2)',
              color: 'var(--text-primary)',
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            {[10, 20, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => loadItems(pageNumber, pageSize)}
            title="إعادة تحميل"
            style={{
              ...panelStyles.btn,
              width: 40,
              background: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--primary)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            <FaRedo size={13} />
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 12,
            background: 'var(--error-light)',
            color: 'var(--error)',
            border: '1px solid var(--error)',
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 28, color: 'var(--text-secondary)', opacity: 0.8 }}>جاري تحميل العناصر...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 28, color: 'var(--text-secondary)', opacity: 0.7 }}>لا توجد عناصر لعرضها في هذه الصفحة.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((item) => {
            const normalized = normalizeUserGeoQuest(item);
            const coords = resolveCoordinates(normalized);

            return (
              <div
                key={getUserGeoQuestId(normalized)}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: 'var(--bg-card-2)',
                  border: '1px solid var(--border)',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 8, color: 'var(--text-primary)' }}>
                    {toText(normalized.title, 'بدون عنوان')}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
                    <Field label="الحالة" value={normalized.status} light={light} />
                    <Field label="المستخدم" value={normalized.userName || targetUser?.name || targetUser?.email} light={light} />
                    <Field label="المهمة" value={normalized.geoQuestTitle || normalized.title} light={light} />
                  </div>

                  {(normalized.userName || normalized.geoQuestTitle || normalized.createdAt) && (
                    <div style={{ marginTop: 10, display: 'grid', gap: 4, fontSize: 12, color: 'var(--text-secondary)', opacity: 0.8 }}>
                      {normalized.userName && <div>المستخدم: {toText(normalized.userName)}</div>}
                      {normalized.geoQuestTitle && <div>اسم المهمة: {toText(normalized.geoQuestTitle)}</div>}
                      {normalized.createdAt && <div>تاريخ الإنشاء: {formatDate(normalized.createdAt)}</div>}
                    </div>
                  )}

                  {coords && (
                    <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: 'var(--primary)', opacity: 0.85 }}>
                      <FaMapMarkerAlt style={{ marginLeft: 6 }} />
                      {coords.latitude}, {coords.longitude}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => openDetails(normalized)}
                    title="تفاصيل"
                    style={{
                      ...panelStyles.btn,
                      background: 'rgba(59, 130, 246, 0.12)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    <FaEye size={13} />
                  </button>

                  {canVerifyLocation && (
                    <button
                      type="button"
                      onClick={() => openVerify(normalized)}
                      title="توثيق الموقع"
                      style={{
                        ...panelStyles.btn,
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: 'var(--success)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      <FaLocationArrow size={13} />
                    </button>
                  )}

                  {isAdmin && mode === 'admin' && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(normalized)}
                        title="تعديل"
                        style={{
                          ...panelStyles.btn,
                          background: 'rgba(245, 158, 11, 0.12)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245, 158, 11, 0.2)',
                        }}
                      >
                        <FaEdit size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeItem(normalized)}
                        title="حذف"
                        style={{
                          ...panelStyles.btn,
                          background: 'rgba(239, 68, 68, 0.12)',
                          color: 'var(--error)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                        }}
                      >
                        <FaTrash size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 14,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', opacity: 0.75 }}>
          صفحة {pagination.currentPage} من {pagination.totalPages} - إجمالي {pagination.totalItems}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
            disabled={pageNumber <= 1}
            style={{
              ...panelStyles.btn,
              width: 40,
              background: 'var(--bg-card-2)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              opacity: pageNumber <= 1 ? 0.45 : 1,
              cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
            }}
          >
            <FaChevronRight size={12} />
          </button>

          <button
            type="button"
            onClick={() => setPageNumber((current) => Math.min(pagination.totalPages || current + 1, current + 1))}
            disabled={pageNumber >= pagination.totalPages}
            style={{
              ...panelStyles.btn,
              width: 40,
              background: 'var(--bg-card-2)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              opacity: pageNumber >= pagination.totalPages ? 0.45 : 1,
              cursor: pageNumber >= pagination.totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            <FaChevronLeft size={12} />
          </button>
        </div>
      </div>

      {detailsOpen && (
        <Modal title="تفاصيل UserGeoQuest" onClose={() => setDetailsOpen(false)} light={light}>
          {detailsLoading ? (
            <div style={{ textAlign: 'center', padding: 20 }}>جاري تحميل التفاصيل...</div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {detailsStatus && (
                  <div style={{ padding: 12, borderRadius: 12, background: light ? '#f8fafc' : 'rgba(255,255,255,0.06)', border: light ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.12)' }}>
                    <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>Current Status</div>
                    <div style={{ fontSize: 13, fontWeight: 700, wordBreak: 'break-word', fontFamily: 'inherit' }}>
                      {detailsStatus?.status || detailsStatus?.Status || 'تعذر جلب الحالة من السيرفر'}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                <Field label="Title" value={detailsItem?.title} light={light} />
                <Field
                  label="Current Status"
                  value={detailsStatus?.status || detailsStatus?.Status || detailsItem?.status}
                  light={light}
                />
                <Field label="Is Active" value={detailsStatus?.isActive ? 'Yes' : 'No'} light={light} />
              </div>

              {detailsCoordinates && (
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 900 }}>الموقع الحالي على الخريطة</div>
                  <div
                    style={{
                      borderRadius: 14,
                      overflow: 'hidden',
                      border: light ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <iframe
                      title="user-geoquest-location"
                      src={buildMapUrl(detailsCoordinates)}
                      width="100%"
                      height="260"
                      style={{ border: 0, display: 'block' }}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {editItem && (
        <Modal title="تعديل UserGeoQuest" onClose={() => setEditItem(null)} light={light} maxWidth={820}>
          <form onSubmit={submitEdit} style={{ display: 'grid', gap: 14 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800 }}>العنوان</span>
              <input
                value={editForm.title}
                onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
                style={{ padding: 12, borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 800 }}>المستخدم</span>
              <select
                value={editForm.userId}
                onChange={(event) => setEditForm((current) => ({ ...current, userId: event.target.value }))}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  fontSize: 14,
                  background: '#fff',
                }}
              >
                <option value="">اختر مستخدمًا</option>
                {normalizedUsers.map((userOption) => (
                  <option key={userOption.id} value={userOption.id}>
                    {userOption.name || userOption.email || 'مستخدم'}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>المهمة الجغرافية</div>
              {geoQuestOptionsLoading ? (
                <div style={{ fontSize: 13, color: '#64748b' }}>جاري تحميل الـ GeoQuests...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  {geoQuestOptions.map((geoQuest) => {
                    const selected = String(editForm.geoQuestId) === String(geoQuest.id);
                    return (
                      <button
                        key={geoQuest.id}
                        type="button"
                        onClick={() => setEditForm((current) => ({ ...current, geoQuestId: geoQuest.id }))}
                        style={{
                          textAlign: 'right',
                          padding: 14,
                          borderRadius: 14,
                          border: selected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: selected ? '#dbeafe' : '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 900, marginBottom: 6 }}>{toText(geoQuest.title, 'بدون عنوان')}</div>
                        <div style={{ fontSize: 12, color: '#475569' }}>{geoQuest.locationName || geoQuest.location?.name || 'موقع مرتبط'}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setEditItem(null)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: saving ? '#94a3b8' : '#2563eb',
                  color: '#fff',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <FaSave size={13} />
                {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {createOpen && (
        <Modal title="إضافة مهمة جديدة للمستخدم" onClose={() => setCreateOpen(false)} light={light}>
          <form onSubmit={submitCreate} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, opacity: 0.7, display: 'block', marginBottom: 6 }}>
                عنوان المهمة (اختياري)
              </label>
              <input
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                placeholder="أدخل عنواناً للمهمة..."
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  border: light ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.18)',
                  background: light ? '#fff' : 'rgba(255,255,255,0.06)',
                  color: light ? '#0f172a' : '#fff',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, opacity: 0.7, display: 'block', marginBottom: 6 }}>
                اختر المهمة الجغرافية الأساسية
              </label>
              <select
                required
                value={createForm.geoQuestId}
                onChange={(e) => setCreateForm({ ...createForm, geoQuestId: e.target.value })}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 12,
                  border: light ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.18)',
                  background: light ? '#fff' : 'rgba(255,255,255,0.06)',
                  color: light ? '#0f172a' : '#fff',
                }}
              >
                <option value="">-- اختر مهمة جغرافية --</option>
                {geoQuestOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.title || 'مهمة جغرافية'}
                  </option>
                ))}
              </select>
              {geoQuestOptionsLoading && (
                <div style={{ fontSize: 11, color: '#6366f1', marginTop: 4 }}>جاري تحميل الخيارات...</div>
              )}
            </div>

            <div>
              <label style={{ fontSize: 12, opacity: 0.7, display: 'block', marginBottom: 6 }}>
                المستخدم المستهدف
              </label>
              {normalizedUsers.length > 0 ? (
                <select
                  required
                  value={createForm.userId}
                  onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 12,
                    border: light ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.18)',
                    background: light ? '#fff' : 'rgba(255,255,255,0.06)',
                    color: light ? '#0f172a' : '#fff',
                  }}
                >
                  <option value="">-- اختر مستخدماً --</option>
                  {normalizedUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email || 'مستخدم'}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={createForm.userId}
                  onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
                  placeholder="اكتب اسم المستخدم أو اختاره من القائمة..."
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 12,
                    border: light ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.18)',
                    background: light ? '#fff' : 'rgba(255,255,255,0.06)',
                    color: light ? '#0f172a' : '#fff',
                  }}
                />
              )}
            </div>

            <button
              type="submit"
              disabled={creating}
              style={{
                padding: '14px',
                borderRadius: 14,
                border: 'none',
                background: '#10b981',
                color: '#fff',
                fontWeight: 900,
                cursor: 'pointer',
                marginTop: 10,
              }}
            >
              {creating ? 'جاري الحفظ...' : 'تأكيد الإضافة'}
            </button>
          </form>
        </Modal>
      )}

      {verifyItem && (
        <Modal title="إضافة الموقع الحالي" onClose={() => setVerifyItem(null)} light={light} maxWidth={700}>
          <form onSubmit={submitVerifyLocation} style={{ display: 'grid', gap: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>
              المهمة: <span>{verifyItem.title || verifyItem.geoQuestTitle || 'مهمة جغرافية'}</span>
            </div>

            <button
              type="button"
              onClick={detectCurrentLocation}
              style={{
                border: 'none',
                borderRadius: 12,
                padding: '12px 14px',
                background: '#16a34a',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 800,
              }}
            >
              استخدام موقع المستخدم الحالي
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleMapSearch())}
                placeholder="ابحث عن مكان على الخريطة..."
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  border: light ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.18)',
                  background: light ? '#fff' : 'rgba(255,255,255,0.06)',
                  color: light ? '#0f172a' : '#fff',
                }}
              />
              <button
                type="button"
                onClick={handleMapSearch}
                disabled={isSearchingMap}
                style={{
                  padding: '0 20px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#3b82f6',
                  color: '#fff',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {isSearchingMap ? 'جاري البحث...' : <FaSearch />}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800 }}>Latitude</span>
                <input
                  value={verifyForm.latitude}
                  onChange={(event) => setVerifyForm((current) => ({ ...current, latitude: event.target.value }))}
                  style={{ padding: 12, borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800 }}>Longitude</span>
                <input
                  value={verifyForm.longitude}
                  onChange={(event) => setVerifyForm((current) => ({ ...current, longitude: event.target.value }))}
                  style={{ padding: 12, borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </label>
            </div>

            {/* Target Location from Database */}
            {targetLocationCoords && (
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaMapMarkerAlt />
                  الموقع المطلوب في قاعدة البيانات (Target)
                </div>
                <div style={{ borderRadius: 14, overflow: 'hidden', border: '2px solid #2563eb' }}>
                  <iframe
                    title="target-location-map"
                    src={buildMapUrl(targetLocationCoords)}
                    width="100%"
                    height="240"
                    style={{ border: 0, display: 'block' }}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  إحداثيات الهدف: {targetLocationCoords.latitude}, {targetLocationCoords.longitude}
                </div>
              </div>
            )}

            {targetLocationLoading && (
              <div style={{ textAlign: 'center', padding: 10, color: '#6366f1', fontSize: 13 }}>
                جاري جلب إحداثيات الهدف...
              </div>
            )}

            {verifyCoordinates && (
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaLocationArrow />
                  موقعك الحالي المحدد للتوثيق
                </div>
                <div style={{ borderRadius: 14, overflow: 'hidden', border: '2px solid #16a34a' }}>
                  <iframe
                    title="verify-location-map"
                    src={buildMapUrl(verifyCoordinates)}
                    width="100%"
                    height="240"
                    style={{ border: 0, display: 'block' }}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setVerifyItem(null)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={verifying}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: verifying ? '#94a3b8' : '#2563eb',
                  color: '#fff',
                  cursor: verifying ? 'not-allowed' : 'pointer',
                  fontWeight: 800,
                }}
              >
                {verifying ? 'جاري الحفظ...' : 'حفظ الموقع'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
