function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hr ago`
  return `${Math.floor(h / 24)} days ago`
}

export default function ItemCard({ item, user, onResolve, onDelete }) {
  const isOwner = item.userId === user.id
  const isAdmin = user.role === 'admin'
  return (
    <article className={'card' + (item.status === 'resolved' ? ' done' : '')}>
      <div className="photo">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.title} />
          : <div className="noimg">No photo</div>}
        <span className={'badge ' + item.type}>{item.type === 'lost' ? 'Lost' : 'Found'}</span>
      </div>
      <div className="body">
        <h3>{item.title}</h3>
        <span className="meta">{item.location || 'Location not given'} · {timeAgo(item.createdAt)}</span>
        {item.description && <p>{item.description}</p>}
        <span className="meta">Posted by {item.posterName}</span>
        {item.status === 'resolved' && <span className="meta"><b>Returned to owner</b></span>}
        {(isOwner || isAdmin) && (
          <div className="actions">
            {isOwner && item.status === 'open' &&
              <button className="btn ghost small" onClick={onResolve}>Mark returned</button>}
            <button className="btn danger small" onClick={onDelete}>
              {isAdmin && !isOwner ? 'Remove (admin)' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}