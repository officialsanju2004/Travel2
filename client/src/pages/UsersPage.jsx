import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { getInitials, formatDate } from '../utils/helpers'
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiUserLine, RiSearchLine, RiToggleLine, RiToggleFill } from 'react-icons/ri'

const UserModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({ name: user?.name||'', email: user?.email||'', phone: user?.phone||'', role: user?.role||'sales', password: '', isActive: user?.isActive!==false })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (user?._id) { await api.put(`/users/${user._id}`, payload); toast.success('User updated') }
      else { await api.post('/users', payload); toast.success('User created') }
      onSave(); onClose()
    } catch (e) { toast.error(e.response?.data?.message || 'Error') } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-ink-800">
          <h3 className="font-display font-bold text-ink-100">{user ? 'Edit User' : 'Add Team Member'}</h3>
          <button onClick={onClose} className="btn-icon"><span className="text-lg">×</span></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div><label className="label">Full Name</label><input required className="input" placeholder="John Smith" value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div><label className="label">Email</label><input required type="email" className="input" placeholder="john@agency.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          <div><label className="label">Phone</label><input className="input" placeholder="+1 555 000 0000" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Role</label><select className="input" value={form.role} onChange={e => set('role', e.target.value)}><option value="sales">Sales Agent</option><option value="admin">Administrator</option></select></div>
            <div><label className="label">Status</label><select className="input" value={form.isActive?'true':'false'} onChange={e => set('isActive', e.target.value==='true')}><option value="true">Active</option><option value="false">Inactive</option></select></div>
          </div>
          <div><label className="label">{user ? 'New Password (leave blank to keep)' : 'Password *'}</label><input type="password" className="input" placeholder={user ? 'Leave blank to keep current' : 'Min 6 characters'} value={form.password} onChange={e => set('password', e.target.value)} minLength={form.password?6:undefined} required={!user} /></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : user ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [editUser, setEditUser] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['users', search], queryFn: () => api.get('/users', { params: { search } }).then(r => r.data) })

  const deleteMutation = useMutation({ mutationFn: (id) => api.delete(`/users/${id}`), onSuccess: () => { toast.success('User deleted'); queryClient.invalidateQueries(['users']) }, onError: (e) => toast.error(e.response?.data?.message || 'Cannot delete') })
  const toggleMutation = useMutation({ mutationFn: (id) => api.patch(`/users/${id}/toggle-status`), onSuccess: () => { toast.success('Status updated'); queryClient.invalidateQueries(['users']) } })

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">Sales Team</h1>
          <p className="section-sub">{data?.users?.length || 0} members</p>
        </div>
        <button onClick={() => { setEditUser(null); setShowForm(true) }} className="btn-primary text-sm"><RiAddLine className="w-4 h-4" />Add Member</button>
      </div>
      <div className="card p-4"><div className="relative max-w-sm"><RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" /><input className="input pl-10 text-sm" placeholder="Search team..." value={search} onChange={e => setSearch(e.target.value)} /></div></div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? Array.from({length:6}).map((_, i) => <div key={i} className="card p-5 animate-pulse"><div className="flex gap-3 mb-4"><div className="w-12 h-12 skeleton rounded-xl"/><div className="flex-1 space-y-2"><div className="skeleton h-4 rounded w-3/4"/><div className="skeleton h-3 rounded w-1/2"/></div></div></div>)
        : data?.users?.map(u => (
          <div key={u._id} className="card p-5 hover:border-ink-700 transition-all animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg ${u.role==='admin'?'bg-gradient-to-br from-amber-500 to-orange-600':'bg-gradient-to-br from-azure-600 to-indigo-600'}`}>{getInitials(u.name)}</div>
                <div><div className="font-display font-bold text-ink-100">{u.name}</div><div className="text-xs text-ink-500">{u.email}</div></div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`badge text-xs ${u.role==='admin'?'bg-amber-500/15 text-amber-400 border border-amber-500/20':'bg-azure-500/15 text-azure-400 border border-azure-500/20'}`}>{u.role==='admin'?'Admin':'Sales'}</span>
                <span className={`badge text-xs ${u.isActive?'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20':'bg-rose-500/15 text-rose-400 border border-rose-500/20'}`}>{u.isActive?'Active':'Inactive'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-ink-800/60 border border-ink-700/50 rounded-xl p-3 text-center"><div className="font-display font-bold text-ink-100 text-xl">{u.leadCount||0}</div><div className="text-xs text-ink-600 mt-0.5">Total Leads</div></div>
              <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-3 text-center"><div className="font-display font-bold text-emerald-400 text-xl">{u.convertedCount||0}</div><div className="text-xs text-ink-600 mt-0.5">Converted</div></div>
            </div>
            {u.phone && <div className="text-xs text-ink-600 mb-3">{u.phone}</div>}
            <div className="flex gap-2">
              <button onClick={() => { setEditUser(u); setShowForm(true) }} className="btn-secondary flex-1 text-xs py-2"><RiEditLine className="w-3.5 h-3.5" />Edit</button>
              <button onClick={() => toggleMutation.mutate(u._id)} className={`flex-1 text-xs py-2 rounded-xl font-display font-semibold transition-all flex items-center justify-center gap-1.5 ${u.isActive?'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20':'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}>{u.isActive?'Deactivate':'Activate'}</button>
              <button onClick={() => { if(confirm(`Delete ${u.name}?`)) deleteMutation.mutate(u._id) }} className="btn-icon p-2 hover:text-rose-400 hover:bg-rose-500/10"><RiDeleteBinLine className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {(showForm || editUser) && <UserModal user={editUser} onClose={() => { setShowForm(false); setEditUser(null) }} onSave={() => queryClient.invalidateQueries(['users'])} />}
    </div>
  )
}
