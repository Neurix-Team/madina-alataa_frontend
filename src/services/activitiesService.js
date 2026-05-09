import { axiosClient } from './axiosClient';

const ACTIVITIES_ENDPOINT = '/api/Activities';
const LOCAL_ACTIVITIES_STORAGE_KEY = 'madina.activities.local-fallback';

const readLocalActivities = () => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_ACTIVITIES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeActivityRecord) : [];
  } catch (error) {
    console.warn('LOCAL ACTIVITIES READ ERROR:', error);
    return [];
  }
};

const writeLocalActivities = (items) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    LOCAL_ACTIVITIES_STORAGE_KEY,
    JSON.stringify((Array.isArray(items) ? items : []).map(normalizeActivityRecord))
  );
};

const isNotFoundError = (error) => error?.response?.status === 404;

const buildLocalActivity = (payload) => ({
  id:
    (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
      ? crypto.randomUUID()
      : `activity-${Date.now()}`,
  name: payload?.name ?? '',
  description: payload?.description ?? '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  source: 'local-fallback',
});

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
      if (isNotFoundError(error)) {
        const fallbackItems = readLocalActivities().filter(isVisibleActivityRecord);
        const normalized = {
          raw: { items: fallbackItems },
          items: fallbackItems,
          totalCount: fallbackItems.length,
        };
        console.warn('ACTIVITIES ENDPOINT NOT FOUND, USING LOCAL FALLBACK:', normalized);
        return normalized;
      }

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
    try {
      const response = await axiosClient.get(`${ACTIVITIES_ENDPOINT}/${id}`);
      const normalized = normalizeActivityDetailsResponse(response.data);
      console.log('ACTIVITY DETAILS RESPONSE:', normalized);
      return normalized;
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }

      const fallbackItem = readLocalActivities().find((activity) => String(activity.id) === String(id));
      const normalized = normalizeActivityDetailsResponse(fallbackItem);
      console.warn('ACTIVITY DETAILS FALLBACK RESPONSE:', normalized);
      return normalized;
    }
  },

  async getActivitiesByEntityId(entityId, pageNumber = 1, pageSize = 10) {
    try {
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
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }

      const fallbackItems = readLocalActivities().filter((item) =>
        [item.entityId, item.activityId, item.id].some((value) => String(value || '') === String(entityId))
      );
      const normalized = {
        raw: { items: fallbackItems },
        items: fallbackItems,
        totalCount: fallbackItems.length,
      };
      console.warn('ACTIVITY ENTITY HISTORY FALLBACK RESPONSE:', normalized);
      return normalized;
    }
  },

  async createActivity(payload) {
    try {
      const response = await axiosClient.post(ACTIVITIES_ENDPOINT, payload);
      console.log('CREATE ACTIVITY RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }

      const nextItem = buildLocalActivity(payload);
      writeLocalActivities([nextItem, ...readLocalActivities()]);
      console.warn('CREATE ACTIVITY FALLBACK RESPONSE:', nextItem);
      return nextItem;
    }
  },

  async updateActivity(id, payload) {
    try {
      const response = await axiosClient.put(`${ACTIVITIES_ENDPOINT}/${id}`, payload);
      console.log('UPDATE ACTIVITY RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }

      const nextItems = readLocalActivities().map((activity) =>
        String(activity.id) === String(id)
          ? { ...activity, ...payload, updatedAt: new Date().toISOString() }
          : activity
      );
      writeLocalActivities(nextItems);
      const updatedItem = nextItems.find((activity) => String(activity.id) === String(id)) || null;
      console.warn('UPDATE ACTIVITY FALLBACK RESPONSE:', updatedItem);
      return updatedItem;
    }
  },

  async deleteActivity(id) {
    try {
      const response = await axiosClient.delete(`${ACTIVITIES_ENDPOINT}/${id}`);
      console.log('DELETE ACTIVITY RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      if (!isNotFoundError(error)) {
        throw error;
      }

      const nextItems = readLocalActivities().filter((activity) => String(activity.id) !== String(id));
      writeLocalActivities(nextItems);
      console.warn('DELETE ACTIVITY FALLBACK RESPONSE:', { id, deleted: true });
      return { id, deleted: true };
    }
  },
};

export default activitiesService;
