import { useState } from 'react'
import { api } from '../api'

export default function PostForm({ user, onClose, onPosted }) {
  const [form, setForm] = useState({ type: 'lost', title: '', description: '', location: '' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function pick(e) {
    const f = e.target.files[0]
    if (!f) return
    if (!['image/jpeg', 'image/png'].includes(f.type)) return setError('Choose a JPG or PNG image.')
    if (f.size > 5 * 1024 * 1024) return setError('Image must be under 5 MB.')
    setError('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function submit(e) {
    e.preventDefault()
    await api.createItem(user, { ...form, imageFile: file })
    onPosted()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>Post an item</h2>
        <div className="seg">
          {['lost', 'found'].map((t) => (
            <button type="button" key={t} className={(form.type === t ? 'on ' : '') + t}
              onClick={() => setForm({ ...form, type: t })}>
              {t === 'lost' ? 'I lost something' : 'I found something'}
            </button>
          ))}
        </div>
        {error && <div className="error" role="alert">{error}</div>}
        <div className="field">
          <label htmlFor="t">What is it?</label>
          <input id="t" value={form.title} onChange={set('title')} placeholder="Black backpack" required />
        </div>
        <div className="field">
          <label htmlFor="l">Where?</label>
          <input id="l" value={form.location} onChange={set('location')} placeholder="Library, 2nd floor" />
        </div>
        <div className="field">
          <label htmlFor="d">Details</label>
          <textarea id="d" rows="3" value={form.description} onChange={set('description')}
            placeholder="Colour, brand, anything that helps prove it is yours" />
        </div>
        <div className="field">
          <label htmlFor="p">Photo</label>
          <input id="p" type="file" accept="image/png,image/jpeg" onChange={pick} />
          {preview && <img className="preview" src={preview} alt="Selected item preview" />}
        </div>
        <div className="actions">
          <button className="btn" type="submit">Post</button>
          <button className="btn ghost" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  )
}