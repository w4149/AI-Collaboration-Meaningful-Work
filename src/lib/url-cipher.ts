// URL parameter cipher — obfuscates task and group values in query strings
// so visitors cannot determine study group from the URL.
//
// Encoding is idempotent: calling encodeParams on already-encoded params
// leaves them unchanged. Decoding is the inverse.
//
// Encoding map (plaintext → cipher):
//   task   → Q3T
//   group  → Z0K
//   task1  → X8O
//   task2  → W1W
//   task3  → S5G
//   task4  → U4E
//   G1-Human → Y2B
//   G2-AI    → F7H
//   G3-AIAndHuman → A9I

const ENCODE_KEY_MAP: Record<string, string> = {
  task: 'Q3T',
  group: 'Z0K',
}

const ENCODE_VALUE_MAP: Record<string, string> = {
  task1: 'X8O',
  task2: 'W1W',
  task3: 'S5G',
  task4: 'U4E',
  'G1-Human': 'Y2B',
  'G2-AI': 'F7H',
  'G3-HumanAndAI': 'A9I',
}

const DECODE_KEY_MAP: Record<string, string> = {
  Q3T: 'task',
  Z0K: 'group',
}

const DECODE_VALUE_MAP: Record<string, string> = {
  X8O: 'task1',
  W1W: 'task2',
  S5G: 'task3',
  U4E: 'task4',
  Y2B: 'G1-Human',
  F7H: 'G2-AI',
  A9I: 'G3-HumanAndAI',
}

/** Encode a URLSearchParams — replaces plaintext keys/values with cipher equivalents.
 *  Already-ciphered params are left unchanged (idempotent). */
export function encodeParams(params: URLSearchParams): URLSearchParams {
  const encoded = new URLSearchParams()
  params.forEach((value, key) => {
    const encKey = ENCODE_KEY_MAP[key] ?? key
    const encValue = ENCODE_VALUE_MAP[value] ?? value
    encoded.set(encKey, encValue)
  })
  return encoded
}

/** Decode a URLSearchParams — replaces cipher keys/values back to plaintext.
 *  Already-plaintext params are left unchanged (idempotent). */
export function decodeParams(params: URLSearchParams): URLSearchParams {
  const decoded = new URLSearchParams()
  params.forEach((value, key) => {
    const decKey = DECODE_KEY_MAP[key] ?? key
    const decValue = DECODE_VALUE_MAP[value] ?? value
    decoded.set(decKey, decValue)
  })
  return decoded
}

/** Get a plaintext param value from URLSearchParams (auto-decodes if ciphered) */
export function getParam(params: URLSearchParams, name: string): string | null {
  const cipherName = ENCODE_KEY_MAP[name] ?? name
  const raw = params.get(name) ?? params.get(cipherName)
  if (raw === null) return null
  return DECODE_VALUE_MAP[raw] ?? raw
}

/** Encode params to query string (with ? prefix) */
export function encodedQuery(params: URLSearchParams): string {
  const enc = encodeParams(params)
  const s = enc.toString()
  return s ? `?${s}` : ''
}
