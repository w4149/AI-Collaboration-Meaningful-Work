// Centralized task time configuration.
// Adjust min/max durations per group here — all timers, auto-submit
// logic, and on-screen instruction text are driven from this file.
//
// submitMinMinutes   — minimum minutes before manual Submit is allowed
// autoSubmitMinutes  — maximum minutes before auto-submit triggers
// phase2SubmitMinMinutes  — G3 Phase 2 min submit (defaults to submitMinMinutes)
// phase2AutoSubmitMinutes — G3 Phase 2 max time (defaults to autoSubmitMinutes)

export type GroupTimeConfig = {
  submitMinMinutes: number
  autoSubmitMinutes: number
  phase2SubmitMinMinutes?: number
  phase2AutoSubmitMinutes?: number
}

export const GROUP_TIME_CONFIG: Record<string, GroupTimeConfig> = {
  'G1-Human': {
    submitMinMinutes: 10,
    autoSubmitMinutes: 10,
  },
  'G2-AI': {
    submitMinMinutes: 5,
    autoSubmitMinutes: 10,
  },
  'G3-HumanAndAI': {
    submitMinMinutes: 5,
    autoSubmitMinutes: 10,
    phase2SubmitMinMinutes: 5,
    phase2AutoSubmitMinutes: 10,
  },
}

const DEFAULT_CONFIG: GroupTimeConfig = {
  submitMinMinutes: 5,
  autoSubmitMinutes: 10,
}

/** Get min submit minutes for a group (and phase, for G3) */
export function getSubmitMinMinutes(
  group: string | null | undefined,
  phase?: number,
): number {
  const cfg = group ? GROUP_TIME_CONFIG[group] : undefined
  if (!cfg) return DEFAULT_CONFIG.submitMinMinutes
  if (group === 'G3-HumanAndAI' && phase === 2 && cfg.phase2SubmitMinMinutes !== undefined) {
    return cfg.phase2SubmitMinMinutes
  }
  return cfg.submitMinMinutes
}

/** Get auto-submit (max) minutes for a group (and phase, for G3) */
export function getAutoSubmitMinutes(
  group: string | null | undefined,
  phase?: number,
): number {
  const cfg = group ? GROUP_TIME_CONFIG[group] : undefined
  if (!cfg) return DEFAULT_CONFIG.autoSubmitMinutes
  if (group === 'G3-HumanAndAI' && phase === 2 && cfg.phase2AutoSubmitMinutes !== undefined) {
    return cfg.phase2AutoSubmitMinutes
  }
  return cfg.autoSubmitMinutes
}

/** Get both min and auto minutes as a { min, max } object */
export function getGroupTimeBounds(
  group: string | null | undefined,
  phase?: number,
): { min: number; max: number } {
  return {
    min: getSubmitMinMinutes(group, phase),
    max: getAutoSubmitMinutes(group, phase),
  }
}
