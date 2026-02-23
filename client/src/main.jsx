import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000 } } })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" toastOptions={{
          duration: 3500,
          style: { background: '#1e293b', color: '#e2e8f0', borderRadius: '14px', fontSize: '13px', fontFamily: '"DM Sans", sans-serif', border: '1px solid #334155', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' },
          success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#1e293b' } }
        }} />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
