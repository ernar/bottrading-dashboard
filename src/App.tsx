import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useWebSocket } from './hooks/useWebSocket'
import { Header } from './components/Header'
import { Navigation } from './components/Navigation'
import { DuplicateInstanceModal } from './components/DuplicateInstanceModal'
import { ErrorBoundary } from './components/ErrorBoundary'
import { DashboardPage } from './pages/Dashboard'
import { ChartsPage } from './pages/Charts'
import { PositionsPage } from './pages/Positions'
import { HistoryPage } from './pages/History'
import { AgentsPage } from './pages/Agents'
import { CoordinatorPage } from './pages/Coordinator'
import { TerminalPage } from './pages/Terminal'
import { ChatWidget } from './components/ChatWidget'
import { LofiPlayer } from './components/LofiPlayer'
import { SettingsPage } from './pages/Settings'
import { Login } from './components/Login'
import { isAuthenticated, logout } from './auth'
import { useIsMobile } from './hooks/useIsMobile'

// App ya autenticada: aquí se conecta el WebSocket (no antes del login, para no
// abrir conexiones al backend hasta que el usuario haya entrado).
function AuthenticatedApp({ onLogout }: { onLogout: () => void }) {
  const { state, connected, coordination, duplicateInstance, clearDuplicate } = useWebSocket()
  const isMobile = useIsMobile()

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        {duplicateInstance && <DuplicateInstanceModal onClose={clearDuplicate} />}
        <Header state={state} connected={connected} onLogout={onLogout} />
        <Navigation />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<DashboardPage state={state} />} />
            <Route path="/charts" element={<ChartsPage state={state} />} />
            <Route path="/coordinator" element={<CoordinatorPage liveCoordination={coordination} />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/positions" element={<PositionsPage state={state} coordination={coordination} />} />
            <Route path="/history" element={<HistoryPage state={state} />} />
            <Route path="/terminal" element={<TerminalPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </ErrorBoundary>
        {/* Asistente flotante (burbuja abajo a la derecha), disponible en todas las vistas. */}
        <ChatWidget />
        {/* Reproductor de música LO-FI (abajo a la izquierda); arranca al entrar.
            En móvil se desactiva: no se monta, así que no reproduce audio. */}
        {!isMobile && <LofiPlayer />}
      </div>
    </Router>
  )
}

function App() {
  const [authed, setAuthed] = useState(isAuthenticated())

  if (!authed) {
    return <Login onSuccess={() => setAuthed(true)} />
  }

  return (
    <AuthenticatedApp
      onLogout={() => {
        logout()
        setAuthed(false)
      }}
    />
  )
}

export default App
