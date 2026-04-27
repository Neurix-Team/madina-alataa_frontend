class ThemeService {
  static #instance = null;
  #theme = 'light';
  #listeners = new Set();

  static getInstance() {
    if (!ThemeService.#instance) ThemeService.#instance = new ThemeService();
    return ThemeService.#instance;
  }

  constructor() {
    if (ThemeService.#instance) throw new Error('Use getInstance()');
    const saved = (() => { try { return localStorage.getItem('madina_theme'); } catch { return null; } })();
    this.#theme = saved === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.#theme);
  }

  get theme() { return this.#theme; }
  get isDark() { return this.#theme === 'dark'; }

  toggle() {
    this.#theme = this.#theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.#theme);
    try { localStorage.setItem('madina_theme', this.#theme); } catch { /* silent */ }
    this.#listeners.forEach((fn) => fn(this.#theme));
  }

  subscribe(fn) {
    this.#listeners.add(fn);
    return () => this.#listeners.delete(fn);
  }
}

export default ThemeService;
