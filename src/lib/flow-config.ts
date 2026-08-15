// Flow configuration — enable/disable individual steps for testing.
// Set any flag to false to skip that step and auto-forward.
// ALL flags default to true for production.

export const FLOW_CONFIG = {
  welcome: true,
  screen: true,
  consent: true,
  preSurvey: false,
  entry: true,
  task: true,
} as const

export type StepKey = keyof typeof FLOW_CONFIG

const STEP_ORDER: StepKey[] = ['welcome', 'screen', 'consent', 'preSurvey', 'entry', 'task']

export const STEP_ROUTES: Record<StepKey, string> = {
  welcome: '/',
  screen: '/screen',
  consent: '/consent',
  preSurvey: '/pre-survey',
  entry: '/entry',
  task: '/task',
}

/** Skip flags that must be set when bypassing a step, so downstream guards don't redirect back. */
const SKIP_SIDE_EFFECTS: Partial<Record<StepKey, () => void>> = {
  screen: () => {
    sessionStorage.setItem('screeningCompleted', 'true')
    sessionStorage.setItem('screeningPassed', 'true')
  },
  consent: () => {
    sessionStorage.setItem('consentAgreed', 'true')
  },
  preSurvey: () => {
    sessionStorage.setItem('preSurveyCompleted', 'true')
  },
}

/**
 * Get the next enabled step after the given step.
 * If all remaining steps are disabled, returns null.
 */
export function getNextEnabledStep(from: StepKey): StepKey | null {
  const idx = STEP_ORDER.indexOf(from)
  for (let i = idx + 1; i < STEP_ORDER.length; i++) {
    const next = STEP_ORDER[i]
    if (FLOW_CONFIG[next]) return next
  }
  return null
}

/**
 * Get the first enabled step from the beginning (used when a step is disabled).
 */
export function getFirstEnabledStep(): StepKey {
  for (const step of STEP_ORDER) {
    if (FLOW_CONFIG[step]) return step
  }
  return 'task'
}

/**
 * Called by a page to check if it should be skipped.
 * If disabled, sets side-effect flags and returns the next enabled route to jump to.
 * Returns null if the page is enabled and should render normally.
 */
export function getSkipRoute(current: StepKey): string | null {
  if (FLOW_CONFIG[current]) return null

  // Apply side effects for the skipped step
  const effect = SKIP_SIDE_EFFECTS[current]
  if (effect) effect()

  const next = getNextEnabledStep(current)
  if (!next) {
    // All remaining steps disabled — jump to task with mock params
    return '/task?taskId=task1&group=G1-Human&mock=1'
  }
  return STEP_ROUTES[next]
}

/**
 * Get the skip route for a given step including query params preservation.
 */
export function getSkipRouteWithParams(current: StepKey, searchParams: URLSearchParams): string | null {
  const base = getSkipRoute(current)
  if (!base) return null
  const qs = searchParams.toString()
  if (qs) {
    const sep = base.includes('?') ? '&' : '?'
    return `${base}${sep}${qs}`
  }
  return base
}
