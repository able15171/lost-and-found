import { useState } from 'react'
import { api } from './api'
import AuthPage from './components/AuthPage'
import Board from './components/Board'

export default function App() {
  const [user, setUser] = useState(api.currentUser())

  if (!user) return <AuthPage onAuth={setUser} />
  return (
    <Board
      user={user}
      onLogout={() => { api.logout(); setUser(null) }}
    />
  )
}