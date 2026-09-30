import { useState } from 'react'
import { api } from '../api'

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ admissionNo: '', fullName: '', password: '' })
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      const user = mode === 'login' ? await api.login(form) : await api.signup(form)
      onAuth(user)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth">
      <section className="auth-hero">
        <h1>Lost something on campus? Someone may have found it.</h1>
        <p>Post a photo, say where you saw it, and let fellow students help you get it back.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="sub">
            {mode === 'login' ? 'Log in with your admission number.' : 'Use your admission number and full name.'}
          </p>
          {error && <div className="error" role="alert">{error}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="adm">Admission number</label>
              <input id="adm" placeholder="CIT/00003/023" value={form.admissionNo}
                onChange={set('admissionNo')} required />
            </div>
            {mode === 'signup' && (
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" value={form.fullName} onChange={set('fullName')} required />
              </div>
            )}
            <div className="field">
              <label htmlFor="pw">Password</label>
              <input id="pw" type="password" minLength={6} value={form.password}
                onChange={set('password')} required />
            </div>
            <button className="btn wide" type="submit">
              {mode === 'login' ? 'Log in' : 'Sign up'}
            </button>
          </form>

          <div className="switch">
            {mode === 'login' ? 'New here? ' : 'Already registered? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>
              {mode === 'login' ? 'Create an account' : 'Log in'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}