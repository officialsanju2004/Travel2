import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { STATUS_CONFIG, LEAD_STATUSES, ACTIVITY_CONFIG, PRIORITY_CONFIG, formatDate, formatDateTime, formatCurrency, getInitials, timeAgo, PRIORITIES } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import PaymentPanel from '../components/billing/PaymentPanel'
import {
  RiArrowLeftLine, RiPhoneLine, RiMailLine, RiMapPinLine, RiCalendarLine,
  RiMoneyDollarCircleLine, RiUserLine, RiDeleteBinLine, RiEditLine,
  RiSendPlaneLine, RiCheckLine, RiCloseLine, RiTimeLine, RiFileTextLine,
  RiPhoneFill, RiMailFill, RiTeamLine, RiPushpinLine, RiMore2Line,
  RiHistoryLine
} from 'react-icons/ri'

const ActivityIcon = ({ type }) => {
  const icons = {
    call: <RiPhoneFill className="w-3.5 h-3.5" />,
    email: <RiMailFill className="w-3.5 h-3.5" />,
    note: <RiFileTextLine className="w-3.5 h-3.5" />,
    meeting: <RiTeamLine className="w-3.5 h-3.5" />,
    status_change: <RiCheckLine className="w-3.5 h-3.5" />,
    assignment: <RiUserLine className="w-3.5 h-3.5" />,
    follow_up: <RiTimeLine className="w-3.5 h-3.5" />,
    system: <RiMore2Line className="w-3.5 h-3.5" />,
  }
  const cfg = ACTIVITY_CONFIG[type] || ACTIVITY_CONFIG.note
  return (
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
      {icons[type] || icons.note}
    </div>
  )
}

export default function LeadDetailPage() {
  const { id } = useParams()
  const { isAdmin, user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [activityForm, setActivityForm] = useState({ type: 'note', content: '', followUpDate: '' })
  const [editMode, setEditMode] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => api.get(`/leads/${id}`).then(r => r.data)
  })

  const { data: usersData } = useQuery({
    queryKey: ['salesUsers'],
    queryFn: () => api.get('/users', { params: { role: 'sales', isActive: true } }).then(r => r.data),
    enabled: isAdmin
  })

  const updateMutation = useMutation({
    mutationFn: (updates) => api.put(`/leads/${id}`, updates),
    onSuccess: () => { toast.success('Updated'); queryClient.invalidateQueries(['lead', id]) },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed')
  })

  const assignMutation = useMutation({
    mutationFn: (assignedTo) => api.patch(`/leads/${id}/assign`, { assignedTo }),
    onSuccess: () => { toast.success('Lead reassigned'); queryClient.invalidateQueries(['lead', id]) }
  })

  const addActivityMutation = useMutation({
    mutationFn: (data) => api.post(`/activities/lead/${id}`, data),
    onSuccess: () => {
      toast.success('Activity logged')
      setActivityForm({ type: 'note', content: '', followUpDate: '' })
      queryClient.invalidateQueries(['lead', id])
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed')
  })

  const handleDelete = async () => {
    if (!confirm('Permanently delete this lead?')) return
    try {
      await api.delete(`/leads/${id}`)
      toast.success('Lead deleted')
      navigate('/leads')
    } catch { toast.error('Delete failed') }
  }

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-azure-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!data?.lead) return (
    <div className="text-center py-16">
      <RiFileTextLine className="w-12 h-12 text-ink-700 mx-auto mb-3" />
      <p className="text-ink-400 font-display">Lead not found</p>
      <Link to="/leads" className="text-azure-400 text-sm mt-2 inline-block hover:underline">Back to Leads</Link>
    </div>
  )

  const { lead, activities } = data
  const statusCfg = STATUS_CONFIG[lead.status] || {}
  const priorityCfg = PRIORITY_CONFIG[lead.priority] || {}

  return (
    <div className="space-y-5 animate-fade-in max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/leads" className="btn-icon flex-shrink-0">
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-display font-bold text-xl text-ink-100 truncate">{lead.name}</h1>
              <span className={`badge ${statusCfg.color}`}>
                <span className={`status-dot ${statusCfg.dot}`} />
                {lead.status}
              </span>
              <span className={`badge ${priorityCfg.color}`}>{lead.priority}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-ink-500">
              <span className="flex items-center gap-1"><RiMapPinLine className="w-3 h-3" />{lead.destination}</span>
              <span className="flex items-center gap-1"><RiCalendarLine className="w-3 h-3" />Created {formatDate(lead.createdAt)}</span>
            </div>
          </div>
        </div>
        {isAdmin && (
          <button onClick={handleDelete} className="btn-danger text-sm flex-shrink-0">
            <RiDeleteBinLine className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}
      </div>

      {/* Quick contact bar */}
      <div className="card p-3 flex flex-wrap items-center gap-2">
        <a href={`tel:${lead.phone}`} className="btn-secondary text-xs py-2 flex items-center gap-1.5">
          <RiPhoneLine className="w-3.5 h-3.5 text-emerald-400" />{lead.phone}
        </a>
        {lead.email && (
          <a href={`mailto:${lead.email}`} className="btn-secondary text-xs py-2 flex items-center gap-1.5">
            <RiMailLine className="w-3.5 h-3.5 text-azure-400" />{lead.email}
          </a>
        )}
        <div className="flex-1" />
        <div className="text-xs text-ink-500 font-mono">#{id.slice(-8).toUpperCase()}</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left */}
        <div className="xl:col-span-2 space-y-5">
          {/* Status update */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest mb-3">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              {LEAD_STATUSES.map(s => {
                const cfg = STATUS_CONFIG[s]
                const isActive = lead.status === s
                return (
                  <button
                    key={s}
                    onClick={() => !isActive && updateMutation.mutate({ status: s })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-display font-semibold border transition-all duration-200 ${isActive ? cfg.color : 'border-ink-700 text-ink-500 hover:border-ink-500 hover:text-ink-300'}`}
                  >
                    {isActive && <span className={`status-dot ${cfg.dot} mr-1.5`} />}
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lead info */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest mb-4">Lead Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Phone', value: lead.phone, icon: RiPhoneLine },
                { label: 'Email', value: lead.email || '—', icon: RiMailLine },
                { label: 'Destination', value: lead.destination, icon: RiMapPinLine },
                { label: 'Travel Date', value: formatDate(lead.travelDate), icon: RiCalendarLine },
                { label: 'Budget', value: formatCurrency(lead.budget), icon: RiMoneyDollarCircleLine },
                { label: 'Travelers', value: lead.numberOfTravelers, icon: RiUserLine },
                { label: 'Trip Type', value: lead.tripType, icon: RiFileTextLine },
                { label: 'Source', value: lead.source, icon: RiSendPlaneLine },
                { label: 'Revenue', value: formatCurrency(lead.revenue), icon: RiMoneyDollarCircleLine },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3 h-3 text-ink-600" />
                    <span className="text-xs text-ink-600 font-display font-semibold uppercase tracking-wider">{label}</span>
                  </div>
                  <div className="text-sm font-medium text-ink-200">{value}</div>
                </div>
              ))}
            </div>
            {lead.notes && (
              <div className="mt-4 pt-4 border-t border-ink-800">
                <div className="text-xs text-ink-600 font-display font-semibold uppercase tracking-wider mb-2">Notes</div>
                <p className="text-sm text-ink-300 bg-ink-800/60 p-3 rounded-xl leading-relaxed">{lead.notes}</p>
              </div>
            )}
          </div>

          {/* Revenue field for agent */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest mb-3">Deal Revenue & Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Deal Revenue (USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500 text-sm font-bold">$</span>
                  <input type="number" className="input pl-7" defaultValue={lead.revenue} placeholder="0"
                    onBlur={e => updateMutation.mutate({ revenue: parseFloat(e.target.value) || 0 })} />
                </div>
                <p className="text-xs text-ink-600 mt-1">Enter when deal is confirmed</p>
              </div>
              <div>
                <label className="label">Follow-up Date</label>
                <input type="date" className="input" defaultValue={lead.followUpDate ? lead.followUpDate.split('T')[0] : ''}
                  onBlur={e => updateMutation.mutate({ followUpDate: e.target.value })} />
              </div>
              {isAdmin && (
                <div>
                  <label className="label">Priority</label>
                  <select className="input" value={lead.priority} onChange={e => updateMutation.mutate({ priority: e.target.value })}>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Payments */}
          <PaymentPanel leadId={id} lead={{ ...lead, assignedTo: lead.assignedTo }} />

          {/* Add Activity */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest mb-4">Log Activity</h3>
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {['note', 'call', 'email', 'meeting', 'follow_up'].map(t => {
                  const cfg = ACTIVITY_CONFIG[t]
                  return (
                    <button key={t}
                      onClick={() => setActivityForm(p => ({ ...p, type: t }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-display font-semibold border transition-all ${activityForm.type === t ? `${cfg.color} border-current` : 'border-ink-700 text-ink-500 hover:border-ink-500'}`}
                    >
                      {t.replace('_', ' ')}
                    </button>
                  )
                })}
              </div>
              <textarea
                className="input resize-none text-sm" rows={3}
                placeholder="Describe what happened, what was discussed, next steps..."
                value={activityForm.content}
                onChange={e => setActivityForm(p => ({ ...p, content: e.target.value }))}
              />
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="label">Follow-up Date</label>
                  <input type="date" className="input text-sm" value={activityForm.followUpDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setActivityForm(p => ({ ...p, followUpDate: e.target.value }))} />
                </div>
                <button
                  onClick={() => activityForm.content.trim() && addActivityMutation.mutate(activityForm)}
                  disabled={!activityForm.content.trim() || addActivityMutation.isPending}
                  className="btn-primary disabled:opacity-50"
                >
                  {addActivityMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><RiSendPlaneLine className="w-4 h-4" /><span>Log</span></>}
                </button>
              </div>
            </div>
          </div>

          {/* Activity History */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <RiHistoryLine className="w-4 h-4 text-ink-500" />
              <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest">Activity History</h3>
              <span className="badge bg-ink-800 text-ink-400 text-xs ml-auto">{activities?.length || 0}</span>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {!activities?.length ? (
                <div className="text-center py-8 text-ink-600">
                  <RiHistoryLine className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No activity yet</p>
                </div>
              ) : activities.map((activity, i) => (
                <div key={activity._id} className={`flex gap-3 ${i !== activities.length - 1 ? 'pb-3 border-b border-ink-800/50' : ''}`}>
                  <ActivityIcon type={activity.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-display font-semibold text-ink-300">{activity.user?.name || 'System'}</span>
                      <span className="text-xs text-ink-600 flex-shrink-0">{timeAgo(activity.createdAt)}</span>
                    </div>
                    <p className="text-sm text-ink-400 mt-0.5 leading-relaxed">{activity.content}</p>
                    {activity.previousStatus && activity.newStatus && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`badge text-xs ${STATUS_CONFIG[activity.previousStatus]?.color}`}>{activity.previousStatus}</span>
                        <span className="text-ink-600 text-xs">→</span>
                        <span className={`badge text-xs ${STATUS_CONFIG[activity.newStatus]?.color}`}>{activity.newStatus}</span>
                      </div>
                    )}
                    {activity.followUpDate && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-teal-400">
                        <RiTimeLine className="w-3 h-3" /> Follow-up: {formatDate(activity.followUpDate)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Assigned agent */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest mb-4">Assigned Agent</h3>
            {lead.assignedTo ? (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-azure-600 to-indigo-600 flex items-center justify-center text-white font-display font-bold">
                  {getInitials(lead.assignedTo.name)}
                </div>
                <div>
                  <div className="font-display font-semibold text-ink-100">{lead.assignedTo.name}</div>
                  <div className="text-xs text-ink-500">{lead.assignedTo.email}</div>
                  {lead.assignedTo.phone && <div className="text-xs text-ink-500">{lead.assignedTo.phone}</div>}
                </div>
              </div>
            ) : (
              <div className="text-sm text-ink-500 mb-4 text-center py-3 bg-ink-800/50 rounded-xl">No agent assigned</div>
            )}
            {isAdmin && (
              <div>
                <label className="label">Reassign to</label>
                <select className="input text-sm" value={lead.assignedTo?._id || ''}
                  onChange={e => e.target.value && assignMutation.mutate(e.target.value)}>
                  <option value="">Select agent...</option>
                  {(usersData?.users || []).map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Lead meta */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest mb-3">Lead Info</h3>
            <div className="space-y-3">
              {[
                { label: 'Lead ID', value: `#${id.slice(-8).toUpperCase()}` },
                { label: 'Source', value: lead.source },
                { label: 'Trip Type', value: lead.tripType },
                { label: 'Created', value: formatDateTime(lead.createdAt) },
                { label: 'Last Update', value: formatDateTime(lead.updatedAt) },
                { label: 'Assigned', value: lead.assignedAt ? formatDate(lead.assignedAt) : '—' },
                { label: 'Follow-up', value: lead.followUpDate ? formatDate(lead.followUpDate) : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-2">
                  <span className="text-xs text-ink-600">{label}</span>
                  <span className="text-xs font-medium text-ink-300 text-right font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {lead.tags?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {lead.tags.map(tag => (
                  <span key={tag} className="badge bg-ink-800 text-ink-400 border border-ink-700">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
