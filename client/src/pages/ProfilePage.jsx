import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { getInitials, formatDate } from '../utils/helpers'
import { RiSaveLine, RiLockPasswordLine, RiUserLine, RiShieldCheckLine } from 'react-icons/ri'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/users/${user.id}`, data),
    onSuccess: (res) => { toast.success('Profile updated'); updateUser({ ...user, ...res.data.user }) },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed')
  })

  const passwordMutation = useMutation({
    mutationFn: (data) => api.put('/auth/password', data),
    onSuccess: () => { toast.success('Password changed successfully'); setPassForm({ currentPassword: '', newPassword: '', confirm: '' }) },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to change password')
  })

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirm) { toast.error('Passwords do not match'); return }
    if (passForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
    passwordMutation.mutate({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
  }

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div>
        <h1 className="section-title text-2xl">My Profile</h1>
        <p className="section-sub">Manage your account settings and security</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-ink-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-azure-600 to-indigo-600 flex items-center justify-center text-white text-xl font-display font-bold">{getInitials(user?.name)}</div>
          <div>
            <div className="font-display font-bold text-xl text-ink-100">{user?.name}</div>
            <div className="text-ink-500 text-sm">{user?.email}</div>
            <span className={`badge text-xs mt-1.5 ${user?.role==='admin'?'bg-amber-500/15 text-amber-400 border border-amber-500/20':'bg-azure-500/15 text-azure-400 border border-azure-500/20'}`}>{user?.role==='admin'?'Administrator':'Sales Agent'}</span>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form) }} className="space-y-4">
          <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest flex items-center gap-2"><RiUserLine className="w-4 h-4" />Personal Information</h3>
          <div><label className="label">Full Name</label><input className="input" value={form.name} onChange={e => setForm(p => ({...p,name:e.target.value}))} required /></div>
          <div><label className="label">Email Address <span className="text-ink-700 font-normal normal-case tracking-normal">(read only)</span></label><input className="input opacity-50 cursor-not-allowed" value={user?.email} readOnly /></div>
          <div><label className="label">Phone Number</label><input className="input" value={form.phone} onChange={e => setForm(p => ({...p,phone:e.target.value}))} placeholder="+1 555 000 0000" /></div>
          <button type="submit" disabled={updateMutation.isPending} className="btn-primary text-sm">
            <RiSaveLine className="w-4 h-4" />{updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest flex items-center gap-2"><RiLockPasswordLine className="w-4 h-4" />Change Password</h3>
          <div><label className="label">Current Password</label><input type="password" className="input" value={passForm.currentPassword} onChange={e => setPassForm(p=>({...p,currentPassword:e.target.value}))} required /></div>
          <div><label className="label">New Password</label><input type="password" className="input" value={passForm.newPassword} onChange={e => setPassForm(p=>({...p,newPassword:e.target.value}))} required minLength={6} /></div>
          <div><label className="label">Confirm New Password</label><input type="password" className="input" value={passForm.confirm} onChange={e => setPassForm(p=>({...p,confirm:e.target.value}))} required /></div>
          <button type="submit" disabled={passwordMutation.isPending} className="btn-secondary text-sm">
            <RiShieldCheckLine className="w-4 h-4" />{passwordMutation.isPending ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest mb-4">Account Information</h3>
        <div className="space-y-3 divide-y divide-ink-800">
          {[['User ID', user?.id?.slice(-8).toUpperCase()], ['Account Role', user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)], ['Account Status', user?.isActive ? 'Active' : 'Inactive'], ['Last Login', formatDate(user?.lastLogin)]].map(([label, value]) => (
            <div key={label} className="flex justify-between py-2.5 first:pt-0 last:pb-0">
              <span className="text-sm text-ink-500">{label}</span>
              <span className="text-sm font-display font-semibold text-ink-300">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
