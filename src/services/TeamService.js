// src/services/TeamService.js
/**
 * TeamService — Singleton OOP service.
 * Manages team creation, joining, and shared progress.
 * Uses localStorage to simulate real-time multiplayer.
 *
 * In a production app you would replace localStorage
 * with WebSockets / a real backend, but the API surface stays identical.
 */

/**
 * @typedef {{ id:string, name:string, avatar:string }} TeamMember
 * @typedef {{ teamId:string, name:string, members:TeamMember[], progress:Record<string,boolean>, createdAt:number }} Team
 */

const STORAGE_PREFIX  = 'madina_team_';
const MY_TEAM_KEY     = 'madina_my_team';
const ALL_TEAMS_KEY   = 'madina_all_teams';

class TeamService {
  static #instance = null;

  /** @type {string|null} current team ID this player belongs to */
  #myTeamId = null;

  static getInstance() {
    if (!TeamService.#instance) {
      TeamService.#instance = new TeamService();
    }
    return TeamService.#instance;
  }

  constructor() {
    if (TeamService.#instance) throw new Error('Use getInstance()');
    try { this.#myTeamId = localStorage.getItem(MY_TEAM_KEY); } catch { /* silent */ }
  }

  // ── Private ───────────────────────────────────────────────────────────────

  static #genId() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  /** @param {string} teamId @returns {Team|null} */
  #readTeam(teamId) {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${teamId}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  /** @param {Team} team */
  #writeTeam(team) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${team.teamId}`, JSON.stringify(team));
      // Keep a global index of all team IDs
      const ids = this.#readAllIds();
      if (!ids.includes(team.teamId)) {
        ids.push(team.teamId);
        localStorage.setItem(ALL_TEAMS_KEY, JSON.stringify(ids));
      }
    } catch { /* silent */ }
  }

  /** @returns {string[]} */
  #readAllIds() {
    try {
      const raw = localStorage.getItem(ALL_TEAMS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  #saveMyTeamId(id) {
    this.#myTeamId = id;
    try { localStorage.setItem(MY_TEAM_KEY, id ?? ''); } catch { /* silent */ }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** @returns {string|null} */
  get myTeamId() { return this.#myTeamId; }

  /** @returns {Team|null} */
  getMyTeam() {
    return this.#myTeamId ? this.#readTeam(this.#myTeamId) : null;
  }

  /**
   * Mark a team quest as done by this member.
   * @param {{ teamId:string, memberId:string, teamQuestId:string }} opts
   * @returns {Team|null}
   */
  markProgress({ teamId, memberId, teamQuestId }) {
    const team = this.#readTeam(teamId);
    if (!team) return null;
    team.progress[`${teamQuestId}_${memberId}`] = true;
    this.#writeTeam(team);
    return { ...team };
  }

  /**
   * Count how many members completed a specific team quest.
   * @param {Team} team @param {string} teamQuestId @param {number} required
   * @returns {{ count:number, complete:boolean }}
   */
  questProgress(team, teamQuestId, required) {
    const count = team.members.filter(
      (m) => team.progress[`${teamQuestId}_${m.id}`],
    ).length;
    return { count, complete: count >= required };
  }

  leaveTeam() {
    this.#saveMyTeamId(null);
  }

  reset() {
    this.leaveTeam();
  }

  // ── Extra public API (used by TeamChallengesTab) ──────────────────────────

  /**
   * Get all teams stored in localStorage.
   * @returns {Team[]}
   */
  getAllTeams() {
    return this.#readAllIds()
      .map((id) => this.#readTeam(id))
      .filter(Boolean);
  }

  /**
   * Return the team's ID as the invite code (already uppercase 6-char).
   * @param {string} teamId
   * @returns {string}
   */
  getInviteCode(teamId) {
    return (teamId ?? '').toUpperCase();
  }

  /**
   * Find a team by its invite code (= teamId).
   * @param {string} code
   * @returns {Team|null}
   */
  findByInviteCode(code) {
    return this.#readTeam((code ?? '').toUpperCase());
  }

  /**
   * Calculate team progress across all quests.
   * Returns { completed, total, percent }.
   * @param {Team} team
   * @returns {{ completed:number, total:number, percent:number }}
   */
  getTeamProgress(team) {
    if (!team) return { completed: 0, total: 0, percent: 0 };
    const keys     = Object.keys(team.progress ?? {});
    const completed = keys.filter((k) => team.progress[k]).length;
    const total     = Math.max(completed, team.members?.length ?? 1);
    return { completed, total, percent: total ? Math.round((completed / total) * 100) : 0 };
  }

  /**
   * Create a new team with the given challengeId, teamName, and first member.
   * Overloaded to accept either:
   *   createTeam(challengeId, teamName, member)   ← new signature used by UI
   *   createTeam({ teamName, member })             ← original object signature
   * @returns {Team}
   */
  createTeam(challengeIdOrOpts, teamName, member) {
    let challengeId, tName, tMember;
    if (typeof challengeIdOrOpts === 'object' && challengeIdOrOpts !== null) {
      // Original signature: createTeam({ teamName, member })
      ({ teamName: tName, member: tMember } = challengeIdOrOpts);
      challengeId = null;
    } else {
      challengeId = challengeIdOrOpts;
      tName       = teamName;
      tMember     = member;
    }

    const team = {
      teamId:      TeamService.#genId(),
      challengeId: challengeId ?? null,
      name:        tName,
      members:     [{ ...tMember, isLeader: true, kp: tMember.kp ?? 0 }],
      progress:    {},
      completed:   false,
      createdAt:   Date.now(),
    };
    this.#writeTeam(team);
    this.#saveMyTeamId(team.teamId);
    return { ...team };
  }

  /**
   * Join an existing team.
   * Overloaded to accept either:
   *   joinTeam(teamId, member)          ← new signature used by UI
   *   joinTeam({ teamId, member })      ← original object signature
   * @returns {{ ok:boolean, success:boolean, team:Team|null, error:string|null }}
   */
  joinTeam(teamIdOrOpts, member) {
    let teamId, tMember;
    if (typeof teamIdOrOpts === 'object' && teamIdOrOpts !== null) {
      ({ teamId, member: tMember } = teamIdOrOpts);
    } else {
      teamId  = teamIdOrOpts;
      tMember = member;
    }

    const team = this.#readTeam((teamId ?? '').toUpperCase());
    if (!team) return { ok: false, success: false, team: null, error: 'كود الفريق غير صحيح!' };
    if (team.members.find((m) => m.id === tMember?.id || m.name === tMember?.name)) {
      this.#saveMyTeamId(team.teamId);
      return { ok: true, success: true, team: { ...team }, error: null };
    }
    if (team.members.length >= 5) return { ok: false, success: false, team: null, error: 'الفريق ممتلئ (5 أعضاء)' };
    team.members.push({ ...tMember, isLeader: false, kp: tMember?.kp ?? 0 });
    this.#writeTeam(team);
    this.#saveMyTeamId(team.teamId);
    return { ok: true, success: true, team: { ...team }, error: null };
  }
}

export default TeamService;
