
/**
 * @typedef {{ id:string, questId:string, placeName:string, lat:number, lng:number, radius:number }} GeoTarget
 * @typedef {{ lat:number, lng:number, accuracy:number }} UserPosition
 */

class GeoQuestService {
  static #instance = null;

  /** @type {number|null} watchId from navigator.geolocation */
  #watchId = null;

  /** @type {UserPosition|null} */
  #position = null;

  /** @type {Set<string>} quest IDs already unlocked this session */
  #unlockedThisSession = new Set();

  /** @type {((pos: UserPosition|null) => void)[]} */
  #listeners = [];

  static getInstance() {
    if (!GeoQuestService.#instance) {
      GeoQuestService.#instance = new GeoQuestService();
    }
    return GeoQuestService.#instance;
  }

  constructor() {
    if (GeoQuestService.#instance) throw new Error('Use getInstance()');
  }

  // ── Private ───────────────────────────────────────────────────────────────

  /**
   * Haversine distance in meters between two coordinates.
   * @param {number} lat1 @param {number} lng1 @param {number} lat2 @param {number} lng2
   * @returns {number}
   */
  static #haversine(lat1, lng1, lat2, lng2) {
    const R   = 6_371_000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  #emit() {
    this.#listeners.forEach((fn) => fn(this.#position));
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** @returns {boolean} */
  get isSupported() {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
  }

  /** @returns {UserPosition|null} */
  get position() { return this.#position; }

  /** @returns {boolean} */
  get isWatching() { return this.#watchId !== null; }

  /**
   * Start watching position.
   * @param {(pos: UserPosition|null) => void} [onUpdate]
   * @returns {Promise<void>}
   */
  start(onUpdate) {
    if (!this.isSupported) return Promise.reject(new Error('Geolocation not supported'));
    if (onUpdate) this.#listeners.push(onUpdate);

    return new Promise((resolve, reject) => {
      this.#watchId = navigator.geolocation.watchPosition(
        (pos) => {
          this.#position = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
          this.#emit();
          resolve();
        },
        (err) => {
          this.#emit();
          reject(err);
        },
        { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
      );
    });
  }

  /** Stop watching. */
  stop() {
    if (this.#watchId !== null) {
      navigator.geolocation.clearWatch(this.#watchId);
      this.#watchId = null;
    }
    this.#listeners = [];
  }

  /**
   * Check which geo-quests are now unlockable.
   * @param {GeoTarget[]} targets
   * @returns {GeoTarget[]} newly unlocked targets
   */
  checkProximity(targets) {
    if (!this.#position) return [];
    const unlocked = [];
    targets.forEach((target) => {
      if (this.#unlockedThisSession.has(target.questId)) return;
      const dist = GeoQuestService.#haversine(
        this.#position.lat, this.#position.lng,
        target.lat, target.lng,
      );
      if (dist <= target.radius) {
        this.#unlockedThisSession.add(target.questId);
        unlocked.push({ ...target, distance: Math.round(dist) });
      }
    });
    return unlocked;
  }

  /**
   * Get distance in meters to a target. Returns null if no position.
   * @param {GeoTarget} target
   * @returns {number|null}
   */
  distanceTo(target) {
    if (!this.#position) return null;
    return Math.round(
      GeoQuestService.#haversine(this.#position.lat, this.#position.lng, target.lat, target.lng),
    );
  }

  reset() {
    this.stop();
    this.#position = null;
    this.#unlockedThisSession.clear();
  }

  // ── Static helpers (used by UI components) ────────────────────────────────

  /**
   * Format a distance in meters to a human-readable Arabic string.
   * @param {number} meters
   * @returns {string}
   */
  static formatDistance(meters) {
    if (meters == null || isNaN(meters)) return '—';
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} كم`;
    return `${Math.round(meters)} م`;
  }

  /**
   * Verify whether the user is currently within the quest's radius.
   * Uses the browser Geolocation API.
   * @param {{ lat:number, lng:number, radiusM:number, radius:number }} quest
   * @returns {Promise<{ success:boolean, distance:number|null, error:string|null }>}
   */
  static verifyQuestLocation(quest) {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
        resolve({ success: false, distance: null, error: 'GPS غير مدعوم في هذا الجهاز' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const R       = 6_371_000;
          const dLat    = ((quest.lat - userLat) * Math.PI) / 180;
          const dLng    = ((quest.lng - userLng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((userLat * Math.PI) / 180) *
              Math.cos((quest.lat * Math.PI) / 180) *
              Math.sin(dLng / 2) ** 2;
          const distance = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
          const required = quest.radiusM ?? quest.radius ?? 300;
          resolve({ success: distance <= required, distance, error: null });
        },
        (err) => {
          const msg =
            err.code === 1 ? 'يرجى السماح بالوصول إلى موقعك' :
            err.code === 2 ? 'تعذّر تحديد موقعك، حاول مرة أخرى' :
                             'انتهت مهلة GPS، حاول مرة أخرى';
          resolve({ success: false, distance: null, error: msg });
        },
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 10_000 },
      );
    });
  }
}

export default GeoQuestService;
