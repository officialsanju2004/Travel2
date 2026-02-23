import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { formatCurrency, STATUS_CONFIG, getInitials, formatDate, CHART_COLORS } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import { RiUserAddLine, RiLineChartLine, RiMoneyDollarCircleLine, RiTimeLine, RiArrowRightLine, RiPulseLine } from 'react-icons/ri'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-800 border border-ink-700 rounded-xl p-3 shadow-modal text-xs">
      <p className="text-ink-400 mb-1.5 font-display font-semibold">{label}</p>
      {payload.map((p, i) => <div key={i} className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: p.color }} /><span className="text-ink-300">{p.name}: <strong className="text-ink-100">{p.value}</strong></span></div>)}
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({ queryKey: ['adminDashboard'], queryFn: () => api.get('/dashboard/admin').then(r => r.data.stats), refetchInterval: 60000 })

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-azure-500 border-t-transparent rounded-full animate-spin" /></div>

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const trendData = (data?.monthlyTrend || []).map(m => ({ month: monthNames[m._id.month-1], Leads: m.count, Confirmed: m.converted }))
  const statusData = Object.entries(data?.statusCounts || {}).map(([name, value]) => ({ name, value }))

  const stats = [
    { label: 'Total Leads', value: data?.totalLeads || 0, sub: 'All time', icon: RiPulseLine, color: 'text-azure-400', bg: 'bg-azure-500/10 border-azure-500/20' },
    { label: 'Confirmed', value: data?.confirmedLeads || 0, sub: `${data?.conversionRate || 0}% rate`, icon: RiLineChartLine, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Total Revenue', value: formatCurrency(data?.totalRevenue), sub: 'Confirmed deals', icon: RiMoneyDollarCircleLine, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Follow-ups Due', value: data?.upcomingFollowUps?.length || 0, sub: 'Next 7 days', icon: RiTimeLine, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title text-2xl">Overview</h1>
          <p className="section-sub">Good day, {user?.name?.split(' ')[0]}. Here's your agency snapshot.</p>
        </div>
        <Link to="/leads" className="btn-primary text-sm"><RiUserAddLine className="w-4 h-4" />Add Lead</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`card border ${s.bg} p-5 animate-slide-up`} style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-ink-500 font-display font-semibold uppercase tracking-widest">{s.label}</p>
                <p className="text-2xl font-display font-bold text-ink-100 mt-1">{s.value}</p>
                <p className="text-xs text-ink-600 mt-1">{s.sub}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl ${s.bg} border flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest mb-5">Lead Acquisition Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
                <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Leads" stroke="#0ea5e9" strokeWidth={2} fill="url(#lg1)" dot={false} />
              <Area type="monotone" dataKey="Confirmed" stroke="#10b981" strokeWidth={2} fill="url(#lg2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest mb-4">Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
              {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie><Tooltip content={<CustomTooltip />} /></PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {statusData.slice(0, 5).map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i] }} /><span className="text-ink-500">{s.name}</span></div>
                <span className="font-semibold text-ink-300">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-ink-800">
            <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest">Team Performance</h3>
            <Link to="/reports" className="text-xs text-azure-400 hover:underline flex items-center gap-1">Full Report <RiArrowRightLine className="w-3 h-3" /></Link>
          </div>
          <div className="p-4 space-y-3">
            {(data?.leadsPerAgent || []).slice(0, 5).map(agent => {
              const conv = agent.count > 0 ? Math.round((agent.converted / agent.count) * 100) : 0
              return (
                <div key={agent._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-azure-600 to-indigo-600 flex items-center justify-center text-white text-xs font-display font-bold flex-shrink-0">{agent.user?.name?.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-display font-semibold text-ink-200 truncate">{agent.user?.name}</span>
                      <span className="text-xs text-ink-500 ml-2">{agent.count} leads</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-ink-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-azure-600 to-emerald-500" style={{ width: `${conv}%` }} />
                      </div>
                      <span className="text-xs text-emerald-400 font-semibold w-8 text-right">{conv}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-ink-800">
            <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest">Recent Leads</h3>
            <Link to="/leads" className="text-xs text-azure-400 hover:underline flex items-center gap-1">All Leads <RiArrowRightLine className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-ink-800/60">
            {(data?.recentLeads || []).slice(0, 6).map(lead => {
              const cfg = STATUS_CONFIG[lead.status] || {}
              return (
                <Link key={lead._id} to={`/leads/${lead._id}`} className="flex items-center justify-between px-4 py-3 hover:bg-ink-800/40 transition-colors group">
                  <div className="min-w-0">
                    <div className="text-sm font-display font-medium text-ink-200 group-hover:text-azure-400 transition-colors truncate">{lead.name}</div>
                    <div className="text-xs text-ink-600">{lead.destination}</div>
                  </div>
                  <span className={`badge text-xs ml-2 flex-shrink-0 ${cfg.color}`}>{lead.status}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
