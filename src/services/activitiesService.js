import { axiosClient } from './axiosClient';

const ACTIVITIES_ENDPOINT = '/api/Activities';

const normalizeActivityRecord = (activity) => {
  if (!activity || typeof activity !== 'object') return activity;

  return {
    ...activity,
    id: activity?.id ?? activity?.Id ?? activity?.activityId ?? activity?.ActivityId ?? activity?.guid ?? activity?.Guid ?? '',
    name: activity?.name ?? activity?.Name ?? '',
    description: activity?.description ?? activity?.Description ?? '',
    isDeleted: activity?.isDeleted ?? activity?.IsDeleted ?? false,
    deleted: activity?.deleted ?? activity?.Deleted ?? false,
    deletedAt: activity?.deletedAt ?? activity?.DeletedAt ?? null,
    status: activity?.status ?? activity?.Status ?? '',
    isActive: activity?.isActive ?? activity?.IsActive,
  };
};

const isVisibleActivityRecord = (activity) => {
  const normalized = normalizeActivityRecord(activity);
  const status = String(normalized?.status || '').toLowerCase();

  if (normalized?.isDeleted === true) return false;
  if (normalized?.deleted === true) return false;
  if (normalized?.deletedAt) return false;
  if (status === 'deleted' || status === 'inactive' || status === 'archived') return false;
  if (normalized?.isActive === false) return false;

  return true;
};

export const normalizeActivitiesListResponse = (responseData) => {
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

  const normalizedItems = (Array.isArray(items) ? items : [])
    .map(normalizeActivityRecord)
    .filter(isVisibleActivityRecord);

  return {
    raw: {
      ...raw,
      items: normalizedItems,
      Items: normalizedItems,
    },
    items: normalizedItems,
    totalCount: normalizedItems.length,
  };
};

export const normalizeActivityDetailsResponse = (responseData) => {
  if (!responseData || typeof responseData !== 'object') {
    return responseData ?? null;
  }

  if (responseData.value && typeof responseData.value === 'object' && !Array.isArray(responseData.value)) {
    return normalizeActivityRecord(responseData.value);
  }

  if (responseData.data && typeof responseData.data === 'object' && !Array.isArray(responseData.data)) {
    return normalizeActivityRecord(responseData.data);
  }

  if (responseData.result && typeof responseData.result === 'object' && !Array.isArray(responseData.result)) {
    return normalizeActivityRecord(responseData.result);
  }

  return normalizeActivityRecord(responseData);
};

export const activitiesService = {
  async getActivities() {
    try {
      const response = await axiosClient.get(ACTIVITIES_ENDPOINT);
      const normalized = normalizeActivitiesListResponse(response.data);
      console.log('ACTIVITIES LIST RESPONSE:', normalized);
      return normalized;
    } catch (error) {
      if (error?.response?.status !== 400) {
        throw error;
      }

      console.warn('ACTIVITIES LIST BASE REQUEST FAILED, retrying with pagination params:', {
        status: error?.response?.status,
        data: error?.response?.data,
      });

      const fallbackResponse = await axiosClient.get(
        `${ACTIVITIES_ENDPOINT}?PageNumber=1&PageSize=100`
      );
      const normalized = normalizeActivitiesListResponse(fallbackResponse.data);
      console.log('ACTIVITIES LIST RESPONSE:', normalized);
      return normalized;
    }
  },

  async getActivityById(id) {
    const response = await axiosClient.get(`${ACTIVITIES_ENDPOINT}/${id}`);
    const normalized = normalizeActivityDetailsResponse(response.data);
    console.log('ACTIVITY DETAILS RESPONSE:', normalized);
    return normalized;
  },

  async getActivitiesByEntityId(entityId, pageNumber = 1, pageSize = 10) {
    const response = await axiosClient.get(
      `${ACTIVITIES_ENDPOINT}/entity/${entityId}`,
      {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        }
      }
    );
    const normalized = normalizeActivitiesListResponse(response.data);
    console.log('ACTIVITY ENTITY HISTORY RAW RESPONSE:', normalized.raw);
    console.log('ACTIVITY ENTITY HISTORY ITEMS:', normalized.items);
    return normalized;
  },

  async createActivity(payload) {
    const response = await axiosClient.post(ACTIVITIES_ENDPOINT, payload);
    console.log('CREATE ACTIVITY RESPONSE:', response.data);
    return response.data;
  },

  async updateActivity(id, payload) {
    const response = await axiosClient.put(`${ACTIVITIES_ENDPOINT}/${id}`, payload);
    console.log('UPDATE ACTIVITY RESPONSE:', response.data);
    return response.data;
  },

  async deleteActivity(id) {
    const response = await axiosClient.delete(`${ACTIVITIES_ENDPOINT}/${id}`);
    console.log('DELETE ACTIVITY RESPONSE:', response.data);
    return response.data;
  },
};

export default activitiesService;
