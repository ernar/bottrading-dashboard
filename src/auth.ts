// Login de usuario único para el dashboard.
//
// AVISO DE SEGURIDAD: esta app es 100% frontend. Las credenciales
// (VITE_AUTH_USER / VITE_AUTH_PASS) se incrustan en el bundle JS al compilar y
// son visibles para cualquiera que inspeccione el código en el navegador. Por
// tanto este login es una PUERTA DE ACCESO / DISUASIÓN, no seguridad real. La
// protección efectiva frente a internet es el token del backend (X-API-Token,
// ver config.ts) y/o limitar el acceso a la URL. Aun así, evita el acceso
// casual y guarda la sesión para no pedir credenciales en cada visita.

const AUTH_USER = (import.meta.env.VITE_AUTH_USER || '').trim()
const AUTH_PASS = import.meta.env.VITE_AUTH_PASS || ''

const SESSION_KEY = 'bottrading_auth'
// Duración de la sesión cacheada (30 días). Tras ese tiempo se vuelve a pedir.
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

interface Session {
  u: string
  exp: number // timestamp (ms) de expiración
}

// Si no se han definido credenciales en el entorno, el login queda desactivado
// (comportamiento de uso puramente local).
export function authEnabled(): boolean {
  return AUTH_USER !== '' && AUTH_PASS !== ''
}

export function isAuthenticated(): boolean {
  if (!authEnabled()) return true
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const session = JSON.parse(raw) as Session
    if (!session.exp || Date.now() > session.exp) {
      localStorage.removeItem(SESSION_KEY)
      return false
    }
    // Si las credenciales del entorno cambian, invalida sesiones antiguas.
    return session.u === AUTH_USER
  } catch {
    return false
  }
}

// Comprueba credenciales y, si son correctas, guarda la sesión en localStorage.
export function login(user: string, pass: string): boolean {
  if (user.trim() === AUTH_USER && pass === AUTH_PASS) {
    const session: Session = { u: AUTH_USER, exp: Date.now() + SESSION_TTL_MS }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return true
  }
  return false
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY)
}
