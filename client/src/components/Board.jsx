import { useEffect, useState } from 'react'
import { api } from '../api'
import ItemCard from './ItemCard'
import PostForm from './PostForm'

export default function Board({ user, onLogout }) {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [posting, setPosting] = useState(false)

  const load = async () => setItems(await api.listItems())
  useEffect(() => { load() }, [])

  const shown = items.filter((i) =>
    (filter === 'all' || i.type === filter) &&
    (i.title + ' ' + (i.location || '') + ' ' + (i.description || ''))
      .toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <header className="top">
        <h1>Campus Lost &amp; Found</h1>
        <div className="who">
          <span>{user.fullName}</span>
          <button className="btn ghost small" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <main className="wrap">
        <div className="toolbar">
          <input className="search" placeholder="Search by item or place"
            value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search items" />
          <div className="chips">
            {['all', 'lost', 'found'].map((f) => (
              <button key={f} className={'chip' + (filter === f ? ' on' : '')} onClick={() => setFilter(f)}>
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn" onClick={() => setPosting(true)}>Post an item</button>
        </div>

        <div className="grid">
          {shown.length === 0 && (
            <p className="empty">Nothing here yet. Post the first lost or found item.</p>
          )}
          {shown.map((item) => (
            <ItemCard key={item.id} item={item} user={user}
              onResolve={async () => { await api.resolveItem(item.id); load() }}
              onDelete={async () => { await api.deleteItem(item.id); load() }} />
          ))}
        </div>
      </main>

      {posting && (
        <PostForm user={user} onClose={() => setPosting(false)}
          onPosted={() => { setPosting(false); load() }} />
      )}
    </>
  )
}