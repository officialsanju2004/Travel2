import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { LEAD_SOURCES, LEAD_STATUSES, PRIORITIES, TRIP_TYPES } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import { RiCloseLine, RiAddLine } from 'react-icons/ri'

export default function LeadFormModal({ onClose, users = [], editLead = null }) {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: editLead?.name||'', phone: editLead?.phone||'', email: editLead?.email||'', destination: editLead?.destination||'', travelDate: editLead?.travelDate?.split('T')[0]||'', budget: editLead?.budget||'', source: editLead?.source||'Website', status: editLead?.status||'New', priority: editLead?.priority||'Medium', numberOfTravelers: editLead?.numberOfTravelers||1, tripType: editLead?.tripType||'Package', notes: editLead?.notes||'', assignedTo: editLead?.assignedTo?._id||'' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const mutation = useMutation({
    mutationFn: (data) => editLead ? api.put(`/leads/${editLead._id}`, data) : api.post('/leads', data),
    onSuccess: () => { toast.success(editLead ? 'Lead updated' : 'Lead created'); queryClient.invalidateQueries(['leads']); onClose() },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to save')
  })

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal max-w-2xl w-full">
        <div className="flex items-center justify-between p-5 border-b border-ink-800">
          <div><h3 className="font-display font-bold text-ink-100 text-lg">{editLead ? 'Edit Lead' : 'New Lead'}</h3><p className="text-ink-500 text-xs mt-0.5">{editLead ? 'Update lead information' : 'Add a new customer lead to the pipeline'}</p></div>
          <button onClick={onClose} className="btn-icon"><RiCloseLine className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1"><label className="label">Full Name *</label><input required className="input" placeholder="Ahmed Al-Rashidi" value={form.name} onChange={e => set('name', e.target.value)} /></div>
            <div className="col-span-2 sm:col-span-1"><label className="label">Phone *</label><input required className="input" placeholder="+971 50 123 4567" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div><label className="label">Email</label><input type="email" className="input" placeholder="customer@email.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div><label className="label">Destination *</label><input required className="input" placeholder="Bali, Indonesia" value={form.destination} onChange={e => set('destination', e.target.value)} /></div>
            <div><label className="label">Travel Date</label><input type="date" className="input" value={form.travelDate} min={new Date().toISOString().split('T')[0]} onChange={e => set('travelDate', e.target.value)} /></div>
            <div><label className="label">Budget (USD)</label><div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500 text-sm font-bold">$</span><input type="number" className="input pl-7" placeholder="5000" min="0" value={form.budget} onChange={e => set('budget', e.target.value)} /></div></div>
            <div><label className="label">Travelers</label><input type="number" className="input" min="1" max="50" value={form.numberOfTravelers} onChange={e => set('numberOfTravelers', parseInt(e.target.value))} /></div>
            <div><label className="label">Trip Type</label><select className="input" value={form.tripType} onChange={e => set('tripType', e.target.value)}>{TRIP_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className="label">Lead Source</label><select className="input" value={form.source} onChange={e => set('source', e.target.value)}>{LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="label">Priority</label><select className="input" value={form.priority} onChange={e => set('priority', e.target.value)}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></div>
            {isAdmin && editLead && <div><label className="label">Status</label><select className="input" value={form.status} onChange={e => set('status', e.target.value)}>{LEAD_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>}
            {isAdmin && users.length > 0 && <div><label className="label">Assign To</label><select className="input" value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)}><option value="">Auto-assign</option>{users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}</select></div>}
          </div>
          <div><label className="label">Notes</label><textarea className="input resize-none" rows={3} placeholder="Additional notes about this lead..." value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
        </div>
        <div className="flex gap-3 p-5 border-t border-ink-800">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => mutation.mutate(form)} disabled={!form.name || !form.phone || !form.destination || mutation.isPending} className="btn-primary flex-1 disabled:opacity-50">
            {mutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><RiAddLine className="w-4 h-4" />{editLead ? 'Update Lead' : 'Create Lead'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}
