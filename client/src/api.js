// TEMPORARY: saves data in the browser. We will replace this file
// with real calls to the Express + MySQL server later.
const read = (k, d) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d))
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v))

// Shrink photos so they fit in browser storage
function resize(file, max = 800) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = img.width * scale
      c.height = img.height * scale
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL('image/jpeg', 0.75))
    }
    img.src = URL.createObjectURL(file)
  })
}

export const api = {
  currentUser: () => read('lf_session', null),

  async signup({ admissionNo, fullName, password }) {
    const users = read('lf_users', [])
    if (users.some((u) => u.admissionNo === admissionNo.toUpperCase()))
      throw new Error('That admission number is already registered.')
    const user = { id: Date.now(), admissionNo: admissionNo.toUpperCase(), fullName, password, role: 'student' }
    write('lf_users', [...users, user])
    const session = { id: user.id, admissionNo: user.admissionNo, fullName, role: user.role }
    write('lf_session', session)
    return session
  },

  async login({ admissionNo, password }) {
    const u = read('lf_users', []).find(
      (x) => x.admissionNo === admissionNo.toUpperCase() && x.password === password
    )
    if (!u) throw new Error('Admission number or password is incorrect.')
    const session = { id: u.id, admissionNo: u.admissionNo, fullName: u.fullName, role: u.role }
    write('lf_session', session)
    return session
  },

  logout: () => localStorage.removeItem('lf_session'),

  async listItems() {
    return read('lf_items', []).sort((a, b) => b.createdAt - a.createdAt)
  },

  async createItem(user, { type, title, description, location, imageFile }) {
    const imageUrl = imageFile ? await resize(imageFile) : null
    const item = {
      id: Date.now(), userId: user.id, posterName: user.fullName,
      type, title, description, location, imageUrl,
      status: 'open', createdAt: Date.now(),
    }
    write('lf_items', [item, ...read('lf_items', [])])
    return item
  },

  async resolveItem(id) {
    write('lf_items', read('lf_items', []).map((i) => (i.id === id ? { ...i, status: 'resolved' } : i)))
  },

  async deleteItem(id) {
    write('lf_items', read('lf_items', []).filter((i) => i.id !== id))
  },
}