import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth, useToast } from '../context/AppContext'

const ROLES = [
  { id: 'estudiante', icon: '🎓', label: 'Estudiante' },
  { id: 'profesor', icon: '👩‍🏫', label: 'Profesor' },
  { id: 'administrador', icon: '⚙️', label: 'Admin' },
]

export default function LoginPage() {
  const { setUser } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  // Register form state
  const [regData, setRegData] = useState({ nombre: '', email: '', password: '', rol: 'estudiante' })

  async function handleLogin(e) {
    e.preventDefault()
    if (!role) { showToast('⚠️ Selecciona un rol primero', 'warning'); return }
    if (!email || !password) { showToast('⚠️ Completa todos los campos', 'warning'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        showToast(`¡Bienvenido/a, ${data.user.nombre.split(' ')[0]}! 👋`, 'success')
        router.push('/dashboard')
      } else {
        showToast(`❌ ${data.error || 'Credenciales incorrectas'}`, 'error')
      }
    } catch {
      showToast('❌ Error de conexión', 'error')
    }
    setLoading(false)
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!regData.nombre || !regData.email || !regData.password) {
      showToast('⚠️ Completa todos los campos', 'warning'); return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      })
      const data = await res.json()
      if (res.ok) {
        showToast('✅ Cuenta creada. Ahora inicia sesión', 'success')
        setShowRegister(false)
      } else {
        showToast(`❌ ${data.error}`, 'error')
      }
    } catch {
      showToast('❌ Error de conexión', 'error')
    }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Iniciar Sesión — Saggio</title>
        <meta name="description" content="Plataforma educativa universitaria Saggio" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'var(--white)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{
          position:'absolute', top:'-180px', right:'-180px',
          width:'500px', height:'500px',
          background:'radial-gradient(circle, #FFE8D6 0%, transparent 65%)',
          pointerEvents:'none',
        }} />
        <div style={{
          position:'absolute', bottom:'-150px', left:'-150px',
          width:'450px', height:'450px',
          background:'radial-gradient(circle, #FFE8D6 0%, transparent 65%)',
          pointerEvents:'none',
        }} />

        <div style={{
          background:'var(--white)',
          border:'1px solid var(--gray-200)',
          borderRadius:24,
          padding:'2.5rem',
          width:'100%',
          maxWidth:420,
          boxShadow:'var(--shadow-lg)',
          position:'relative',
          zIndex:1,
          animation:'fadeUp 0.5s ease both',
        }}>
          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:'1.75rem' }}>
            <div style={{
              width:64, height:64,
              background:'linear-gradient(135deg, var(--orange), var(--orange-deep))',
              borderRadius:18,
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              fontSize:'2rem', marginBottom:'0.9rem',
              boxShadow:'var(--shadow-orange)',
            }}>📖</div>
            <div style={{ fontFamily:'Playfair Display, serif', fontSize:'2rem', fontWeight:700, letterSpacing:'-0.5px', color:'var(--gray-800)' }}>
              Saggio
            </div>
            <p style={{ color:'var(--gray-400)', fontSize:'0.85rem', marginTop:'0.2rem' }}>
              Plataforma Educativa Universitaria
            </p>
          </div>

          {!showRegister ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin}>
              <p style={{ fontSize:'0.78rem', fontWeight:600, color:'var(--gray-400)', textAlign:'center', marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                Selecciona tu rol
              </p>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.65rem', marginBottom:'1.5rem' }}>
                {ROLES.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    style={{
                      border: role === r.id ? '2px solid var(--orange)' : '2px solid var(--gray-200)',
                      background: role === r.id ? 'var(--orange-light)' : 'var(--white)',
                      borderRadius:'var(--radius-sm)',
                      padding:'0.9rem 0.4rem',
                      cursor:'pointer',
                      textAlign:'center',
                      transition:'var(--transition)',
                    }}
                  >
                    <div style={{ fontSize:'1.6rem', display:'block', marginBottom:'0.3rem' }}>{r.icon}</div>
                    <div style={{ fontSize:'0.75rem', fontWeight:600, color: role === r.id ? 'var(--orange-deep)' : 'var(--gray-600)' }}>{r.label}</div>
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Correo institucional</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="usuario@universidad.edu.co"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom:'1.5rem' }}>
                <label className="form-label">Contraseña</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                {loading ? <><div className="loading-spinner" style={{width:18,height:18,borderWidth:2}} /> Ingresando...</> : 'Iniciar Sesión'}
              </button>

              <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.83rem', color:'var(--gray-400)' }}>
                ¿No tienes cuenta?{' '}
                <span
                  style={{ color:'var(--orange)', cursor:'pointer', fontWeight:600 }}
                  onClick={() => setShowRegister(true)}
                >
                  Regístrate
                </span>
              </p>

              <p style={{ textAlign:'center', marginTop:'0.5rem', fontSize:'0.73rem', color:'var(--gray-300)' }}>
                Admin demo: admin@saggio.edu.co / Admin@Saggio2025
              </p>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister}>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:'1.1rem', fontWeight:700, marginBottom:'1.25rem', textAlign:'center' }}>
                Crear Cuenta
              </h3>

              <div className="form-group">
                <label className="form-label">Nombre completo</label>
                <input className="form-input" type="text" placeholder="Juan Pérez García"
                  value={regData.nombre}
                  onChange={e => setRegData({ ...regData, nombre: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Correo</label>
                <input className="form-input" type="email" placeholder="usuario@universidad.edu.co"
                  value={regData.email}
                  onChange={e => setRegData({ ...regData, email: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input className="form-input" type="password" placeholder="Mínimo 8 caracteres"
                  value={regData.password}
                  onChange={e => setRegData({ ...regData, password: e.target.value })} required />
              </div>

              <div className="form-group" style={{ marginBottom:'1.5rem' }}>
                <label className="form-label">Rol</label>
                <select className="form-select"
                  value={regData.rol}
                  onChange={e => setRegData({ ...regData, rol: e.target.value })}>
                  <option value="estudiante">Estudiante</option>
                  <option value="profesor">Profesor</option>
                </select>
              </div>

              <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>

              <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.83rem', color:'var(--gray-400)', cursor:'pointer' }}
                onClick={() => setShowRegister(false)}>
                ← Volver al login
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
