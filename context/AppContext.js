import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'

/* ===== AUTH ===== */
export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

/* ===== TOAST ===== */
export const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

/* ===== PROVIDER ===== */
export function AppProvider({ children }) {
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

  function logout() {
    fetch('/api/auth/logout', { method: 'POST' }).then(() => {
      setUser(null)
      router.push('/login')
    })
  }

  function showToast(message, type = 'default', duration = 3000) {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }

  if (loadingAuth) return null

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      <ToastContext.Provider value={{ showToast }}>
        {children}
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              {t.message}
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </AuthContext.Provider>
  )
}