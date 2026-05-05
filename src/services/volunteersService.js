import { axiosClient } from './axiosClient';

const VOLUNTEERS_API_URL = '/api/Volunteer';

function getVolunteerId(volunteer) {
  return (
    volunteer?.id ||
    volunteer?.Id ||
    volunteer?.volunteerId ||
    volunteer?.VolunteerId ||
    volunteer?.applicationUserId ||
    volunteer?.ApplicationUserId ||
    volunteer?.userId ||
    volunteer?.UserId ||
    ''
  );
}

function normalizeVolunteer(volunteer) {
  if (!volunteer || typeof volunteer !== 'object') return volunteer;

  return {
    ...volunteer,
    id: getVolunteerId(volunteer),
    fullName:
      volunteer?.fullName ??
      volunteer?.fullname ??
      volunteer?.full_name ??
      volunteer?.FullName ??
      volunteer?.name ??
      volunteer?.userName ??
      volunteer?.username ??
      volunteer?.UserName ??
      volunteer?.Name ??
      '',
    email: volunteer?.email ?? volunteer?.Email ?? '',
    birthDay: volunteer?.birthDay ?? volunteer?.birthDate ?? volunteer?.BirthDay ?? null,
  };
}

function normalizeVolunteerCollection(raw) {
  const root =
    raw?.value && typeof raw.value === 'object'
      ? raw.value
      : raw?.data && typeof raw.data === 'object'
        ? raw.data
        : raw?.result && typeof raw.result === 'object'
          ? raw.result
          : raw;

  const items = Array.isArray(raw)
    ? raw
    : Array.isArray(root?.items)
      ? root.items
      : Array.isArray(root?.data)
        ? root.data
        : Array.isArray(root?.value)
          ? root.value
          : Array.isArray(root?.result)
            ? root.result
            : Array.isArray(root?.data?.items)
              ? root.data.items
              : Array.isArray(raw?.data?.items)
                ? raw.data.items
                : [];

  const pagination =
    root?.pagination ||
    raw?.pagination ||
    root?.data?.pagination ||
    root?.value?.pagination ||
    root?.result?.pagination ||
    {};

  return {
    items: items.map(normalizeVolunteer),
    pagination: {
      currentPage: Number(pagination.currentPage || pagination.pageNumber || 1) || 1,
      totalPages: Number(pagination.totalPages || 1) || 1,
      totalItems: Number(pagination.totalItems || pagination.totalCount || items.length) || items.length,
      pageSize: Number(pagination.pageSize || items.length || 1) || 1,
    },
  };
}

export const volunteersService = {
  async getVolunteers(pageNumber = 1, pageSize = 10) {
    const response = await axiosClient.get(
      `${VOLUNTEERS_API_URL}?PageNumber=${pageNumber}&PageSize=${pageSize}`
    );
    console.log('VOLUNTEERS LIST RAW RESPONSE:', response.data);
    const normalized = normalizeVolunteerCollection(response.data);
    console.log('VOLUNTEERS LIST ITEMS:', normalized.items);
    return normalized;
  },

  async getVolunteerById(id) {
    const response = await axiosClient.get(`${VOLUNTEERS_API_URL}/${id}`);
    console.log('VOLUNTEER DETAILS RAW RESPONSE:', response.data);
    const raw = response.data;
    const normalized = normalizeVolunteer(raw?.value || raw?.data || raw?.result || raw);
    console.log('VOLUNTEER DETAILS ITEM:', normalized);
    return normalized;
  },
};

export default volunteersService;
