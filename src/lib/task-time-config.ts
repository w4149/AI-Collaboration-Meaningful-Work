// Centralized task time configuration.
// Adjust min/max durations per group and task here — all timers,
// auto-submit logic, and on-screen instruction text are driven from this file.
//
// submitMinMinutes   — minimum minutes before manual Submit is allowed
// autoSubmitMinutes  — maximum minutes before auto-submit triggers
// phase2SubmitMinMinutes  — G3 Phase 2 min submit (defaults to submitMinMinutes)
// phase2AutoSubmitMinutes — G3 Phase 2 max time (defaults to autoSubmitMinutes)
//
// Config resolution order (most specific → least specific):
//   1. group + taskId (task-specific override)
//   2. group (group-level default)
//   3. DEFAULT_CONFIG (hardcoded fallback)

export type GroupTimeConfig = {
  submitMinMinutes: number
  autoSubmitMinutes: number
  phase2SubmitMinMinutes?: number
  phase2AutoSubmitMinutes?: number
}

export type GroupFullConfig = {
  default: GroupTimeConfig
  tasks?: Record<string, GroupTimeConfig>
}

// 3 groups × 6 tasks = 18 independent time configurations
// Adjust the values below per group and per task as needed.
export const GROUP_TIME_CONFIG: Record<string, GroupFullConfig> = {
  'G1-Human': {
    default: { submitMinMinutes: 5, autoSubmitMinutes: 15 },
    tasks: {
      'task1':   { submitMinMinutes: 5, autoSubmitMinutes: 15 },
      'task1-2': { submitMinMinutes: 5, autoSubmitMinutes: 15 },
      'task2':   { submitMinMinutes: 5, autoSubmitMinutes: 15 },
      'task3':   { submitMinMinutes: 5, autoSubmitMinutes: 15 },
      'task4':   { submitMinMinutes: 5, autoSubmitMinutes: 15 },
      'task4-2': { submitMinMinutes: 5, autoSubmitMinutes: 15 },
    },
  },
  'G2-AI': {
    default: { submitMinMinutes: 3, autoSubmitMinutes: 15 },
    tasks: {
      'task1':   { submitMinMinutes: 3, autoSubmitMinutes: 15 },
      'task1-2': { submitMinMinutes: 3, autoSubmitMinutes: 15 },
      'task2':   { submitMinMinutes: 3, autoSubmitMinutes: 15 },
      'task3':   { submitMinMinutes: 3, autoSubmitMinutes: 15 },
      'task4':   { submitMinMinutes: 3, autoSubmitMinutes: 15 },
      'task4-2': { submitMinMinutes: 3, autoSubmitMinutes: 15 },
    },
  },
  'G3-HumanAndAI': {
    default: {
      submitMinMinutes: 5,
      autoSubmitMinutes: 15,
      phase2SubmitMinMinutes: 3,
      phase2AutoSubmitMinutes: 15,
    },
    tasks: {
      'task1':   { submitMinMinutes: 5, autoSubmitMinutes: 15, phase2SubmitMinMinutes: 3, phase2AutoSubmitMinutes: 15 },
      'task1-2': { submitMinMinutes: 5, autoSubmitMinutes: 15, phase2SubmitMinMinutes: 3, phase2AutoSubmitMinutes: 15 },
      'task2':   { submitMinMinutes: 5, autoSubmitMinutes: 15, phase2SubmitMinMinutes: 3, phase2AutoSubmitMinutes: 15 },
      'task3':   { submitMinMinutes: 5, autoSubmitMinutes: 15, phase2SubmitMinMinutes: 3, phase2AutoSubmitMinutes: 15 },
      'task4':   { submitMinMinutes: 5, autoSubmitMinutes: 15, phase2SubmitMinMinutes: 3, phase2AutoSubmitMinutes: 15 },
      'task4-2': { submitMinMinutes: 5, autoSubmitMinutes: 15, phase2SubmitMinMinutes: 3, phase2AutoSubmitMinutes: 15 },
    },
  },
}

const DEFAULT_CONFIG: GroupTimeConfig = {
  submitMinMinutes: 5,
  autoSubmitMinutes: 10,
}

function resolveConfig(
  group: string | null | undefined,
  taskId?: string | null | undefined,
): GroupTimeConfig {
  if (!group) return DEFAULT_CONFIG
  const groupEntry = GROUP_TIME_CONFIG[group]
  if (!groupEntry) return DEFAULT_CONFIG

  // 1. Try task-specific config first
  if (taskId && groupEntry.tasks && groupEntry.tasks[taskId]) {
    return groupEntry.tasks[taskId]
  }

  // 2. Fall back to group-level default
  return groupEntry.default
}

/** Get min submit minutes for a group, optional taskId and phase */
export function getSubmitMinMinutes(
  group: string | null | undefined,
  phase?: number,
  taskId?: string | null | undefined,
): number {
  const cfg = resolveConfig(group, taskId)
  if (group === 'G3-HumanAndAI' && phase === 2 && cfg.phase2SubmitMinMinutes !== undefined) {
    return cfg.phase2SubmitMinMinutes
  }
  return cfg.submitMinMinutes
}

/** Get auto-submit (max) minutes for a group, optional taskId and phase */
export function getAutoSubmitMinutes(
  group: string | null | undefined,
  phase?: number,
  taskId?: string | null | undefined,
): number {
  const cfg = resolveConfig(group, taskId)
  if (group === 'G3-HumanAndAI' && phase === 2 && cfg.phase2AutoSubmitMinutes !== undefined) {
    return cfg.phase2AutoSubmitMinutes
  }
  return cfg.autoSubmitMinutes
}

/** Get both min and auto minutes as a { min, max } object */
export function getGroupTimeBounds(
  group: string | null | undefined,
  phase?: number,
  taskId?: string | null | undefined,
): { min: number; max: number } {
  return {
    min: getSubmitMinMinutes(group, phase, taskId),
    max: getAutoSubmitMinutes(group, phase, taskId),
  }
}
