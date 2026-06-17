import { useState, useEffect } from 'react'
import { BotState } from '../types/bot'
import { StatusBadge } from './StatusBadge'
import { getApiUrl, getApiHeaders } from '../config'

const API_URL = getApiUrl()

interface HeaderProps {
  state: BotState | null
  connected: boolean
  onLogout?: () => void
}

function LogoutButton({ onLogout }: { onLogout?: () => void }) {
  if (!onLogout) return null
  return (
    <button
      onClick={onLogout}
      title="Cerrar sesión"
      aria-label="Cerrar sesión"
      className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  )
}

function BotToggleButton({ running }: { running: boolean }) {
  const [busy, setBusy] = useState(false)

  const toggle = async () => {
    setBusy(true)
    try {
      await fetch(`${API_URL}/api/bot/${running ? 'stop' : 'start'}`, {
        method: 'POST',
        headers: getApiHeaders(),
      })
    } catch { /* el estado real llega por WebSocket */ }
    setBusy(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`px-4 py-1.5 rounded font-semibold text-sm transition disabled:opacity-50 ${
        running
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-green-600 hover:bg-green-700 text-white'
      }`}
    >
      {busy ? '...' : running ? '■ Detener' : '▶ Iniciar'}
    </button>
  )
}

// Tarjeta de métrica de la cabecera.
function Stat({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="bg-gray-800/60 ring-1 ring-gray-700/50 rounded-xl px-3 py-2.5 hover:ring-gray-600/70 transition">
      <div className="text-[11px] uppercase tracking-wider text-gray-400">{label}</div>
      <div className={`text-lg sm:text-xl font-semibold ${valueClass}`}>{value}</div>
    </div>
  )
}

export function Header({ state, connected, onLogout }: HeaderProps) {
  // Momento de la última actualización RECIBIDA, medido con el reloj del
  // navegador (no con el timestamp del backend, que puede traer desfase de zona
  // horaria y solo cambia en el state_update completo). `state` cambia de
  // identidad con cada evento WebSocket (account_update cada ~5s, señales,
  // posiciones…), así que esto avanza en vivo.
  const [lastSeen, setLastSeen] = useState<Date | null>(null)
  useEffect(() => {
    if (state) setLastSeen(new Date())
  }, [state])

  if (!state || !state.account_info) {
    return (
      <header className="bg-gradient-to-b from-gray-900 to-gray-950 text-white px-4 py-3 border-b border-gray-800 shadow-lg shadow-black/30">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="GamerFurious Trading Bot" className="h-10 w-10 rounded-lg ring-1 ring-gray-700 bg-gray-800/50 object-contain p-1" />
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Trading Bot</h1>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={connected ? 'connected' : 'disconnected'} label="API" />
            <LogoutButton onLogout={onLogout} />
          </div>
        </div>
      </header>
    )
  }

  const account = state.account_info
  const openPositions = Object.keys(state.positions).length
  const floatingPnl = account.equity - account.balance
  const pnlColor = floatingPnl > 0 ? 'text-green-400' : floatingPnl < 0 ? 'text-red-400' : 'text-white'
  const platform = account.platform || 'MT4'

  return (
    <header className="bg-gradient-to-b from-gray-900 to-gray-950 text-white px-4 py-3 sm:py-4 border-b border-gray-800 shadow-lg shadow-black/30">
      <div className="flex flex-wrap justify-between items-center gap-y-2 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/logo.png" alt="GamerFurious Trading Bot" className="h-11 w-11 rounded-xl ring-1 ring-gray-700 bg-gray-800/50 object-contain p-1" />
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent truncate">
              {platform} Trading Bot
            </h1>
            {lastSeen && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`} />
                actualizado {lastSeen.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <StatusBadge status={connected ? 'connected' : 'disconnected'} label="API" />
          <StatusBadge status={state.bot_running ? 'bullish' : 'bearish'} label={state.bot_running ? 'Running' : 'Stopped'} />
          <BotToggleButton running={state.bot_running} />
          <LogoutButton onLogout={onLogout} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 text-sm">
        <Stat label="Balance" value={`$${account.balance.toFixed(2)}`} />
        <Stat label="Equity" value={`$${account.equity.toFixed(2)}`} />
        <Stat
          label="P/L flotante"
          value={`${floatingPnl >= 0 ? '+' : ''}$${floatingPnl.toFixed(2)}`}
          valueClass={pnlColor}
        />
        <Stat label="Free Margin" value={`$${account.free_margin.toFixed(2)}`} />
        <Stat label="Posiciones" value={String(openPositions)} />
        <Stat label="Leverage" value={`${account.leverage}:1`} />
      </div>
    </header>
  )
}
