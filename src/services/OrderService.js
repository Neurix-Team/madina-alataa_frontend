// src/services/OrderService.js
/**
 * OrderService — Pure stateless service for creating and managing Domain Orders.
 *
 * Domain Order Types:
 *  • VolunteerOrder  — created when an Actor (Volunteer/User) completes a quest
 *  • DonationOrder   — created when an Actor (Donor) makes a donation
 *  • ServiceRequest  — created by a Beneficiary requesting help (seeded in ordersData.js)
 */

class OrderService {
  // ── Factories ─────────────────────────────────────────────────────────────

  /**
   * Create a VolunteerOrder when a user completes a quest.
   * Relationship: Actor → creates → VolunteerOrder → serves → Beneficiary
   *
   * @param {string} userId
   * @param {string} questId
   * @param {string|null} beneficiaryId
   * @param {{ kp:number, xp:number, impact:number }} reward
   * @returns {VolunteerOrder}
   */
  static createVolunteerOrder(userId, questId, beneficiaryId = null, reward = {}) {
    return {
      id:            `vo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type:          'VolunteerOrder',
      userId,
      questId,
      beneficiaryId,
      reward:        { kp: reward.kp ?? 0, xp: reward.xp ?? 0, impact: reward.impact ?? 0 },
      status:        'completed',
      createdAt:     new Date().toISOString(),
    };
  }

  /**
   * Create a DonationOrder when a user donates KP/money.
   * Relationship: Actor → creates → DonationOrder → serves → Beneficiary
   *
   * @param {string} userId
   * @param {number} amount
   * @param {string|null} beneficiaryId
   * @returns {DonationOrder}
   */
  static createDonationOrder(userId, amount, beneficiaryId = null) {
    return {
      id:            `do_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type:          'DonationOrder',
      userId,
      amount,
      beneficiaryId,
      kpConverted:   Math.floor(amount / 10),
      status:        'completed',
      createdAt:     new Date().toISOString(),
    };
  }

  /**
   * Create a ServiceRequest from a Beneficiary.
   * Relationship: Beneficiary → creates → ServiceRequest
   *
   * @param {string} beneficiaryId
   * @param {string} title
   * @param {string} description
   * @param {'low'|'medium'|'high'|'critical'} urgency
   * @param {number} requiredVolunteers
   * @returns {ServiceRequest}
   */
  static createServiceRequest(beneficiaryId, title, description, urgency = 'medium', requiredVolunteers = 1) {
    return {
      id:                 `sr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type:               'ServiceRequest',
      beneficiaryId,
      title,
      description,
      urgency,
      requiredVolunteers,
      currentVolunteers:  0,
      status:             'open',
      questId:            null,
      createdAt:          new Date().toISOString(),
    };
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  /** Filter orders by type */
  static filterByType(orders, type) {
    return orders.filter((o) => o.type === type);
  }

  /** Get all orders for a specific beneficiary */
  static getOrdersForBeneficiary(orders, beneficiaryId) {
    return orders.filter((o) => o.beneficiaryId === beneficiaryId);
  }

  /** Count completed volunteer orders */
  static countVolunteerOrders(orders) {
    return orders.filter((o) => o.type === 'VolunteerOrder').length;
  }

  /** Sum total donated amount */
  static totalDonated(orders) {
    return orders
      .filter((o) => o.type === 'DonationOrder')
      .reduce((sum, o) => sum + (o.amount ?? 0), 0);
  }

  /** Count open service requests */
  static countOpenRequests(orders) {
    return orders.filter((o) => o.type === 'ServiceRequest' && o.status === 'open').length;
  }

  /**
   * Fulfill a ServiceRequest — increment currentVolunteers,
   * mark as completed if requiredVolunteers reached.
   * Returns a new order object (immutable).
   *
   * @param {ServiceRequest} request
   * @returns {ServiceRequest}
   */
  static fulfillServiceRequest(request) {
    const next = { ...request, currentVolunteers: request.currentVolunteers + 1 };
    if (next.currentVolunteers >= next.requiredVolunteers) {
      next.status = 'completed';
    } else {
      next.status = 'in_progress';
    }
    return next;
  }

  // ── Urgency Helpers ───────────────────────────────────────────────────────

  static urgencyLabel(urgency) {
    const map = {
      low:      { label: 'منخفض',  color: '#16a34a', bg: '#dcfce7' },
      medium:   { label: 'متوسط',  color: '#d97706', bg: '#fef9c3' },
      high:     { label: 'عالي',   color: '#dc2626', bg: '#fee2e2' },
      critical: { label: 'حرج',    color: '#7c3aed', bg: '#ede9fe' },
    };
    return map[urgency] ?? map.medium;
  }

  static statusLabel(status) {
    const map = {
      open:        { label: 'مفتوح',       color: '#2563eb', bg: '#eff6ff' },
      in_progress: { label: 'جاري',        color: '#d97706', bg: '#fef9c3' },
      completed:   { label: 'مكتمل',       color: '#16a34a', bg: '#dcfce7' },
      cancelled:   { label: 'ملغي',        color: '#6b7280', bg: '#f3f4f6' },
    };
    return map[status] ?? map.open;
  }
}

export default OrderService;
