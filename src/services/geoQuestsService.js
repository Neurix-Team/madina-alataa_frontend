import { axiosClient } from './axiosClient';

const GEOQUESTS_API_URL = '/api/GeoQuests';
const DELETED_GEOQUEST_IDS_STORAGE_KEY = 'deleted_geoquest_ids';

export function getGeoQuestId(geoQuest) {
  return (
    geoQuest?.id ||
    geoQuest?.Id ||
    geoQuest?.geoQuestId ||
    geoQuest?.GeoQuestId ||
    geoQuest?.guid ||
    geoQuest?.Guid ||
    ''
  );
}

export function normalizeGeoQuest(geoQuest) {
  if (!geoQuest || typeof geoQuest !== 'object') return geoQuest;

  return {
    ...geoQuest,
    id: getGeoQuestId(geoQuest),
    title: geoQuest?.title ?? geoQuest?.Title ?? '',
    locationId: geoQuest?.locationId ?? geoQuest?.LocationId ?? '',
    createdAt: geoQuest?.createdAt ?? geoQuest?.CreatedAt ?? null,
    updatedAt: geoQuest?.updatedAt ?? geoQuest?.UpdatedAt ?? null,
    isDeleted: geoQuest?.isDeleted ?? geoQuest?.IsDeleted ?? false,
    deleted: geoQuest?.deleted ?? geoQuest?.Deleted ?? false,
    deletedAt: geoQuest?.deletedAt ?? geoQuest?.DeletedAt ?? null,
    status: geoQuest?.status ?? geoQuest?.Status ?? '',
    isActive: geoQuest?.isActive ?? geoQuest?.IsActive,
  };
}

function getDeletedGeoQuestIds() {
  try {
    const raw = localStorage.getItem(DELETED_GEOQUEST_IDS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (error) {
    console.warn('Failed to read deleted geoquest ids from localStorage', error);
    return [];
  }
}

function storeDeletedGeoQuestId(id) {
  if (!id) return;

  try {
    const nextIds = Array.from(new Set([...getDeletedGeoQuestIds(), String(id)]));
    localStorage.setItem(DELETED_GEOQUEST_IDS_STORAGE_KEY, JSON.stringify(nextIds));
  } catch (error) {
    console.warn('Failed to store deleted geoquest id in localStorage', error);
  }
}

function removeDeletedGeoQuestId(id) {
  if (!id) return;

  try {
    const nextIds = getDeletedGeoQuestIds().filter((item) => String(item) !== String(id));
    localStorage.setItem(DELETED_GEOQUEST_IDS_STORAGE_KEY, JSON.stringify(nextIds));
  } catch (error) {
    console.warn('Failed to clear deleted geoquest id from localStorage', error);
  }
}

function isVisibleGeoQuest(geoQuest) {
  const normalized = normalizeGeoQuest(geoQuest);
  const status = String(normalized?.status || '').toLowerCase();
  const deletedIds = new Set(getDeletedGeoQuestIds());

  if (!normalized?.id) return false;
  if (deletedIds.has(String(normalized.id))) return false;
  if (normalized?.isDeleted === true) return false;
  if (normalized?.deleted === true) return false;
  if (normalized?.deletedAt) return false;
  if (normalized?.isActive === false) return false;
  if (status === 'deleted' || status === 'inactive' || status === 'archived') return false;

  return true;
}

function normalizeGeoQuestCollection(raw) {
  const items = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.items)
        ? raw.items
        : Array.isArray(raw?.value)
          ? raw.value
          : Array.isArray(raw?.result)
            ? raw.result
            : Array.isArray(raw?.data?.items)
              ? raw.data.items
              : Array.isArray(raw?.value?.items)
                ? raw.value.items
                : Array.isArray(raw?.result?.items)
                  ? raw.result.items
                  : [];

  const pagination =
    raw?.pagination ||
    raw?.data?.pagination ||
    raw?.value?.pagination ||
    raw?.result?.pagination ||
    {};

  return {
    items: items.map(normalizeGeoQuest).filter(isVisibleGeoQuest),
    pagination,
  };
}

function buildQuestPayload(geoQuestData) {
  const payload = {
    title: String(geoQuestData?.title || '').trim(),
    locationId: String(geoQuestData?.locationId || '').trim(),
  };

  if (!payload.title) {
    throw new Error('عنوان المهمة الجغرافية مطلوب');
  }

  if (!payload.locationId) {
    throw new Error('معرف الموقع مطلوب');
  }

  return payload;
}

function buildGeoQuestFormData(geoQuestData, id = '') {
  const payload = {
    ...buildQuestPayload(geoQuestData),
    ...(id ? { id: String(id).trim() } : {}),
  };
  const formData = new FormData();

  if (payload.id) {
    formData.append('id', payload.id);
  }
  formData.append('title', payload.title);
  formData.append('locationId', payload.locationId);

  return { payload, formData };
}

export const geoQuestsService = {
  getGeoQuests: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosClient.get(
        `${GEOQUESTS_API_URL}?PageNumber=${pageNumber}&PageSize=${pageSize}`
      );
      console.log('GEOQUESTS LIST RAW RESPONSE:', response.data);

      const { items, pagination } = normalizeGeoQuestCollection(response.data);
      console.log('GEOQUESTS LIST ITEMS:', items);

      return {
        items,
        pagination: {
          currentPage: Number(pagination.currentPage || pagination.pageNumber || pageNumber) || pageNumber,
          totalPages: Number(pagination.totalPages || 1) || 1,
          totalItems: Number(pagination.totalItems || pagination.totalCount || items.length) || items.length,
          pageSize: Number(pagination.pageSize || pageSize) || pageSize,
        },
      };
    } catch (error) {
      console.error('GEOQUESTS LIST ERROR:', error);
      throw error;
    }
  },

  getGeoQuestById: async (id) => {
    try {
      console.log('GEOQUEST DETAILS REQUEST ID:', id);
      const response = await axiosClient.get(`${GEOQUESTS_API_URL}/${id}`);
      console.log('GEOQUEST DETAILS RAW RESPONSE:', response.data);

      const raw = response.data;
      const geoQuest = normalizeGeoQuest(raw?.value || raw?.data || raw?.result || raw);
      console.log('GEOQUEST DETAILS ITEM:', geoQuest);

      return geoQuest;
    } catch (error) {
      console.error('GEOQUEST DETAILS ERROR:', error);
      throw error;
    }
  },

  createGeoQuest: async (geoQuestData) => {
    const { payload, formData } = buildGeoQuestFormData(geoQuestData);

    try {
      console.log('CREATE GEOQUEST REQUEST:', payload);
      const response = await axiosClient.post(GEOQUESTS_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('CREATE GEOQUEST RESPONSE:', response.data);
      removeDeletedGeoQuestId(getGeoQuestId(response.data));
      return response.data;
    } catch (error) {
      if (error?.response?.status === 415) {
        console.warn('CREATE GEOQUEST FORM-DATA 415, retrying with JSON payload');
        const fallbackResponse = await axiosClient.post(GEOQUESTS_API_URL, payload);
        console.log('CREATE GEOQUEST JSON FALLBACK RESPONSE:', fallbackResponse.data);
        removeDeletedGeoQuestId(getGeoQuestId(fallbackResponse.data));
        return fallbackResponse.data;
      }
      console.error('CREATE GEOQUEST ERROR:', error);
      throw error;
    }
  },

  updateGeoQuest: async (id, geoQuestData) => {
    const { payload, formData } = buildGeoQuestFormData(geoQuestData, id);

    try {
      console.log('UPDATE GEOQUEST REQUEST:', { id, ...payload });
      const response = await axiosClient.put(`${GEOQUESTS_API_URL}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('UPDATE GEOQUEST RESPONSE:', response.data);
      removeDeletedGeoQuestId(id);
      return response.data;
    } catch (error) {
      if (error?.response?.status === 415) {
        console.warn('UPDATE GEOQUEST FORM-DATA 415, retrying with JSON payload');
        const fallbackResponse = await axiosClient.put(`${GEOQUESTS_API_URL}/${id}`, payload);
        console.log('UPDATE GEOQUEST JSON FALLBACK RESPONSE:', fallbackResponse.data);
        removeDeletedGeoQuestId(id);
        return fallbackResponse.data;
      }
      if (error?.response?.status === 400) {
        console.error('UPDATE GEOQUEST 400 RESPONSE BODY:', error?.response?.data);
      }
      console.error('UPDATE GEOQUEST ERROR:', error);
      throw error;
    }
  },

  deleteGeoQuest: async (id) => {
    try {
      console.log('DELETE GEOQUEST REQUEST ID:', id);
      const response = await axiosClient.delete(`${GEOQUESTS_API_URL}/${id}`);
      console.log('DELETE GEOQUEST RESPONSE:', response.data);
      storeDeletedGeoQuestId(id);
      return response.data;
    } catch (error) {
      console.error('DELETE GEOQUEST ERROR:', error);
      throw error;
    }
  },

  startGeoQuest: async (id) => {
    try {
      console.log('START GEOQUEST REQUEST ID:', id);
      const response = await axiosClient.post(`${GEOQUESTS_API_URL}/${id}/start`);
      console.log('START GEOQUEST RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      console.error('START GEOQUEST ERROR:', error);
      throw error;
    }
  },

  searchGeoQuests: async (searchTerm, pageNumber = 1, pageSize = 10) => {
    try {
      const response = await axiosClient.get(
        `${GEOQUESTS_API_URL}?search=${encodeURIComponent(searchTerm)}&PageNumber=${pageNumber}&PageSize=${pageSize}`
      );
      console.log('GEOQUESTS SEARCH RAW RESPONSE:', response.data);

      const { items, pagination } = normalizeGeoQuestCollection(response.data);
      console.log('GEOQUESTS SEARCH ITEMS:', items);

      return {
        items,
        pagination: {
          currentPage: Number(pagination.currentPage || pagination.pageNumber || pageNumber) || pageNumber,
          totalPages: Number(pagination.totalPages || 1) || 1,
          totalItems: Number(pagination.totalItems || pagination.totalCount || items.length) || items.length,
          pageSize: Number(pagination.pageSize || pageSize) || pageSize,
        },
      };
    } catch (error) {
      console.error('GEOQUESTS SEARCH ERROR:', error);
      throw error;
    }
  },
};
