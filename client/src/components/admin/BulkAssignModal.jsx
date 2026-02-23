import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { RiUserLine, RiCloseLine, RiCheckLine } from 'react-icons/ri'

export default function BulkAssignModal({ leadIds, users, onClose }) {
  const queryClient = useQueryClient()
  const [assignedTo, setAssignedTo] = useState('auto')

  const mutation = useMutation({
    mutationFn: () => api.post('/leads/bulk-assign', { leadIds, assignedTo }),
    onSuccess: () => { toast.success(`${leadIds.length} leads assigned`); queryClient.invalidateQueries(['leads']); onClose() },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed')
  })

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-ink-800">
          <div><h3 className="font-display font-bold text-ink-100">Bulk Assign Leads</h3><p className="text-ink-500 text-xs mt-0.5">{leadIds.length} leads selected</p></div>
          <button onClick={onClose} className="btn-icon"><RiCloseLine className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 p-3 bg-azure-500/8 border border-azure-500/20 rounded-xl">
            <RiUserLine className="w-4 h-4 text-azure-400" />
            <span className="text-azure-300 text-sm">{leadIds.length} leads will be assigned</span>
          </div>
          <div>
            <label className="label">Assign To</label>
            <select className="input" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
              <option value="auto">Auto-distribute equally among all agents</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          {assignedTo === 'auto' && (
            <div className="p-3 bg-ink-800/60 border border-ink-700 rounded-xl text-xs text-ink-500">
              Each of the {users.length} active agents will receive approximately {Math.ceil(leadIds.length / Math.max(users.length, 1))} leads each.
            </div>
          )}
        </div>
        <div className="flex gap-3 p-5 border-t border-ink-800">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary flex-1">
            {mutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><RiCheckLine className="w-4 h-4" />Assign Leads</>}
          </button>
        </div>
      </div>
    </div>
  )
}
