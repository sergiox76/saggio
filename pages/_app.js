import '../styles/globals.css'
import { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/router'

// ===== AUTH CONTEXT =====
export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

// ===== TOAST SYSTEM =====
export const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type || 'default'}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ===== APP =====
export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [toasts, setToasts] = useState([])
  const router = useRouter()

  useEffect(() => {
    fetchMe()
  }, [])

  async function fetchMe() {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch {}
    setLoadingAuth(false)
  }

  function showToast(message, type = 'default', duration = 3000) {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }

  function logout() {
    fetch('/api/auth/logout', { method: 'POST' }).then(() => {
      setUser(null)
      router.push('/login')
    })
  }

  if (loadingAuth) {
    return (
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        minHeight:'100vh', background:'#FDFAF7', flexDirection:'column', gap:'1rem'
      }}>
        <div style={{
          width:48, height:48,
          background:'linear-gradient(135deg,#FF7A2F,#E85D04)',
          borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'1.5rem', boxShadow:'0 8px 24px rgba(255,122,47,0.3)'
        }}>📖</div>
        <div className="loading-spinner" style={{width:28,height:28}}></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, fetchMe }}>
      <ToastContext.Provider value={{ showToast }}>
        <Component {...pageProps} />
        <ToastContainer toasts={toasts} />
      </ToastContext.Provider>
    </AuthContext.Provider>
  )
}
