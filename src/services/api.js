// src/services/api.js

const API_BASE_URL = '/api'

export const api = {
  // Users
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`)
    if (!response.ok) throw new Error('Failed to fetch users')
    return response.json()
  },

  getUser: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`)
    if (!response.ok) throw new Error('Failed to fetch user')
    return response.json()
  },

  // Cases
  getCases: async () => {
    const response = await fetch(`${API_BASE_URL}/cases`)
    if (!response.ok) throw new Error('Failed to fetch cases')
    return response.json()
  },

  getCase: async (id) => {
    const response = await fetch(`${API_BASE_URL}/cases/${id}`)
    if (!response.ok) throw new Error('Failed to fetch case')
    return response.json()
  },

  // Donations
  getDonations: async () => {
    const response = await fetch(`${API_BASE_URL}/donations`)
    if (!response.ok) throw new Error('Failed to fetch donations')
    return response.json()
  },

  getDonation: async (id) => {
    const response = await fetch(`${API_BASE_URL}/donations/${id}`)
    if (!response.ok) throw new Error('Failed to fetch donation')
    return response.json()
  },

  // Notifications
  getNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`)
    if (!response.ok) throw new Error('Failed to fetch notifications')
    return response.json()
  },

  getNotification: async (id) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`)
    if (!response.ok) throw new Error('Failed to fetch notification')
    return response.json()
  },
}