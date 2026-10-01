import { supabase } from './supabase'

// Supabase logs in with email, so each admission number is turned into a
// hidden email. Students never see it.
const toEmail = (adm) =>
  adm.trim().toLowerCase().replace(/[^a-z0-9]/g, '-') + '@students.example.com'

async function getProfile(id) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (error) throw new Error('Could not load your profile.')
  return { id: data.id, admissionNo: data.admission_no, fullName: data.full_name, role: data.role }
}

export const api = {
  async currentUser() {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return null
    try { return await getProfile(data.session.user.id) } catch { return null }
  },

  async signup({ admissionNo, fullName, password }) {
    const adm = admissionNo.trim().toUpperCase()
    const { data, error } = await supabase.auth.signUp({ email: toEmail(adm), password })
    if (error) {
      if (/registered|exists/i.test(error.message))
        throw new Error('That admission number is already registered.')
      throw new Error(error.message)
    }
    if (!data.session)
      throw new Error('Turn off "Confirm email" in Supabase Authentication settings.')
    const { error: pErr } = await supabase.from('profiles').insert({
      id: data.user.id, admission_no: adm, full_name: fullName.trim(),
    })
    if (pErr) throw new Error('Could not save your profile: ' + pErr.message)
    return getProfile(data.user.id)
  },

  async login({ admissionNo, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: toEmail(admissionNo), password,
    })
    if (error) throw new Error('Admission number or password is incorrect.')
    return getProfile(data.user.id)
  },

  async logout() {
    await supabase.auth.signOut()
  },

  async listItems() {
    const { data, error } = await supabase
      .from('items')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data.map((i) => ({
      id: i.id, userId: i.user_id, posterName: i.profiles?.full_name || 'Unknown',
      type: i.type, title: i.title, description: i.description, location: i.location,
      imageUrl: i.image_url, status: i.status, createdAt: new Date(i.created_at).getTime(),
    }))
  },

  async createItem(user, { type, title, description, location, imageFile }) {
    let imageUrl = null
    if (imageFile) {
      const ext = imageFile.type === 'image/png' ? 'png' : 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('item-images').upload(path, imageFile, { contentType: imageFile.type })
      if (upErr) throw new Error('Image upload failed: ' + upErr.message)
      imageUrl = supabase.storage.from('item-images').getPublicUrl(path).data.publicUrl
    }
    const { error } = await supabase.from('items').insert({
      user_id: user.id, type, title, description, location, image_url: imageUrl,
    })
    if (error) throw new Error(error.message)
  },

  async resolveItem(id) {
    const { error } = await supabase.from('items').update({ status: 'resolved' }).eq('id', id)
    if (error) throw new Error(error.message)
  },

  async deleteItem(id) {
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) throw new Error(error.message)
  },
}