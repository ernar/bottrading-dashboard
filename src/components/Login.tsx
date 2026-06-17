import { useState } from 'react'
import { login } from '../auth'

interface LoginProps {
  onSuccess: () => void
}

export function Login({ onSuccess }: LoginProps) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (login(user, pass)) {
      onSuccess()
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-gray-800 rounded-xl shadow-xl border border-gray-700 p-6 sm:p-8"
      >
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="GamerFurious Trading Bot" className="h-16 w-auto mb-3" />
          <h1 className="text-xl font-bold">Trading Bot</h1>
          <p className="text-sm text-gray-400">Inicia sesión para continuar</p>
        </div>

        <label className="block text-sm text-gray-300 mb-1" htmlFor="login-user">
          Usuario
        </label>
        <input
          id="login-user"
          type="text"
          inputMode="email"
          autoComplete="username"
          autoFocus
          value={user}
          onChange={(e) => { setUser(e.target.value); setError(false) }}
          className="w-full mb-4 px-3 py-2 rounded bg-gray-900 border border-gray-700 focus:border-blue-500 focus:outline-none"
          placeholder="tu-email@ejemplo.com"
        />

        <label className="block text-sm text-gray-300 mb-1" htmlFor="login-pass">
          Contraseña
        </label>
        <div className="relative mb-4">
          <input
            id="login-pass"
            type={showPass ? 'text' : 'password'}
            autoComplete="current-password"
            value={pass}
            onChange={(e) => { setPass(e.target.value); setError(false) }}
            className="w-full px-3 py-2 pr-10 rounded bg-gray-900 border border-gray-700 focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-sm"
          >
            {showPass ? 'Ocultar' : 'Ver'}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-400 mb-4">Usuario o contraseña incorrectos.</p>
        )}

        <button
          type="submit"
          className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-700 font-semibold transition"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}
