import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { STATUS_CONFIG, LEAD_STATUSES, LEAD_SOURCES, formatDate, formatCurrency, getInitials } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import LeadFormModal from '../components/shared/LeadFormModal'
import BulkAssignModal from '../components/admin/BulkAssignModal'
import { RiAddLine, RiSearchLine, RiDeleteBinLine, RiEyeLine, RiFilterLine, RiUserLine, RiCloseLine } from 'react-icons/ri'

export default function LeadsPage() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({ status: '', source: '', search: '', page: 1, assignedTo: '' })
  const [selected, setSelected] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showBulkAssign, setShowBulkAssign] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['leads', filters],
    queryFn: () => api.get('/leads', { params: { ...filters, limit: 20 } }).then(r => r.data),
    keepPreviousData: true
  })

  const { data: usersData } = useQuery({
    queryKey: ['salesUsers'],
    queryFn: () => api.get('/users', { params: { role: 'sales', isActive: true } }).then(r => r.data),
    enabled: isAdmin
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/leads/${id}`),
    onSuccess: () => { toast.success('Lead deleted'); queryClient.invalidateQueries(['leads']) },
    onError: () => toast.error('Delete failed')
  })

  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]: val, page: 1 }))
  const hasFilters = filters.status || filters.source || filters.search || filters.assignedTo

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title text-2xl">{isAdmin ? 'All Leads' : 'My Leads'}</h1>
          <p className="section-sub">{data?.pagination?.total || 0} leads total</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && selected.length > 0 && (
            <button onClick={() => setShowBulkAssign(true)} className="btn-secondary text-sm">
              <RiUserLine className="w-4 h-4" /> Assign ({selected.length})
            </button>
          )}
          {isAdmin && <button onClick={() => setShowForm(true)} className="btn-primary text-sm"><RiAddLine className="w-4 h-4" />New Lead</button>}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input className="input pl-10 text-sm" placeholder="Search by name, phone, destination..." value={filters.search} onChange={e => setFilter('search', e.target.value)} />
          </div>
          <select className="input w-auto min-w-36 text-sm" value={filters.source} onChange={e => setFilter('source', e.target.value)}>
            <option value="">All Sources</option>
            {LEAD_SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
          {isAdmin && (
            <select className="input w-auto min-w-36 text-sm" value={filters.assignedTo} onChange={e => setFilter('assignedTo', e.target.value)}>
              <option value="">All Agents</option>
              <option value="unassigned">Unassigned</option>
              {(usersData?.users || []).map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          )}
          {hasFilters && (
            <button onClick={() => setFilters({ status: '', source: '', search: '', page: 1, assignedTo: '' })} className="btn-ghost text-sm">
              <RiCloseLine className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
        {/* Status pills */}
        <div className="flex gap-2 flex-wrap">
          {['', ...LEAD_STATUSES].map(s => {
            const cfg = s ? STATUS_CONFIG[s] : null
            const isActive = filters.status === s
            return (
              <button key={s} onClick={() => setFilter('status', s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-semibold border transition-all ${isActive ? (cfg ? cfg.color : 'bg-ink-700 text-ink-200 border-ink-600') : 'border-ink-800 text-ink-600 hover:border-ink-700 hover:text-ink-400'}`}>
                {s ? <><span className={`status-dot ${cfg?.dot} mr-1.5`} />{s}</> : 'All'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-800">
                {isAdmin && <th className="table-header w-10"><input type="checkbox" className="rounded border-ink-600 bg-ink-800 accent-azure-500"
                  checked={selected.length === data?.leads?.length && data?.leads?.length > 0}
                  onChange={e => setSelected(e.target.checked ? (data?.leads || []).map(l => l._id) : [])} /></th>}
                <th className="table-header text-left">Lead</th>
                <th className="table-header text-left hidden md:table-cell">Destination</th>
                <th className="table-header text-left">Status</th>
                <th className="table-header text-left hidden lg:table-cell">Budget</th>
                <th className="table-header text-left hidden xl:table-cell">Source</th>
                {isAdmin && <th className="table-header text-left hidden lg:table-cell">Agent</th>}
                <th className="table-header text-left hidden sm:table-cell">Date</th>
                <th className="table-header" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-ink-800/50">
                  {Array.from({ length: 7 }).map((_, j) => <td key={j} className="table-cell"><div className="skeleton h-4 rounded" /></td>)}
                </tr>
              )) : !data?.leads?.length ? (
                <tr><td colSpan={9} className="text-center py-16">
                  <RiFilterLine className="w-10 h-10 text-ink-700 mx-auto mb-3" />
                  <p className="text-ink-500 font-display font-semibold">No leads found</p>
                  <p className="text-ink-700 text-sm mt-1">Try adjusting your filters</p>
                </td></tr>
              ) : data.leads.map(lead => {
                const cfg = STATUS_CONFIG[lead.status] || {}
                const isSelected = selected.includes(lead._id)
                return (
                  <tr key={lead._id} className={`table-row ${isSelected ? 'bg-azure-500/5' : ''}`}>
                    {isAdmin && <td className="table-cell w-10"><input type="checkbox" className="rounded border-ink-600 bg-ink-800 accent-azure-500" checked={isSelected} onChange={() => setSelected(prev => prev.includes(lead._id) ? prev.filter(i => i !== lead._id) : [...prev, lead._id])} /></td>}
                    <td className="table-cell">
                      <Link to={`/leads/${lead._id}`} className="group">
                        <div className="font-display font-semibold text-ink-200 group-hover:text-azure-400 transition-colors text-sm">{lead.name}</div>
                        <div className="text-xs text-ink-600">{lead.phone}</div>
                      </Link>
                    </td>
                    <td className="table-cell hidden md:table-cell"><span className="text-sm text-ink-400">{lead.destination}</span></td>
                    <td className="table-cell"><span className={`badge text-xs ${cfg.color}`}><span className={`status-dot ${cfg.dot}`} />{lead.status}</span></td>
                    <td className="table-cell hidden lg:table-cell"><span className="text-sm font-display font-semibold text-ink-300">{formatCurrency(lead.budget)}</span></td>
                    <td className="table-cell hidden xl:table-cell"><span className="text-xs text-ink-500">{lead.source}</span></td>
                    {isAdmin && <td className="table-cell hidden lg:table-cell">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-azure-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">{lead.assignedTo?.name?.charAt(0)}</div>
                          <span className="text-xs text-ink-400 truncate max-w-24">{lead.assignedTo?.name?.split(' ')[0]}</span>
                        </div>
                      ) : <span className="text-xs text-ink-700">Unassigned</span>}
                    </td>}
                    <td className="table-cell hidden sm:table-cell"><span className="text-xs text-ink-600">{formatDate(lead.createdAt)}</span></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <Link to={`/leads/${lead._id}`} className="btn-icon p-1.5" title="View"><RiEyeLine className="w-3.5 h-3.5" /></Link>
                        {isAdmin && <button onClick={() => { if (confirm('Delete this lead?')) deleteMutation.mutate(lead._id) }} className="btn-icon p-1.5 hover:text-rose-400 hover:bg-rose-500/10" title="Delete"><RiDeleteBinLine className="w-3.5 h-3.5" /></button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ink-800">
            <span className="text-xs text-ink-500">Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} total)</span>
            <div className="flex gap-2">
              <button disabled={filters.page <= 1} onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Prev</button>
              <button disabled={filters.page >= data.pagination.pages} onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {showForm && <LeadFormModal onClose={() => setShowForm(false)} users={usersData?.users || []} />}
      {showBulkAssign && <BulkAssignModal leadIds={selected} users={usersData?.users || []} onClose={() => { setShowBulkAssign(false); setSelected([]) }} />}
    </div>
  )
}
