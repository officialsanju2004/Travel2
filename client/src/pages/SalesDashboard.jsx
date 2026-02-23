import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { formatCurrency, STATUS_CONFIG, formatDate, CHART_COLORS } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { RiLineChartLine, RiMoneyDollarCircleLine, RiTimeLine, RiArrowRightLine, RiPulseLine, RiCalendarCheckLine } from 'react-icons/ri'

export default function SalesDashboard() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({ queryKey: ['salesDashboard'], queryFn: () => api.get('/dashboard/sales').then(r => r.data.stats), refetchInterval: 60000 })

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-azure-500 border-t-transparent rounded-full animate-spin" /></div>

  const statusData = Object.entries(data?.statusCounts || {}).map(([name, value]) => ({ name, value }))

  const stats = [
    { label: 'My Leads', value: data?.myLeads || 0, icon: RiPulseLine, color: 'text-azure-400', bg: 'bg-azure-500/10 border-azure-500/20' },
    { label: 'Converted', value: data?.myConverted || 0, icon: RiLineChartLine, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'My Revenue', value: formatCurrency(data?.myRevenue), icon: RiMoneyDollarCircleLine, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Conversion', value: `${data?.conversionRate || 0}%`, icon: RiLineChartLine, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title text-2xl">My Dashboard</h1>
        <p className="section-sub">Welcome back, {user?.name?.split(' ')[0]}. Stay on top of your pipeline.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`card border ${s.bg} p-5 animate-slide-up`} style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-ink-500 font-display font-semibold uppercase tracking-widest">{s.label}</p>
                <p className="text-2xl font-display font-bold text-ink-100 mt-1">{s.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl ${s.bg} border flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5">
          <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest mb-4">My Pipeline</h3>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart><Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie><Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }} /></PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-1">
                {statusData.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i] }} /><span className="text-ink-500">{s.name}</span></div>
                    <span className="font-semibold text-ink-300">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="h-40 flex items-center justify-center text-ink-600 text-sm">No leads yet</div>}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest">Today's Follow-ups</h3>
            <span className="badge bg-rose-500/15 text-rose-400 border border-rose-500/20 text-xs">{data?.todayFollowUps?.length || 0} due</span>
          </div>
          <div className="space-y-2">
            {!data?.todayFollowUps?.length ? (
              <div className="text-center py-8">
                <RiCalendarCheckLine className="w-8 h-8 text-ink-700 mx-auto mb-2" />
                <p className="text-ink-600 text-sm">Clear today</p>
              </div>
            ) : data.todayFollowUps.map(lead => {
              const cfg = STATUS_CONFIG[lead.status] || {}
              return (
                <Link key={lead._id} to={`/leads/${lead._id}`} className="flex items-center justify-between p-2.5 bg-ink-800/60 border border-rose-500/20 rounded-xl hover:border-rose-500/40 transition-colors">
                  <div className="min-w-0">
                    <div className="text-sm font-display font-medium text-ink-200 truncate">{lead.name}</div>
                    <span className={`badge text-xs mt-0.5 ${cfg.color}`}>{lead.status}</span>
                  </div>
                  <RiArrowRightLine className="w-4 h-4 text-ink-600 flex-shrink-0 ml-2" />
                </Link>
              )
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest">This Week</h3>
            <span className="badge bg-azure-500/15 text-azure-400 border border-azure-500/20 text-xs">7 days</span>
          </div>
          <div className="space-y-2">
            {!data?.upcomingFollowUps?.length ? (
              <div className="text-center py-8">
                <RiTimeLine className="w-8 h-8 text-ink-700 mx-auto mb-2" />
                <p className="text-ink-600 text-sm">No upcoming follow-ups</p>
              </div>
            ) : data.upcomingFollowUps.slice(0, 6).map(lead => (
              <Link key={lead._id} to={`/leads/${lead._id}`} className="flex items-center justify-between p-2.5 bg-ink-800/60 border border-ink-700/50 rounded-xl hover:border-ink-600 transition-colors">
                <div className="min-w-0">
                  <div className="text-sm font-display font-medium text-ink-200 truncate">{lead.name}</div>
                  <div className="text-xs text-ink-600">{lead.destination}</div>
                </div>
                <div className="text-xs font-semibold text-azure-400 flex-shrink-0 ml-2">{formatDate(lead.followUpDate)}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-ink-800">
          <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest">Recent Activity</h3>
          <Link to="/leads" className="text-xs text-azure-400 hover:underline flex items-center gap-1">My Leads <RiArrowRightLine className="w-3 h-3" /></Link>
        </div>
        <div className="divide-y divide-ink-800/50">
          {!data?.recentActivity?.length ? (
            <div className="text-center py-10 text-ink-600 text-sm">No recent activity</div>
          ) : data.recentActivity.map(act => (
            <div key={act._id} className="flex items-start gap-3 px-4 py-3">
              <div className="w-7 h-7 rounded-lg bg-ink-800 border border-ink-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <RiTimeLine className="w-3.5 h-3.5 text-ink-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink-300 leading-relaxed">{act.content}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-ink-600">
                  <span>{act.lead?.name}</span><span>&bull;</span><span>{act.lead?.destination}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
