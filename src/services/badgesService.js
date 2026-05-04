import { axiosClient } from './axiosClient';

const BADGES_ENDPOINT = '/api/Badges';

export const badgesService = {
  async getBadges({ pageNumber = 1, pageSize = 10 } = {}) {
    const response = await axiosClient.get(
      `${BADGES_ENDPOINT}?PageNumber=${pageNumber}&PageSize=${pageSize}`
    );
    return response.data;
  },

  async getBadgeById(id) {
    const response = await axiosClient.get(`${BADGES_ENDPOINT}/${id}`);
    return response.data;
  },

  async createBadge(payload) {
    const response = await axiosClient.post(BADGES_ENDPOINT, payload);
    return response.data;
  },

  async updateBadge(id, payload) {
    const response = await axiosClient.put(`${BADGES_ENDPOINT}/${id}`, payload);
    return response.data;
  },

  async deleteBadge(id) {
    const response = await axiosClient.delete(`${BADGES_ENDPOINT}/${id}`);
    return response.data;
  },
};

export default badgesService;
