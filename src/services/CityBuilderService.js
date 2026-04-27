// src/services/CityBuilderService.js
/**
 * CityBuilderService — Singleton OOP service.
 * Maps completed quest IDs to city building slots.
 * Persists to localStorage.
 */

const STORAGE_KEY = 'madina_city_v1';

const DEFINITIONS = [
  // Static (always visible)
  { id:'road_main', questId:null, type:'road',     label:'الشارع الرئيسي', x:0,   y:200, w:800, h:28,  color:'#94a3b8', emoji:'' },
  { id:'sidewalk',  questId:null, type:'road',     label:'الرصيف',          x:0,   y:185, w:800, h:15,  color:'#e2e8f0', emoji:'' },
  { id:'bmos',      questId:null, type:'mosque',   label:'مسجد المدينة',   x:515, y:20,  w:100, h:80,  color:'#c4b5fd', emoji:'🕌' },

  // Quest-unlocked — Row 1
  { id:'bq1',  questId:'q1',  type:'house',    label:'بيت فاطمة',      x:30,  y:120, w:80,  h:80,  color:'#fca5a5', emoji:'🏠' },
  { id:'bq2',  questId:'q2',  type:'park',     label:'حديقة الأجداد', x:130, y:130, w:75,  h:65,  color:'#86efac', emoji:'🌳' },
  { id:'bq3',  questId:'q3',  type:'shop',     label:'مقهى حسن',      x:220, y:125, w:70,  h:75,  color:'#fdba74', emoji:'☕' },
  { id:'bq4',  questId:'q4',  type:'school',   label:'دار البراعم',   x:305, y:110, w:90,  h:90,  color:'#d8b4fe', emoji:'👶' },
  { id:'bq5',  questId:'q5',  type:'school',   label:'مدرسة النور',   x:410, y:108, w:90,  h:92,  color:'#fde68a', emoji:'🏫' },
  { id:'bq6',  questId:'q6',  type:'house',    label:'بيت الدفء',     x:515, y:120, w:75,  h:80,  color:'#93c5fd', emoji:'🏡' },
  { id:'bq7',  questId:'q7',  type:'shop',     label:'المركز المجتمعي',x:605,y:112, w:85,  h:88,  color:'#a5b4fc', emoji:'🧺' },
  { id:'bq8',  questId:'q8',  type:'park',     label:'حديقة الأمل',  x:705, y:125, w:80,  h:70,  color:'#6ee7b7', emoji:'🌻' },

  // Quest-unlocked — Row 2
  { id:'bq9',  questId:'q9',  type:'road',     label:'مسار الأمان',   x:20,  y:50,  w:100, h:30,  color:'#e2e8f0', emoji:'🚶' },
  { id:'bq10', questId:'q10', type:'tree',     label:'شجرة القطة',    x:135, y:40,  w:55,  h:55,  color:'#4ade80', emoji:'🌲' },
  { id:'bq11', questId:'q11', type:'hospital', label:'مستشفى الشفاء', x:205, y:25,  w:105, h:75,  color:'#fca5a5', emoji:'🏥' },
  { id:'bq12', questId:'q12', type:'library',  label:'مكتبة الشارع',  x:325, y:28,  w:90,  h:70,  color:'#7dd3fc', emoji:'📚' },
  { id:'bq13', questId:'q13', type:'fountain', label:'نبع السلام',    x:430, y:35,  w:70,  h:62,  color:'#38bdf8', emoji:'⛲' },
];

class CityBuilderService {
  static #instance = null;
  #slots = new Map();
  #sessionNew = new Set();

  static getInstance() {
    if (!CityBuilderService.#instance) {
      CityBuilderService.#instance = new CityBuilderService();
    }
    return CityBuilderService.#instance;
  }

  constructor() {
    if (CityBuilderService.#instance) throw new Error('Use getInstance()');
    this.#boot();
  }

  #boot() {
    DEFINITIONS.forEach((d) => {
      this.#slots.set(d.id, { ...d, built: d.questId === null });
    });
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (Array.isArray(saved)) {
        saved.forEach((id) => { const s = this.#slots.get(id); if (s) s.built = true; });
      }
    } catch { /* silent */ }
  }

  #persist() {
    try {
      const ids = [...this.#slots.values()].filter((s) => s.built).map((s) => s.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch { /* silent */ }
  }

  /**
   * Sync with latest completedQuestIds. Returns newly built slot or null.
   * @param {Set<string>} completedQuestIds
   * @returns {{ id:string, label:string, emoji:string }|null}
   */
  syncCompleted(completedQuestIds) {
    let newSlot = null;
    this.#slots.forEach((slot) => {
      if (!slot.built && slot.questId && completedQuestIds.has(slot.questId) && !this.#sessionNew.has(slot.id)) {
        slot.built = true;
        this.#sessionNew.add(slot.id);
        newSlot = { ...slot };
      }
    });
    if (newSlot) this.#persist();
    return newSlot;
  }

  getSlots() { return [...this.#slots.values()]; }

  getNewlyUnlockedTiles(questId) {
    const slot = [...this.#slots.values()].find(
      (s) => s.questId === questId && !s.built,
    );
    if (!slot) return [];
    slot.built = true;
    this.#sessionNew.add(slot.id);
    this.#persist();
    return [{ ...slot }];
  }

  getCityProgress() {
    const q = [...this.#slots.values()].filter((s) => s.questId !== null);
    const b = q.filter((s) => s.built).length;
    return q.length ? Math.round((b / q.length) * 100) : 0;
  }

  reset() {
    this.#slots.clear(); this.#sessionNew.clear(); this.#boot();
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* silent */ }
  }
}

export default CityBuilderService;
