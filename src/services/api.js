import { users } from '../mocks/data/users.js'
import { cases } from '../mocks/data/cases.js'
import { donations } from '../mocks/data/donations.js'
import { notifications } from '../mocks/data/notifications.js'

const API_BASE_URL = '/api'

const safeFetchJson = async (url, fallbackData, errorMessage) => {
  try {
    const response = await fetch(url)
    const contentType = response.headers.get('content-type') || ''

    if (!response.ok || !contentType.includes('application/json')) {
      return fallbackData
    }

    return await response.json()
  } catch {
    return fallbackData
  }
}

export const api = {
  getUsers: async () => safeFetchJson(`${API_BASE_URL}/users`, users, 'Failed to fetch users'),

  getUser: async (id) => {
    const data = await safeFetchJson(`${API_BASE_URL}/users/${id}`, null, 'Failed to fetch user')
    if (data) return data
    return users.find((u) => String(u.id) === String(id)) || null
  },

  getCases: async () => safeFetchJson(`${API_BASE_URL}/cases`, cases, 'Failed to fetch cases'),

  getCase: async (id) => {
    const data = await safeFetchJson(`${API_BASE_URL}/cases/${id}`, null, 'Failed to fetch case')
    if (data) return data
    return cases.find((c) => String(c.id) === String(id)) || null
  },

  getDonations: async () => safeFetchJson(`${API_BASE_URL}/donations`, donations, 'Failed to fetch donations'),

  getDonation: async (id) => {
    const data = await safeFetchJson(`${API_BASE_URL}/donations/${id}`, null, 'Failed to fetch donation')
    if (data) return data
    return donations.find((d) => String(d.id) === String(id)) || null
  },

  getNotifications: async () =>
    safeFetchJson(`${API_BASE_URL}/notifications`, notifications, 'Failed to fetch notifications'),

  getNotification: async (id) => {
    const data = await safeFetchJson(`${API_BASE_URL}/notifications/${id}`, null, 'Failed to fetch notification')
    if (data) return data
    return notifications.find((n) => String(n.id) === String(id)) || null
  },
}
