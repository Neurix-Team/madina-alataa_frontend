import { axiosClient } from './axiosClient';

const LEVELS_ENDPOINT = '/api/Levels';

const normalizeLevelRecord = (level) => {
  if (!level || typeof level !== 'object') return level;

  return {
    ...level,
    id: level?.id ?? level?.Id ?? level?.levelId ?? level?.LevelId ?? level?.guid ?? level?.Guid ?? '',
    number: level?.number ?? level?.Number ?? 0,
    maxXp: level?.maxXp ?? level?.MaxXp ?? 0,
    isDeleted: level?.isDeleted ?? level?.IsDeleted ?? false,
    deleted: level?.deleted ?? level?.Deleted ?? false,
    deletedAt: level?.deletedAt ?? level?.DeletedAt ?? null,
    status: level?.status ?? level?.Status ?? '',
    isActive: level?.isActive ?? level?.IsActive,
  };
};

const isVisibleLevelRecord = (level) => {
  const normalized = normalizeLevelRecord(level);
  const status = String(normalized?.status || '').toLowerCase();

  if (normalized?.isDeleted === true) return false;
  if (normalized?.deleted === true) return false;
  if (normalized?.deletedAt) return false;
  if (status === 'deleted' || status === 'inactive' || status === 'archived') return false;
  if (normalized?.isActive === false) return false;

  return true;
};

export const normalizeLevelsListResponse = (responseData) => {
  const raw = responseData ?? null;
  const root =
    raw?.value && typeof raw.value === 'object' && !Array.isArray(raw.value)
      ? raw.value
      : raw?.data && typeof raw.data === 'object' && !Array.isArray(raw.data)
        ? raw.data
        : raw?.result && typeof raw.result === 'object' && !Array.isArray(raw.result)
          ? raw.result
          : raw;

  const items =
    root?.items ||
    root?.Items ||
    root?.data ||
    root?.Data ||
    root?.result ||
    root?.Result ||
    (Array.isArray(root) ? root : []);

  const totalCount =
    root?.totalCount ??
    root?.TotalCount ??
    root?.total ??
    root?.Total ??
    root?.count ??
    root?.Count ??
    (Array.isArray(items) ? items.length : 0);

  const pageNumber =
    root?.pageNumber ??
    root?.PageNumber ??
    root?.currentPage ??
    root?.CurrentPage ??
    root?.page ??
    root?.Page ??
    1;

  const pageSize =
    root?.pageSize ??
    root?.PageSize ??
    (Array.isArray(items) ? items.length : 0);

  const totalPages =
    root?.totalPages ??
    root?.TotalPages ??
    (pageSize ? Math.max(1, Math.ceil(Number(totalCount || 0) / Number(pageSize || 1))) : 1);

  const normalizedItems = (Array.isArray(items) ? items : [])
    .map(normalizeLevelRecord)
    .filter(isVisibleLevelRecord);

  return {
    raw: {
      ...raw,
      items: normalizedItems,
      Items: normalizedItems,
    },
    items: normalizedItems,
    totalCount: normalizedItems.length,
    pageNumber: Number(pageNumber) || 1,
    pageSize: Number(pageSize) || 0,
    totalPages:
      pageSize && normalizedItems.length
        ? Math.max(1, Math.ceil(normalizedItems.length / Number(pageSize || 1)))
        : Number(totalPages) || 1,
  };
};

export const normalizeLevelDetailsResponse = (responseData) => {
  if (!responseData || typeof responseData !== 'object') {
    return responseData ?? null;
  }

  if (responseData.value && typeof responseData.value === 'object' && !Array.isArray(responseData.value)) {
    return responseData.value;
  }

  if (responseData.data && typeof responseData.data === 'object' && !Array.isArray(responseData.data)) {
    return responseData.data;
  }

  if (responseData.result && typeof responseData.result === 'object' && !Array.isArray(responseData.result)) {
    return responseData.result;
  }

  return normalizeLevelRecord(responseData);
};

export const levelsService = {
  async getLevels({ pageNumber = 1, pageSize = 10 } = {}) {
    const response = await axiosClient.get(
      `${LEVELS_ENDPOINT}?PageNumber=${pageNumber}&PageSize=${pageSize}`
    );
    const normalized = normalizeLevelsListResponse(response.data);
    console.log('LEVELS LIST RESPONSE:', normalized);
    return normalized;
  },

  async getLevelById(id) {
    const response = await axiosClient.get(`${LEVELS_ENDPOINT}/${id}`);
    const normalized = normalizeLevelDetailsResponse(response.data);
    console.log('LEVEL DETAILS RESPONSE:', normalized);
    return normalized;
  },

  async createLevel(payload) {
    const response = await axiosClient.post(LEVELS_ENDPOINT, payload);
    console.log('CREATE LEVEL RESPONSE:', response.data);
    return response.data;
  },

  async updateLevel(id, payload) {
    const response = await axiosClient.put(`${LEVELS_ENDPOINT}/${id}`, payload);
    console.log('UPDATE LEVEL RESPONSE:', response.data);
    return response.data;
  },

  async deleteLevel(id) {
    const response = await axiosClient.delete(`${LEVELS_ENDPOINT}/${id}`);
    console.log('DELETE LEVEL RESPONSE:', response.data);
    return response.data;
  },
};

export default levelsService;
