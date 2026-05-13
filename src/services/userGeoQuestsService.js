import { axiosClient } from './axiosClient';

const USER_GEOQUESTS_API_URL = '/api/UserGeoQuests';

export function getUserGeoQuestId(item) {
  return (
    item?.id ||
    item?.Id ||
    item?.userGeoQuestId ||
    item?.UserGeoQuestId ||
    item?.guid ||
    item?.Guid ||
    ''
  );
}

export function normalizeUserGeoQuest(item) {
  if (!item || typeof item !== 'object') return item;

  return {
    ...item,
    id: getUserGeoQuestId(item),
    title: item?.title ?? item?.Title ?? item?.geoQuestTitle ?? item?.GeoQuestTitle ?? '',
    status: item?.status ?? item?.Status ?? '',
    userId:
      item?.userId ??
      item?.UserId ??
      item?.user?.id ??
      item?.user?.Id ??
      item?.user?.userId ??
      item?.User?.id ??
      item?.User?.Id ??
      '',
    geoQuestId:
      item?.geoQuestId ??
      item?.GeoQuestId ??
      item?.geoQuest?.id ??
      item?.geoQuest?.Id ??
      item?.GeoQuest?.id ??
      item?.GeoQuest?.Id ??
      '',
    latitude: item?.latitude ?? item?.Latitude ?? item?.lat ?? item?.Lat ?? null,
    longitude: item?.longitude ?? item?.Longitude ?? item?.lng ?? item?.Lng ?? null,
    createdAt: item?.createdAt ?? item?.CreatedAt ?? null,
    updatedAt: item?.updatedAt ?? item?.UpdatedAt ?? null,
    geoQuestTitle:
      item?.geoQuestTitle ??
      item?.GeoQuestTitle ??
      item?.geoQuest?.title ??
      item?.geoQuest?.Title ??
      item?.GeoQuest?.title ??
      item?.GeoQuest?.Title ??
      '',
    userName:
      item?.userName ??
      item?.UserName ??
      item?.user?.fullName ??
      item?.user?.FullName ??
      item?.User?.fullName ??
      item?.User?.FullName ??
      '',
  };
}

function normalizeCollection(raw, pageNumber, pageSize) {
  console.log('🛠️ Normalizing UserGeoQuests Collection. Raw Data:', JSON.stringify(raw, null, 2));
  
  // Handle the API response structure: {value: {items: [...], pagination: {...}}, succeeded: true}
  const value = raw?.value || raw?.data || raw?.result || raw;
  
  let items = [];
  if (Array.isArray(value?.items)) {
    items = value.items;
  } else if (Array.isArray(value)) {
    items = value;
  } else if (Array.isArray(raw?.items)) {
    items = raw.items;
  } else if (Array.isArray(raw?.data)) {
    items = raw.data;
  } else if (Array.isArray(raw?.result)) {
    items = raw.result;
  } else if (Array.isArray(raw?.data?.items)) {
    items = raw.data.items;
  } else if (Array.isArray(raw?.value?.items)) {
    items = raw.value.items;
  } else if (Array.isArray(raw?.result?.items)) {
    items = raw.result.items;
  } else if (Array.isArray(raw?.value?.value?.items)) {
    items = raw.value.value.items;
  } else if (Array.isArray(raw?.value?.data?.items)) {
    items = raw.value.data.items;
  }

  const pagination =
    value?.pagination ||
    raw?.pagination ||
    raw?.data?.pagination ||
    raw?.value?.pagination ||
    raw?.result?.pagination ||
    value ||
    {};

  const normalizedItems = items.map(normalizeUserGeoQuest);
  console.log('✅ Normalized Items Count:', normalizedItems.length);
  
  return {
    items: normalizedItems,
    pagination: {
      currentPage: Number(pagination.currentPage || pagination.pageNumber || pageNumber) || pageNumber,
      totalPages: Number(pagination.totalPages || 1) || 1,
      totalItems: Number(pagination.totalItems || pagination.totalCount || normalizedItems.length) || normalizedItems.length,
      pageSize: Number(pagination.pageSize || pageSize) || pageSize,
    },
  };
}

function buildUpdatePayload(payload, id = '') {
  const finalId = id || payload?.id || '';
  const body = {
    title: String(payload?.title || '').trim(),
    geoQuestId: String(payload?.geoQuestId || '').trim(),
    userId: String(payload?.userId || '').trim(),
  };

  // Some APIs require the ID to be present in the body as well
  if (finalId) {
    body.id = finalId;
  }

  return body;
}

function buildVerifyPayload(payload) {
  const latitude = payload?.latitude !== undefined && payload?.latitude !== null 
    ? Number(payload.latitude) 
    : null;
  const longitude = payload?.longitude !== undefined && payload?.longitude !== null 
    ? Number(payload.longitude) 
    : null;

  // Validate required fields
  if (!payload?.userGeoQuestId || String(payload?.userGeoQuestId).trim() === '') {
    console.error('❌ Missing userGeoQuestId in verify payload');
    throw new Error('userGeoQuestId is required for location verification');
  }

  if (latitude === null || longitude === null) {
    console.error('❌ Missing valid coordinates');
    throw new Error('Valid latitude and longitude are required for location verification');
  }

  const finalPayload = {
    userGeoQuestId: String(payload?.userGeoQuestId || '').trim(),
    latitude: isNaN(latitude) ? null : latitude,
    longitude: isNaN(longitude) ? null : longitude,
  };

  console.log('🔍 Verify Location Payload:', finalPayload);
  console.log('🔍 Original Payload:', payload);

  return finalPayload;
}

export const userGeoQuestsService = {
//   getUserGeoQuests: async (pageNumber = 1, pageSize = 10) => {
//     const url = `${USER_GEOQUESTS_API_URL}?PageNumber=${pageNumber}&PageSize=${pageSize}`;
//     console.log('USER GEOQUESTS LIST REQUEST:', { pageNumber, pageSize, url });
//     const response = await axiosClient.get(url);
//     console.log('USER GEOQUESTS LIST RAW RESPONSE:', response.data);
//     const normalized = normalizeCollection(response.data, pageNumber, pageSize);
//     console.log('USER GEOQUESTS LIST ITEMS:', normalized.items);
//     return normalized;
//   },
// getUserGeoQuests: async (pageNumber = 1, pageSize = 100) => {
//   const safePageNumber = Math.max(1, Number(pageNumber) || 1);
//   const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 100));

//   // Temporary workaround:
//   // Backend is currently returning pageNumber from PageSize
//   // and pageSize from PageNumber for /api/UserGeoQuests.
//   const url = `${USER_GEOQUESTS_API_URL}?PageNumber=${safePageSize}&PageSize=${safePageNumber}`;

//   console.log('USER GEOQUESTS LIST REQUEST:', {
//     requestedPageNumber: safePageNumber,
//     requestedPageSize: safePageSize,
//     actualUrl: url,
//   });

//   const response = await axiosClient.get(url);

//   console.log('USER GEOQUESTS LIST RAW RESPONSE:', response.data);

//   const normalized = normalizeCollection(response.data, safePageNumber, safePageSize);

//   console.log('USER GEOQUESTS LIST ITEMS:', normalized.items);

//   return normalized;
// },
getUserGeoQuests: async (pageNumber = 1, pageSize = 10) => {
  const safePageNumber = Math.max(1, Number(pageNumber) || 1);
  const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 10));

  const url = `${USER_GEOQUESTS_API_URL}?PageNumber=${safePageNumber}&PageSize=${safePageSize}`;
  console.log('🌐 USER GEOQUESTS API REQUEST:', { url, pageNumber: safePageNumber, pageSize: safePageSize });

  try {
    const response = await axiosClient.get(url);
    
    // Log the full response for debugging as requested by the user
    console.log('📥 USER GEOQUESTS API FULL RESPONSE:', response.data);
    
    if (response.data?.value?.items) {
      console.log('📦 USER GEOQUESTS ITEMS (from .value.items):', response.data.value.items);
    } else if (response.data?.items) {
      console.log('📦 USER GEOQUESTS ITEMS (from .items):', response.data.items);
    }

    const normalized = normalizeCollection(response.data, safePageNumber, safePageSize);
    console.log('✨ USER GEOQUESTS NORMALIZED ITEMS:', normalized.items);

    return normalized;
  } catch (error) {
    console.error('❌ USER GEOQUESTS API ERROR:', error);
    throw error;
  }
},

  getUserGeoQuestById: async (id) => {
    console.log('USER GEOQUEST DETAILS REQUEST ID:', id);
    const response = await axiosClient.get(`${USER_GEOQUESTS_API_URL}/${id}`);
    console.log('USER GEOQUEST DETAILS RAW RESPONSE:', response.data);
    const raw = response.data?.value || response.data?.data || response.data?.result || response.data;
    const normalized = normalizeUserGeoQuest(raw);
    console.log('USER GEOQUEST DETAILS ITEM:', normalized);
    return normalized;
  },

  getUserGeoQuestStatus: async (id, token = null) => {
    console.log('USER GEOQUEST STATUS REQUEST ID:', id, 'tokenProvided:', !!token);
    const url = `${USER_GEOQUESTS_API_URL}/${id}/status`;

    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;

    const response = await axiosClient.get(url, config);
    console.log('USER GEOQUEST STATUS RAW RESPONSE:', response.data);

    const raw = response.data?.value || response.data?.data || response.data?.result || response.data;

    // Normalize possible shapes into a predictable object
    if (raw === null || raw === undefined) return { status: null };
    if (typeof raw === 'string') return { status: raw };
    if (typeof raw === 'object') {
      return {
        status: raw.status ?? raw.Status ?? null,
        isActive: raw.isActive ?? raw.IsActive ?? null,
        raw,
      };
    }

    return { status: String(raw) };
  },

  createUserGeoQuest: async (payload) => {
    const body = {
      title: String(payload?.title || '').trim(),
      geoQuestId: String(payload?.geoQuestId || '').trim(),
      userId: String(payload?.userId || '').trim(),
      status: payload?.status || 'Open',
    };

    if (!body.geoQuestId) throw new Error('geoQuestId is required');
    if (!body.userId) throw new Error('userId is required');

    console.log('USER GEOQUEST CREATE REQUEST:', body);
    const response = await axiosClient.post(USER_GEOQUESTS_API_URL, body);
    console.log('USER GEOQUEST CREATE RESPONSE:', response.data);
    return response.data;
  },

  updateUserGeoQuest: async (id, payload) => {
    const body = buildUpdatePayload(payload, id);
    
    // التحقق من صحة المعرفات قبل الإرسال لتجنب 400 Bad Request
    if (!body.geoQuestId || body.geoQuestId === '') {
      throw new Error('معرف المهمة الجغرافية (GeoQuest ID) مطلوب.');
    }
    if (!body.userId || body.userId === '') {
      throw new Error('معرف المستخدم (User ID) مطلوب.');
    }

    console.log('USER GEOQUEST UPDATE REQUEST:', { id, ...body });
    const response = await axiosClient.put(`${USER_GEOQUESTS_API_URL}/${id}`, body);
    console.log('USER GEOQUEST UPDATE RESPONSE:', response.data);
    return response.data;
  },

  deleteUserGeoQuest: async (id) => {
    console.log('USER GEOQUEST DELETE REQUEST ID:', id);
    const response = await axiosClient.delete(`${USER_GEOQUESTS_API_URL}/${id}`);
    console.log('USER GEOQUEST DELETE RESPONSE:', response.data);
    return response.data;
  },

  verifyLocation: async (payload) => {
    const body = buildVerifyPayload(payload);
    console.log('🌍 USER GEOQUEST VERIFY LOCATION REQUEST:', body);
    console.log('📍 Latitude being sent:', body.latitude, 'Type:', typeof body.latitude);
    console.log('📍 Longitude being sent:', body.longitude, 'Type:', typeof body.longitude);
    console.log('🆔 UserGeoQuestId being sent:', body.userGeoQuestId);
    try {
      const response = await axiosClient.post(`${USER_GEOQUESTS_API_URL}/verify-location`, body);
      console.log('✅ USER GEOQUEST VERIFY LOCATION RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      if (error?.response?.status === 400) {
        console.error('❌ VERIFY LOCATION 400 ERROR BODY:', error?.response?.data);
      }
      throw error;
    }
  },
};
