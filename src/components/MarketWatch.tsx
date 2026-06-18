import { useMemo } from 'react'
import type { BotState } from '../types/bot'
import { priceDecimals, formatBrokerClock } from '../utils/format'

// Fila ya normalizada del market watch (un símbolo). El precio prioriza el dato
// EN VIVO de una posición abierta (current_price) y, si no hay, cae a la entrada
// de la última señal. La señal/tendencia/confianza salen de state.signals.
interface WatchRow {
  symbol: string
  price: number | null
  action: 'buy' | 'sell' | 'hold' | null
  trend: 'bullish' | 'bearish' | 'sideways' | null
  confidence: number | null
  pnl: number | null
  positions: number
  updated?: string
}

interface Props {
  symbols: string[]
  selected: string
  onSelect: (symbol: string) => void
  state: BotState | null
}

// Insignia de la última señal del símbolo (BUY/SELL/HOLD) con su color.
const ACTION_STYLE: Record<string, string> = {
  buy: 'bg-green-500/15 text-green-400',
  sell: 'bg-red-500/15 text-red-400',
  hold: 'bg-gray-600/30 text-gray-400',
}

// Flecha de tendencia: alcista ▲, bajista ▼, lateral →.
const TREND_ARROW: Record<string, { icon: string; color: string }> = {
  bullish: { icon: '▲', color: 'text-green-400' },
  bearish: { icon: '▼', color: 'text-red-400' },
  sideways: { icon: '→', color: 'text-gray-500' },
}

// Market Watch lateral: lista de los símbolos vigilados con su precio en vivo, la
// última señal del bot y el P/L flotante. Cada fila actúa también como selector
// del gráfico (resalta el símbolo activo).
export function MarketWatch({ symbols, selected, onSelect, state }: Props) {
  const rows = useMemo<WatchRow[]>(() => {
    const positions = Object.values(state?.positions || {})
    return symbols.map(sym => {
      const sig = state?.signals?.[sym]
      const pos = positions.filter(p => p.symbol === sym)
      // Precio: dato en vivo de la posición; si no, la entrada de la última señal.
      const live = pos.find(p => Number.isFinite(p.current_price) && p.current_price > 0)?.current_price
      const price = live ?? (sig && Number.isFinite(sig.entry) ? sig.entry : null)
      return {
        symbol: sym,
        price: price ?? null,
        action: sig?.action ?? null,
        trend: sig?.trend ?? null,
        confidence: sig != null && Number.isFinite(sig.confidence) ? sig.confidence : null,
        pnl: pos.length ? pos.reduce((s, p) => s + (p.profit || 0), 0) : null,
        positions: pos.length,
        updated: sig?.timestamp,
      }
    })
  }, [symbols, state?.signals, state?.positions])

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-sm font-semibold text-gray-200">Market Watch</span>
        <span className="text-[10px] text-gray-500">{rows.length} símbolos</span>
      </div>

      {rows.length === 0 ? (
        <div className="px-3 py-6 text-center text-xs text-gray-500">
          No hay símbolos disponibles.
        </div>
      ) : (
        <ul className="divide-y divide-gray-700/60 max-h-[28rem] overflow-y-auto lg:max-h-[24rem]">
          {rows.map(r => {
            const active = r.symbol === selected
            const dec = priceDecimals(r.symbol)
            const trend = r.trend ? TREND_ARROW[r.trend] : null
            const actionLabel = r.action ? r.action.toUpperCase() : '—'
            return (
              <li key={r.symbol}>
                <button
                  onClick={() => onSelect(r.symbol)}
                  title={r.updated ? `Última señal: ${formatBrokerClock(r.updated)}` : undefined}
                  className={`w-full text-left px-3 py-2 transition-colors ${
                    active ? 'bg-blue-500/10' : 'hover:bg-gray-700/40'
                  }`}
                >
                  {/* Línea 1: símbolo (con flecha de tendencia) + precio */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 min-w-0">
                      {trend && <span className={`text-[10px] ${trend.color}`}>{trend.icon}</span>}
                      <span className={`font-mono text-sm truncate ${active ? 'text-blue-400 font-semibold' : 'text-gray-200'}`}>
                        {r.symbol}
                      </span>
                      {r.positions > 0 && (
                        <span className="shrink-0 text-[9px] px-1 rounded bg-cyan-500/15 text-cyan-300">
                          {r.positions}
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-sm tabular-nums text-gray-100 shrink-0">
                      {r.price != null ? r.price.toFixed(dec) : '—'}
                    </span>
                  </div>

                  {/* Línea 2: señal + confianza, y P/L flotante si hay posiciones */}
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        r.action ? ACTION_STYLE[r.action] : 'bg-gray-600/30 text-gray-500'
                      }`}>
                        {actionLabel}
                      </span>
                      {r.confidence != null && (
                        <span className="text-[10px] text-gray-500 tabular-nums">
                          {(r.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </span>
                    {r.pnl != null && (
                      <span className={`text-[11px] tabular-nums font-medium shrink-0 ${
                        r.pnl > 0 ? 'text-green-400' : r.pnl < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {r.pnl >= 0 ? '+' : ''}${r.pnl.toFixed(2)}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
