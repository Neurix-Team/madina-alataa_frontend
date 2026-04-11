// src/mocks/handlers.js

import { http, HttpResponse, passthrough } from 'msw'
import { users } from './data/users.js'
import { cases } from './data/cases.js'
import { donations } from './data/donations.js'
import { notifications } from './data/notifications.js'

export const handlers = [
  // Users
  http.get('/api/users', () => {
    return HttpResponse.json(users)
  }),

  http.get('/api/users/:id', ({ params }) => {
    const { id } = params
    const user = users.find(u => u.id === id)
    return user ? HttpResponse.json(user) : HttpResponse.json({ error: 'User not found' }, { status: 404 })
  }),

  // Cases
  http.get('/api/cases', () => {
    return HttpResponse.json(cases)
  }),

  http.get('/api/cases/:id', ({ params }) => {
    const { id } = params
    const caseItem = cases.find(c => c.id === id)
    return caseItem ? HttpResponse.json(caseItem) : HttpResponse.json({ error: 'Case not found' }, { status: 404 })
  }),

  // Donations
  http.get('/api/donations', () => {
    return HttpResponse.json(donations)
  }),

  http.get('/api/donations/:id', ({ params }) => {
    const { id } = params
    const donation = donations.find(d => d.id === id)
    return donation ? HttpResponse.json(donation) : HttpResponse.json({ error: 'Donation not found' }, { status: 404 })
  }),

  // Notifications
  http.get('/api/notifications', () => {
    return HttpResponse.json(notifications)
  }),

  http.get('/api/notifications/:id', ({ params }) => {
    const { id } = params
    const notification = notifications.find(n => n.id === id)
    return notification ? HttpResponse.json(notification) : HttpResponse.json({ error: 'Notification not found' }, { status: 404 })
  }),

  // Handle /notifications (if any direct requests)
  http.get('/notifications', () => {
    return HttpResponse.json(notifications)
  }),

  // Passthrough for external APIs like dicebear
  http.get('https://api.dicebear.com/*', () => {
    return passthrough()
  }),
]