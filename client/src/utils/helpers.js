export const STATUS_CONFIG = {
  'New':            { color: 'bg-azure-500/15 text-azure-400 border border-azure-500/30',    dot: 'bg-azure-400' },
  'Contacted':      { color: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30', dot: 'bg-indigo-400' },
  'Quotation Sent': { color: 'bg-violet-500/15 text-violet-400 border border-violet-500/30', dot: 'bg-violet-400' },
  'Flight Booked':  { color: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',       dot: 'bg-cyan-400' },
  'Hotel Booked':   { color: 'bg-teal-500/15 text-teal-400 border border-teal-500/30',       dot: 'bg-teal-400' },
  'Confirmed':      { color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30', dot: 'bg-emerald-400' },
  'Cancelled':      { color: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',    dot: 'bg-amber-400' },
  'Lost':           { color: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',       dot: 'bg-rose-400' },
}

export const PRIORITY_CONFIG = {
  'Low':    { color: 'bg-ink-700 text-ink-400',                 dot: 'bg-ink-400' },
  'Medium': { color: 'bg-amber-500/15 text-amber-400',          dot: 'bg-amber-400' },
  'High':   { color: 'bg-orange-500/15 text-orange-400',        dot: 'bg-orange-400' },
  'Urgent': { color: 'bg-rose-500/15 text-rose-400 animate-pulse-slow', dot: 'bg-rose-400' },
}

export const PAYMENT_TYPE_CONFIG = {
  'advance': { color: 'bg-azure-500/15 text-azure-400', label: 'Advance' },
  'partial':  { color: 'bg-violet-500/15 text-violet-400', label: 'Partial' },
  'full':    { color: 'bg-emerald-500/15 text-emerald-400', label: 'Full' },
  'refund':  { color: 'bg-rose-500/15 text-rose-400', label: 'Refund' },
}

export const ACTIVITY_CONFIG = {
  'note':          { icon: 'note',   color: 'bg-ink-700 text-ink-300' },
  'call':          { icon: 'call',   color: 'bg-emerald-500/15 text-emerald-400' },
  'email':         { icon: 'email',  color: 'bg-azure-500/15 text-azure-400' },
  'meeting':       { icon: 'meet',   color: 'bg-violet-500/15 text-violet-400' },
  'status_change': { icon: 'status', color: 'bg-amber-500/15 text-amber-400' },
  'assignment':    { icon: 'assign', color: 'bg-indigo-500/15 text-indigo-400' },
  'follow_up':     { icon: 'follow', color: 'bg-teal-500/15 text-teal-400' },
  'system':        { icon: 'sys',    color: 'bg-ink-700 text-ink-500' },
}

export const LEAD_STATUSES = ['New', 'Contacted', 'Quotation Sent', 'Flight Booked', 'Hotel Booked', 'Confirmed', 'Cancelled', 'Lost']
export const LEAD_SOURCES = ['Facebook', 'Instagram', 'Website', 'Referral', 'WhatsApp', 'Walk-in', 'Phone Call', 'Email', 'Google Form', 'Other']
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']
export const TRIP_TYPES = ['Package', 'One-way', 'Round-trip', 'Multi-city', 'Cruise', 'Group Tour', 'Honeymoon', 'Corporate']
export const PAYMENT_METHODS = ['cash', 'bank_transfer', 'credit_card', 'debit_card', 'cheque', 'online', 'other']
export const PAYMENT_TYPES = ['advance', 'partial', 'full', 'refund']

export const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null) return '$0'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount)
}

export const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const timeAgo = (date) => {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export const CHART_COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#84cc16']
