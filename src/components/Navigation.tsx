import { Link, useLocation } from 'react-router-dom'

type IconProps = { className?: string }

// Iconos en SVG inline (sin dependencias). Trazo "currentColor" para heredar el
// color del enlace (activo/inactivo).
const Icon = {
  dashboard: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  charts: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" /><path d="M7 14l3-4 3 3 4-6" />
    </svg>
  ),
  coordinator: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" /><path d="M2 21v-1a6 6 0 0 1 6-6h2" />
      <circle cx="17" cy="10" r="3" /><path d="M22 21v-1a5 5 0 0 0-5-5" />
    </svg>
  ),
  agents: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="12" rx="2" /><path d="M12 8V4" /><circle cx="12" cy="3" r="1" />
      <circle cx="9" cy="14" r="1" /><circle cx="15" cy="14" r="1" />
    </svg>
  ),
  positions: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M3 12h18M3 18h18" /><circle cx="8" cy="6" r="2" fill="currentColor" />
      <circle cx="16" cy="12" r="2" fill="currentColor" /><circle cx="11" cy="18" r="2" fill="currentColor" />
    </svg>
  ),
  history: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l3 2" />
    </svg>
  ),
  terminal: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9l3 3-3 3" /><path d="M13 15h4" />
    </svg>
  ),
  settings: (p: IconProps) => (
    <svg className={p.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
}

const LINKS = [
  { to: '/', label: 'Dashboard', icon: Icon.dashboard },
  { to: '/charts', label: 'Gráficos', icon: Icon.charts },
  { to: '/coordinator', label: 'Mesa', icon: Icon.coordinator },
  { to: '/agents', label: 'Agents', icon: Icon.agents },
  { to: '/positions', label: 'Positions', icon: Icon.positions },
  { to: '/history', label: 'History', icon: Icon.history },
  { to: '/terminal', label: 'Terminal', icon: Icon.terminal },
  { to: '/settings', label: 'Ajustes', icon: Icon.settings },
]

export function Navigation() {
  const location = useLocation()

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      {/* Solo iconos para ahorrar espacio. Reparto uniforme; si en una pantalla
          muy estrecha no caben, hace scroll horizontal SIN barra visible. */}
      <div className="flex justify-around sm:justify-start gap-1 sm:gap-2 px-1 sm:px-4 overflow-x-auto no-scrollbar">
        {LINKS.map(({ to, label, icon: IconCmp }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              title={label}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center justify-center px-4 py-3 shrink-0 transition border-b-2 ${
                active
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <IconCmp className="w-5 h-5 shrink-0" />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
