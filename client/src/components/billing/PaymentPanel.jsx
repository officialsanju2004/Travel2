import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../utils/api'
import { formatCurrency, formatDate, PAYMENT_METHODS, PAYMENT_TYPES, PAYMENT_TYPE_CONFIG } from '../../utils/helpers'
import {
  RiAddLine, RiDownloadLine, RiPrinterLine, RiMoneyDollarCircleLine,
  RiCheckLine, RiArrowUpLine, RiCloseLine, RiFileTextLine
} from 'react-icons/ri'

const generateInvoiceHTML = (payment, lead) => {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice ${payment.invoiceNumber}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',sans-serif; color:#1e293b; padding:0; }
  .page { max-width:680px; margin:32px auto; padding:48px; border:1px solid #e2e8f0; border-radius:12px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:36px; }
  .brand h1 { font-size:22px; font-weight:800; color:#0284c7; letter-spacing:-0.5px; }
  .brand p { font-size:11px; color:#94a3b8; margin-top:2px; }
  .inv-info { text-align:right; }
  .inv-info .num { font-size:15px; font-weight:700; color:#0f172a; }
  .inv-info p { font-size:12px; color:#64748b; margin-top:3px; }
  .divider { height:1px; background:#f1f5f9; margin:24px 0; }
  .cols { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:28px; }
  .info-block h3 { font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:.1em; margin-bottom:8px; }
  .info-block p { font-size:13px; color:#334155; margin-bottom:3px; }
  table { width:100%; border-collapse:collapse; }
  th { background:#f8fafc; text-align:left; padding:10px 14px; font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:.05em; border-bottom:2px solid #e2e8f0; }
  td { padding:12px 14px; font-size:13px; color:#334155; border-bottom:1px solid #f8fafc; }
  .total-section { display:flex; justify-content:flex-end; margin-top:20px; }
  .total-box { width:240px; }
  .total-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; color:#475569; }
  .total-row.final { border-top:2px solid #0284c7; margin-top:8px; padding-top:10px; font-weight:700; font-size:15px; color:#0f172a; }
  .badge { display:inline-block; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:700; text-transform:uppercase; }
  .green { background:#d1fae5; color:#059669; }
  .blue { background:#dbeafe; color:#1d4ed8; }
  .red { background:#fee2e2; color:#dc2626; }
  .footer { text-align:center; margin-top:36px; padding-top:20px; border-top:1px solid #f1f5f9; color:#94a3b8; font-size:11px; }
  @media print { .page { margin:0; border:none; padding:32px; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand"><h1>TravelCRM</h1><p>Enterprise Edition</p></div>
    <div class="inv-info">
      <div class="num">${payment.invoiceNumber}</div>
      <p>Date: ${new Date(payment.receivedAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</p>
    </div>
  </div>
  <div class="divider"></div>
  <div class="cols">
    <div class="info-block">
      <h3>Billed To</h3>
      <p><strong>${lead?.name || 'N/A'}</strong></p>
      <p>${lead?.phone || ''}</p>
      <p>${lead?.email || ''}</p>
    </div>
    <div class="info-block">
      <h3>Trip Details</h3>
      <p><strong>${lead?.destination || 'N/A'}</strong></p>
      <p>Travel: ${lead?.travelDate ? new Date(lead.travelDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : 'TBD'}</p>
      <p>Travelers: ${lead?.numberOfTravelers || 1}</p>
      <p>Agent: ${lead?.assignedTo?.name || 'N/A'}</p>
    </div>
  </div>
  <table>
    <thead><tr><th>Description</th><th>Type</th><th>Method</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>
      <tr>
        <td>${payment.description || `${lead?.destination || 'Travel'} Package`}<br/>${payment.referenceNumber ? '<span style="font-size:11px;color:#94a3b8">Ref: ' + payment.referenceNumber + '</span>' : ''}</td>
        <td><span class="badge blue">${payment.type}</span></td>
        <td style="text-transform:capitalize">${(payment.paymentMethod || '').replace('_', ' ')}</td>
        <td style="text-align:right;font-weight:700">$${payment.amount.toLocaleString()}</td>
      </tr>
    </tbody>
  </table>
  <div class="total-section">
    <div class="total-box">
      <div class="total-row"><span>Subtotal</span><span>$${payment.amount.toLocaleString()}</span></div>
      <div class="total-row final"><span>Total Paid</span><span>$${payment.amount.toLocaleString()}</span></div>
    </div>
  </div>
  ${payment.notes ? `<div style="background:#f8fafc;border-radius:8px;padding:14px;margin-top:20px;"><p style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Notes</p><p style="font-size:12px;color:#475569">${payment.notes}</p></div>` : ''}
  <div class="footer">
    <p>Thank you for choosing us for your travel needs.</p>
    <p style="margin-top:3px">Generated by TravelCRM Enterprise &bull; ${new Date().toLocaleString()}</p>
  </div>
</div>
</body>
</html>`
}

const AddPaymentModal = ({ leadId, onClose, onSuccess }) => {
  const [form, setForm] = useState({ type: 'advance', amount: '', paymentMethod: 'cash', description: '', referenceNumber: '', notes: '', receivedAt: new Date().toISOString().split('T')[0] })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Please enter a valid amount'); return }
    setLoading(true)
    try {
      await api.post(`/payments/lead/${leadId}`, form)
      toast.success('Payment recorded successfully')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add payment')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal max-w-lg w-full">
        <div className="flex items-center justify-between p-5 border-b border-ink-800">
          <div>
            <h3 className="font-display font-bold text-ink-100">Record Payment</h3>
            <p className="text-ink-500 text-xs mt-0.5">Add advance, partial, or full payment</p>
          </div>
          <button onClick={onClose} className="btn-icon"><RiCloseLine className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Payment Type</label>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500 text-sm font-bold">$</span>
                <input required type="number" min="1" step="0.01" className="input pl-7" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Payment Method</label>
              <select className="input" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date Received</label>
              <input type="date" className="input" value={form.receivedAt} onChange={e => set('receivedAt', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" placeholder="e.g. Advance for Bali Package" value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div>
            <label className="label">Reference / Transaction Number</label>
            <input className="input" placeholder="Optional transaction ID" value={form.referenceNumber} onChange={e => set('referenceNumber', e.target.value)} />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea rows={2} className="input resize-none" placeholder="Any additional notes..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-success flex-1">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><RiCheckLine className="w-4 h-4" /><span>Record Payment</span></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PaymentPanel({ leadId, lead }) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['payments', leadId],
    queryFn: () => api.get(`/payments/lead/${leadId}`).then(r => r.data)
  })

  const payments = data?.payments || []
  const summary = data?.summary || { totalReceived: 0, totalRefunded: 0, netAmount: 0 }
  const totalBudget = lead?.budget || 0
  const remaining = totalBudget - summary.netAmount

  const handleSuccess = () => queryClient.invalidateQueries(['payments', leadId])

  const handleDownload = (payment) => {
    const html = generateInvoiceHTML(payment, lead)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${payment.invoiceNumber}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Invoice downloaded')
  }

  const handlePrint = (payment) => {
    const html = generateInvoiceHTML(payment, lead)
    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 500)
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RiMoneyDollarCircleLine className="w-5 h-5 text-emerald-400" />
          <h3 className="font-display font-bold text-ink-100">Payments</h3>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-xs py-1.5 px-3">
          <RiAddLine className="w-3.5 h-3.5" />
          Add Payment
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Received', value: formatCurrency(summary.netAmount), color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Budget', value: formatCurrency(totalBudget), color: 'text-azure-400', bg: 'bg-azure-500/10 border-azure-500/20' },
          { label: 'Remaining', value: formatCurrency(Math.max(0, remaining)), color: remaining > 0 ? 'text-amber-400' : 'text-emerald-400', bg: remaining > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-3 border ${s.bg} text-center`}>
            <div className={`font-display font-bold text-sm ${s.color}`}>{s.value}</div>
            <div className="text-ink-600 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {totalBudget > 0 && (
        <div>
          <div className="flex justify-between text-xs text-ink-500 mb-1.5">
            <span>{Math.min(100, Math.round((summary.netAmount / totalBudget) * 100))}% collected</span>
            <span>{formatCurrency(summary.netAmount)} / {formatCurrency(totalBudget)}</span>
          </div>
          <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (summary.netAmount / totalBudget) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Payment list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-ink-600">
            <RiFileTextLine className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No payments recorded yet</p>
          </div>
        ) : payments.map(payment => (
          <div key={payment._id} className="flex items-center justify-between p-3 bg-ink-800/60 border border-ink-700/50 rounded-xl hover:border-ink-600 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${PAYMENT_TYPE_CONFIG[payment.type]?.color || 'bg-ink-700 text-ink-400'}`}>
                <RiMoneyDollarCircleLine className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-azure-400 font-semibold">{payment.invoiceNumber}</span>
                  <span className={`badge text-xs ${PAYMENT_TYPE_CONFIG[payment.type]?.color || ''}`}>{payment.type}</span>
                </div>
                <div className="text-xs text-ink-500 mt-0.5 truncate">
                  {formatDate(payment.receivedAt)} &bull; {(payment.paymentMethod || '').replace('_', ' ')}
                  {payment.description && ` \u2022 ${payment.description}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className={`font-display font-bold text-sm ${payment.type === 'refund' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {payment.type === 'refund' ? '-' : '+'}{formatCurrency(payment.amount)}
              </span>
              <button onClick={() => handleDownload(payment)} className="btn-icon p-1.5" title="Download">
                <RiDownloadLine className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handlePrint(payment)} className="btn-icon p-1.5" title="Print">
                <RiPrinterLine className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && <AddPaymentModal leadId={leadId} onClose={() => setShowForm(false)} onSuccess={handleSuccess} />}
    </div>
  )
}
