import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { RiPlaneLine, RiMailLine, RiLockPasswordLine, RiArrowRightLine, RiRefreshLine, RiShieldCheckLine, RiTimeLine } from 'react-icons/ri'

const OTPInput = ({ value, onChange, disabled }) => {
  const inputs = useRef([])
  const vals = (value || '').padEnd(6, ' ').split('')

  const handleChange = (i, v) => {
    const clean = v.replace(/\D/g, '')
    const arr = (value || '').split('')
    arr[i] = clean.slice(-1)
    const next = arr.join('').slice(0, 6)
    onChange(next)
    if (clean && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !vals[i].trim() && i > 0) inputs.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < 5) inputs.current[i + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    const idx = Math.min(pasted.length, 5)
    inputs.current[idx]?.focus()
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={vals[i]?.trim() || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className={`w-12 h-14 text-center text-xl font-mono font-bold rounded-xl border-2 bg-ink-800 text-ink-100 outline-none transition-all duration-200
            ${vals[i]?.trim() ? 'border-azure-500 text-azure-300' : 'border-ink-700'}
            focus:border-azure-400 focus:ring-2 focus:ring-azure-500/20
            disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  )
}

const CountdownTimer = ({ seconds, onExpire }) => {
  const [remaining, setRemaining] = useState(seconds)
  useEffect(() => {
    setRemaining(seconds)
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(interval); onExpire?.(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [seconds])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const pct = (remaining / seconds) * 100

  return (
    <div className="flex items-center gap-2 text-sm">
      <RiTimeLine className={`w-4 h-4 ${remaining < 60 ? 'text-rose-400' : 'text-amber-400'}`} />
      <span className={remaining < 60 ? 'text-rose-400' : 'text-ink-400'}>
        Expires in {mins}:{String(secs).padStart(2, '0')}
      </span>
      <div className="flex-1 h-1 bg-ink-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${remaining < 60 ? 'bg-rose-500' : 'bg-amber-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { setAuthData } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('credentials')
  const [form, setForm] = useState({ email: '', password: '' })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpExpired, setOtpExpired] = useState(false)
  const [devOtp, setDevOtp] = useState(null)

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please enter email and password'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/send-otp', form)
      if (data.devOtp) setDevOtp(data.devOtp)
      setStep('otp')
      setOtpExpired(false)
      toast.success('OTP sent to your email')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleVerifyOTP = async () => {
    if (otp.length < 6) { toast.error('Please enter the complete 6-digit OTP'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { email: form.email, otp })
      setAuthData(data.token, data.user)
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
      setOtp('')
    } finally { setLoading(false) }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/resend-otp', { email: form.email })
      if (data.devOtp) setDevOtp(data.devOtp)
      setOtpExpired(false)
      setOtp('')
      toast.success('New OTP sent')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 50%, #0f172a 100%)' }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-azure-400" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full border border-azure-400" />
          <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full border border-azure-400" />
        </div>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(14,165,233,0.08) 0%, transparent 70%)' }} />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-azure-600 rounded-xl flex items-center justify-center">
            <RiPlaneLine className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg leading-none">TravelCRM</div>
            <div className="text-azure-400 text-xs">Enterprise Edition</div>
          </div>
        </div>

        <div className="relative space-y-8">
          <div>
            <h1 className="font-display font-bold text-white text-5xl leading-tight mb-4">
              The smarter way<br />to manage<br /><span className="text-gradient">travel leads.</span>
            </h1>
            <p className="text-ink-400 text-lg leading-relaxed max-w-md">
              End-to-end lead management, billing, team performance tracking, and automated distribution — all in one platform.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Leads Managed', value: '50,000+' },
              { label: 'Avg Conversion', value: '34%' },
              { label: 'Revenue Tracked', value: '$2M+' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="font-display font-bold text-white text-2xl">{s.value}</div>
                <div className="text-ink-500 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-ink-700 text-xs">
          &copy; {new Date().getFullYear()} TravelCRM Enterprise. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-azure-600 rounded-lg flex items-center justify-center">
              <RiPlaneLine className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white">TravelCRM</span>
          </div>

          {step === 'credentials' ? (
            <div className="card p-8 space-y-6">
              <div>
                <h2 className="font-display font-bold text-white text-2xl">Sign in to your account</h2>
                <p className="text-ink-500 text-sm mt-1">Enter your credentials to receive an OTP</p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                    <input
                      type="email" required className="input pl-10"
                      placeholder="you@company.com"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <RiLockPasswordLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                    <input
                      type="password" required className="input pl-10"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span>Send OTP</span><RiArrowRightLine className="w-4 h-4" /></>}
                </button>
              </form>

              <div className="flex items-center gap-3 p-3 bg-azure-500/8 border border-azure-500/20 rounded-xl">
                <RiShieldCheckLine className="w-5 h-5 text-azure-400 flex-shrink-0" />
                <p className="text-ink-400 text-xs leading-relaxed">
                  A 6-digit verification code will be sent to your registered email address for secure login.
                </p>
              </div>
            </div>
          ) : (
            <div className="card p-8 space-y-6">
              <div>
                <div className="w-12 h-12 bg-azure-500/15 border border-azure-500/30 rounded-2xl flex items-center justify-center mb-4">
                  <RiShieldCheckLine className="w-6 h-6 text-azure-400" />
                </div>
                <h2 className="font-display font-bold text-white text-2xl">Verify your identity</h2>
                <p className="text-ink-500 text-sm mt-1">
                  OTP sent to <span className="text-azure-400 font-medium">{form.email}</span>
                </p>
              </div>

              {devOtp && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <span className="text-amber-400 text-xs font-mono font-bold">DEV MODE OTP: {devOtp}</span>
                </div>
              )}

              <div className="space-y-4">
                <OTPInput value={otp} onChange={setOtp} disabled={loading} />
                {!otpExpired ? (
                  <CountdownTimer seconds={600} onExpire={() => setOtpExpired(true)} />
                ) : (
                  <div className="text-center text-rose-400 text-sm">OTP has expired. Please request a new one.</div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length < 6 || otpExpired}
                  className="btn-primary w-full py-3 text-base"
                >
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><RiShieldCheckLine className="w-4 h-4" /><span>Verify & Sign In</span></>}
                </button>

                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="btn-secondary w-full py-2.5"
                >
                  <RiRefreshLine className="w-4 h-4" />
                  <span>Resend OTP</span>
                </button>

                <button onClick={() => { setStep('credentials'); setOtp(''); setDevOtp(null) }} className="btn-ghost w-full text-sm">
                  Use different credentials
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
