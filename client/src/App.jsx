import { useEffect, useState } from 'react'
import { api } from './api'
import AuthPage from './components/AuthPage'
import Board from './components/Board'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.currentUser().then((u) => { setUser(u); setLoading(false) })
  }, [])

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>
  if (!user) return <AuthPage onAuth={setUser} />
  return (
    <Board
      user={user}
      onLogout={async () => { await api.logout(); setUser(null) }}
    />
  )
}