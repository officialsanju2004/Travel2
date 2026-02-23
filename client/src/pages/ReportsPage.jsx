import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'
import { formatCurrency, formatDate, CHART_COLORS } from '../utils/helpers'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts'
import { RiBarChartLine, RiLineChartLine, RiUserLine, RiMoneyDollarCircleLine } from 'react-icons/ri'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-800 border border-ink-700 rounded-xl p-3 shadow-modal">
      <p className="text-xs text-ink-400 mb-2 font-display font-semibold">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-ink-300">{p.name}: <span className="font-semibold text-ink-100">{typeof p.value === 'number' && p.name?.toLowerCase().includes('revenue') ? formatCurrency(p.value) : p.value}</span></span>
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => api.get('/dashboard/admin').then(r => r.data.stats)
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-azure-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const trendData = (data?.monthlyTrend || []).map(m => ({
    month: monthNames[m._id.month - 1],
    Leads: m.count,
    Confirmed: m.converted,
    Revenue: m.revenue
  }))
  const statusData = Object.entries(data?.statusCounts || {}).map(([name, value]) => ({ name, value }))
  const sourceData = Object.entries(data?.sourceCounts || {}).map(([name, value]) => ({ name, value }))

  const stats = [
    { label: 'Total Leads', value: data?.totalLeads || 0, icon: RiUserLine, color: 'text-azure-400', bg: 'bg-azure-500/10 border-azure-500/20' },
    { label: 'Confirmed', value: data?.confirmedLeads || 0, icon: RiLineChartLine, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Conversion Rate', value: `${data?.conversionRate || 0}%`, icon: RiBarChartLine, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    { label: 'Total Revenue', value: formatCurrency(data?.totalRevenue), icon: RiMoneyDollarCircleLine, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title text-2xl">Analytics & Reports</h1>
        <p className="section-sub">Full performance overview of your agency</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`card border ${s.bg} p-5 animate-slide-up`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-ink-500 font-display font-semibold uppercase tracking-widest">{s.label}</p>
                <p className="text-2xl font-display font-bold text-ink-100 mt-1">{s.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl ${s.bg} border flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly trend */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest mb-5">Monthly Lead & Conversion Trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
            <Area type="monotone" dataKey="Leads" stroke="#0ea5e9" strokeWidth={2} fill="url(#leadsGrad)" dot={false} />
            <Area type="monotone" dataKey="Confirmed" stroke="#10b981" strokeWidth={2} fill="url(#confGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Status dist */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest mb-5">Lead Status Distribution</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {statusData.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-xs text-ink-400">{s.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-ink-300">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Source */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest mb-5">Leads by Source</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sourceData} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Leads" radius={[6, 6, 0, 0]}>
                {sourceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent performance */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-ink-800">
          <h3 className="font-display font-semibold text-ink-300 text-xs uppercase tracking-widest">Sales Team Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-800">
                <th className="table-header text-left">Agent</th>
                <th className="table-header text-left">Total Leads</th>
                <th className="table-header text-left">Confirmed</th>
                <th className="table-header text-left">Conversion</th>
                <th className="table-header text-left">Revenue</th>
                <th className="table-header text-left">Performance</th>
              </tr>
            </thead>
            <tbody>
              {(data?.leadsPerAgent || []).map((agent, i) => {
                const conv = agent.count > 0 ? Math.round((agent.converted / agent.count) * 100) : 0
                return (
                  <tr key={agent._id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-azure-600 to-indigo-600 flex items-center justify-center text-white text-xs font-display font-bold">
                          {agent.user?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="text-sm font-display font-semibold text-ink-200">{agent.user?.name}</div>
                          <div className="text-xs text-ink-600">{agent.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell"><span className="font-display font-bold text-ink-200">{agent.count}</span></td>
                    <td className="table-cell"><span className="font-display font-bold text-emerald-400">{agent.converted}</span></td>
                    <td className="table-cell"><span className="badge bg-azure-500/15 text-azure-400">{conv}%</span></td>
                    <td className="table-cell"><span className="text-amber-400 font-semibold text-sm">{formatCurrency(agent.revenue)}</span></td>
                    <td className="table-cell w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-ink-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-azure-600 to-emerald-500" style={{ width: `${conv}%` }} />
                        </div>
                        <span className="text-xs text-ink-500 w-8">{conv}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
