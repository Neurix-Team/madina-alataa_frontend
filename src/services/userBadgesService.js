import { axiosClient } from './axiosClient';

const USER_BADGES_ENDPOINT = '/api/UserBadges';

const pickArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.value)) return payload.value;
  if (Array.isArray(payload?.payload)) return payload.payload;
  if (Array.isArray(payload?.badges)) return payload.badges;
  if (Array.isArray(payload?.userBadges)) return payload.userBadges;
  return [];
};

export const normalizeBadgeItem = (badge) => {
  if (!badge || typeof badge !== 'object') return badge;

  return {
    ...badge,
    id:
      badge.id ??
      badge.Id ??
      badge.badgeId ??
      badge.BadgeId ??
      badge.userBadgeId ??
      badge.UserBadgeId ??
      badge.guid ??
      badge.Guid ??
      '',
    badgeId:
      badge.badgeId ??
      badge.BadgeId ??
      badge.id ??
      badge.Id ??
      badge.userBadgeId ??
      badge.UserBadgeId ??
      '',
    name: badge.name ?? badge.Name ?? badge.badgeName ?? badge.BadgeName ?? badge.title ?? badge.Title ?? 'Badge',
    description: badge.description ?? badge.Description ?? badge.details ?? badge.Details ?? '',
    imageUrl: badge.imageUrl ?? badge.ImageUrl ?? badge.iconUrl ?? badge.IconUrl ?? badge.badgeIconUrl ?? badge.BadgeIconUrl ?? badge.icon ?? badge.Icon ?? '',
    earnedAt: badge.earnedAt ?? badge.EarnedAt ?? badge.createdAt ?? badge.CreatedAt ?? '',
    category: badge.category ?? badge.Category ?? badge.badgeCategory ?? badge.BadgeCategory ?? '',
    raw: badge,
  };
};

const normalizeBadgeListResponse = (payload) => {
  const items = pickArray(payload).map(normalizeBadgeItem);

  return {
    raw: payload,
    items,
  };
};

export const userBadgesService = {
  async getMyBadges() {
    try {
      const response = await axiosClient.get(USER_BADGES_ENDPOINT);
      return normalizeBadgeListResponse(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn('My badges not found (404), returning empty list.');
        return normalizeBadgeListResponse([]);
      }
      throw error;
    }
  },

  async getUserBadgesByProfileId(userId) {
    try {
      const response = await axiosClient.get(`${USER_BADGES_ENDPOINT}/profile/${userId}`);
      return normalizeBadgeListResponse(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`Badges not found for user ${userId} (404), returning empty list.`);
        return normalizeBadgeListResponse([]);
      }
      throw error;
    }
  },

  async getBadgeDetails(badgeId) {
    try {
      const response = await axiosClient.get(`${USER_BADGES_ENDPOINT}/${badgeId}`);
      return {
        raw: response.data,
        item: normalizeBadgeItem(
          response.data?.item ||
            response.data?.data ||
            response.data?.result ||
            response.data?.value ||
            response.data
        ),
      };
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`Badge details not found for ID ${badgeId} (404).`);
        return {
          raw: null,
          item: null,
        };
      }
      throw error;
    }
  },
};

export default userBadgesService;
