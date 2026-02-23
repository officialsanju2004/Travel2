import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { formatCurrency, formatDate, formatDateTime, PAYMENT_METHODS, PAYMENT_TYPES, PAYMENT_TYPE_CONFIG } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import {
  RiAddLine, RiDownloadLine, RiMoneyDollarCircleLine, RiArrowUpLine,
  RiArrowDownLine, RiBankCardLine, RiCheckLine, RiCloseLine,
  RiPrinterLine, RiFilterLine, RiSearchLine, RiFileTextLine
} from 'react-icons/ri'

const generateBillHTML = (payment, lead) => {

  const agentName = lead?.assignedTo?.name || 'N/A'
//   const downloadInvoice = async (paymentId) => {
//   try {
//     const response = await fetch(
//       `http://localhost:5000/api/payments/invoice/${paymentId}`,
//       {
//         method: "GET",
//       }
//     );

//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `invoice-${paymentId}.pdf`;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//   } catch (error) {
//     console.error("Error downloading invoice:", error);
//   }
// };
  const now = new Date()
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice ${payment.invoiceNumber}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1e293b; }
  .page { max-width: 700px; margin: 40px auto; padding: 48px; border: 1px solid #e2e8f0; border-radius: 12px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .logo { display: flex; align-items: center; gap: 12px; }
  .logo-icon { width: 40px; height: 40px; background: #0284c7; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .logo-icon svg { fill: white; width: 22px; height: 22px; }
  .logo-text h1 { font-size: 20px; font-weight: 700; color: #0f172a; }
  .logo-text p { font-size: 11px; color: #64748b; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { font-size: 28px; font-weight: 800; color: #0284c7; letter-spacing: -0.5px; }
  .invoice-meta p { font-size: 13px; color: #64748b; margin-top: 4px; }
  .divider { height: 1px; background: #e2e8f0; margin: 28px 0; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
  .info-block h3 { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
  .info-block p { font-size: 14px; color: #334155; margin-bottom: 4px; line-height: 1.5; }
  .info-block strong { color: #0f172a; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
  th { background: #f8fafc; text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e2e8f0; }
  td { padding: 14px 16px; font-size: 14px; color: #334155; border-bottom: 1px solid #f1f5f9; }
  .totals { display: flex; justify-content: flex-end; }
  .totals-table { width: 280px; }
  .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #475569; }
  .totals-row.total { border-top: 2px solid #0284c7; margin-top: 8px; padding-top: 12px; font-weight: 700; font-size: 16px; color: #0f172a; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
  .badge-received { background: #d1fae5; color: #059669; }
  .badge-advance { background: #e0f2fe; color: #0284c7; }
  .badge-refund { background: #ffe4e6; color: #e11d48; }
  .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">
      <div class="logo-icon"><svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg></div>
      <div class="logo-text"><h1>TravelCRM</h1><p>Enterprise Edition</p></div>
    </div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <p>${payment.invoiceNumber}</p>
      <p>Date: ${formatDate(payment.receivedAt)}</p>
    </div>
  </div>
  <div class="divider"></div>
  <div class="grid-2">
    <div class="info-block">
      <h3>Customer Details</h3>
      <p><strong>${lead?.name || 'N/A'}</strong></p>
      <p>${lead?.phone || ''}</p>
      <p>${lead?.email || ''}</p>
    </div>
    <div class="info-block">
      <h3>Trip Details</h3>
      <p><strong>Destination:</strong> ${lead?.destination || 'N/A'}</p>
      <p><strong>Travel Date:</strong> ${formatDate(lead?.travelDate)}</p>
      <p><strong>Travelers:</strong> ${lead?.numberOfTravelers || 1}</p>
      <p><strong>Sales Agent:</strong> ${agentName}</p>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Payment Type</th>
        <th>Method</th>
        <th>Status</th>
        <th style="text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${payment.description || `${lead?.destination || 'Travel'} Package`}<br/><span style="font-size:12px;color:#94a3b8">${payment.referenceNumber ? 'Ref: ' + payment.referenceNumber : ''}</span></td>
        <td><span class="badge badge-${payment.type}">${payment.type}</span></td>
        <td style="text-transform:capitalize">${(payment.paymentMethod || '').replace('_', ' ')}</td>
        <td><span class="badge badge-received">${payment.status}</span></td>
        <td style="text-align:right;font-weight:600">${formatCurrency(payment.amount)}</td>
      </tr>
    </tbody>
  </table>
  <div class="totals">
    <div class="totals-table">
      <div class="totals-row"><span>Subtotal</span><span>${formatCurrency(payment.amount)}</span></div>
      <div class="totals-row total"><span>Total Paid</span><span>${formatCurrency(payment.amount)}</span></div>
    </div>
  </div>
  ${payment.notes ? `<div style="background:#f8fafc;border-radius:8px;padding:16px;margin-top:20px;"><p style="font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Notes</p><p style="font-size:13px;color:#475569">${payment.notes}</p></div>` : ''}
  <div class="footer">
    <p>Thank you for your business! For any queries, please contact your sales agent.</p>
    <p style="margin-top:4px">Generated on ${formatDateTime(now)} &bull; TravelCRM Enterprise</p>
  </div>
</div>
</body>
</html>`
}

const downloadBill = (payment, lead) => {
  const html = generateBillHTML(payment, lead)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${payment.invoiceNumber}.html`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Invoice downloaded')
}

const printBill = (payment, lead) => {
  const html = generateBillHTML(payment, lead)
  const win = window.open('', '_blank')
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 500)
}

export default function BillingPage() {
  const { isAdmin } = useAuth()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({ page: 1, type: '', status: '' })
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['allPayments', filters],
    queryFn: () => api.get('/payments', { params: filters }).then(r => r.data),
    enabled: isAdmin
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/payments/${id}`),
    onSuccess: () => { toast.success('Payment deleted'); queryClient.invalidateQueries(['allPayments']) },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed')
  })

  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <RiBankCardLine className="w-12 h-12 text-ink-600 mb-3" />
      <p className="text-ink-400 font-display">Admin access required for billing overview.</p>
      <p className="text-ink-600 text-sm mt-1">View payments within individual lead pages.</p>
    </div>
  )

  const payments = data?.payments || []
  const totalRevenue = data?.totalRevenue || 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title text-2xl">Billing & Payments</h1>
          <p className="section-sub">All transactions across your agency</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: RiMoneyDollarCircleLine, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Total Payments', value: data?.pagination?.total || 0, icon: RiBankCardLine, color: 'text-azure-400', bg: 'bg-azure-500/10 border-azure-500/20' },
          { label: 'This Month', value: formatCurrency(payments.filter(p => new Date(p.receivedAt) > new Date(Date.now() - 30*24*60*60*1000)).reduce((s, p) => s + p.amount, 0)), icon: RiArrowUpLine, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
          { label: 'Refunds', value: formatCurrency(payments.filter(p => p.type === 'refund').reduce((s, p) => s + p.amount, 0)), icon: RiArrowDownLine, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
        ].map(s => (
          <div key={s.label} className={`card border ${s.bg} p-5`}>
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

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input className="input pl-9 text-sm" placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto text-sm min-w-32" value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value, page: 1 }))}>
          <option value="">All Types</option>
          {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <select className="input w-auto text-sm min-w-32" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          {['received', 'pending', 'refunded', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-800">
                <th className="table-header text-left">Invoice</th>
                <th className="table-header text-left">Customer</th>
                <th className="table-header text-left hidden md:table-cell">Type</th>
                <th className="table-header text-left hidden lg:table-cell">Method</th>
                <th className="table-header text-left hidden lg:table-cell">Agent</th>
                <th className="table-header text-left hidden sm:table-cell">Date</th>
                <th className="table-header text-right">Amount</th>
                <th className="table-header" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-ink-800/50">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="table-cell"><div className="skeleton h-4 rounded" /></td>
                  ))}
                </tr>
              )) : payments.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16">
                  <RiBankCardLine className="w-10 h-10 text-ink-700 mx-auto mb-3" />
                  <p className="text-ink-500 font-display">No payments found</p>
                </td></tr>
              ) : payments.filter(p => !search || p.lead?.name?.toLowerCase().includes(search.toLowerCase()) || p.invoiceNumber?.toLowerCase().includes(search.toLowerCase())).map(payment => (
                <tr key={payment._id} className="table-row">
                  <td className="table-cell">
                    <span className="font-mono text-xs text-azure-400 font-semibold">{payment.invoiceNumber}</span>
                  </td>
                  <td className="table-cell">
                    <Link to={`/leads/${payment.lead?._id}`} className="hover:text-azure-400 transition-colors">
                      <div className="font-medium text-ink-200 text-sm">{payment.lead?.name}</div>
                      <div className="text-ink-600 text-xs">{payment.lead?.destination}</div>
                    </Link>
                  </td>
                  <td className="table-cell hidden md:table-cell">
                    <span className={`badge ${PAYMENT_TYPE_CONFIG[payment.type]?.color || 'bg-ink-700 text-ink-400'}`}>
                      {payment.type}
                    </span>
                  </td>
                  <td className="table-cell hidden lg:table-cell">
                    <span className="text-ink-400 text-sm capitalize">{(payment.paymentMethod || '').replace('_', ' ')}</span>
                  </td>
                  <td className="table-cell hidden lg:table-cell">
                    <span className="text-ink-400 text-sm">{payment.receivedBy?.name || '—'}</span>
                  </td>
                  <td className="table-cell hidden sm:table-cell">
                    <span className="text-ink-500 text-xs">{formatDate(payment.receivedAt)}</span>
                  </td>
                  <td className="table-cell text-right">
                    <span className={`font-display font-bold text-sm ${payment.type === 'refund' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {payment.type === 'refund' ? '-' : '+'}{formatCurrency(payment.amount)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button onClick={() => downloadBill(payment, payment.lead)} className="btn-icon p-1.5" title="Download Invoice">
                        <RiDownloadLine className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => printBill(payment, payment.lead)} className="btn-icon p-1.5" title="Print Invoice">
                        <RiPrinterLine className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <button onClick={() => { if (confirm('Delete this payment?')) deleteMutation.mutate(payment._id) }} className="btn-icon p-1.5 hover:text-rose-400">
                          <RiCloseLine className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ink-800">
            <span className="text-xs text-ink-500">Page {data.pagination.page} of {data.pagination.pages}</span>
            <div className="flex gap-2">
              <button disabled={filters.page <= 1} onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Prev</button>
              <button disabled={filters.page >= data.pagination.pages} onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
