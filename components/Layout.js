import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../pages/_app'

const NAV_ITEMS = {
  all: [
    { href: '/dashboard', icon: '🏠', label: 'Inicio' },
    { href: '/contenido', icon: '📚', label: 'Contenido' },
    { href: '/asesorias', icon: '🤝', label: 'Asesorías', badge: true },
    { href: '/ia', icon: '🤖', label: 'Asistente IA' },
    { href: '/recursos', icon: '🗂️', label: 'Recursos' },
  ],
  profesor: [
    { href: '/mis-cursos', icon: '📋', label: 'Mis Cursos' },
  ],
  administrador: [
    { href: '/admin', icon: '⚙️', label: 'Administración' },
    { href: '/admin/usuarios', icon: '👥', label: 'Usuarios' },
  ],
}

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

export default function Layout({ children, title = 'Inicio' }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const roleLabel = {
    estudiante: 'Estudiante',
    profesor: 'Profesor',
    administrador: 'Administrador',
  }[user?.rol] || ''

  const extraNav = user?.rol ? (NAV_ITEMS[user.rol] || []) : []

  return (
    <div className="app-layout">
      {/* Overlay mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Link href="/dashboard" className="sidebar-logo" onClick={() => setSidebarOpen(false)}>
          <div className="logo-mark">📖</div>
          <div>
            <div className="logo-text-main">Saggio</div>
            <small className="logo-text-sub">Plataforma Académica</small>
          </div>
        </Link>

        {user && (
          <div className="user-pill">
            <div className="user-avatar">{getInitials(user.nombre)}</div>
            <div style={{ overflow: 'hidden' }}>
              <div className="user-name">{user.nombre}</div>
              <div className="user-role-badge">{roleLabel}</div>
            </div>
          </div>
        )}

        <nav className="nav-section">
          <div className="nav-section-label">Principal</div>
          {NAV_ITEMS.all.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${router.pathname === item.href ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && <span className="nav-badge">4</span>}
            </Link>
          ))}
        </nav>

        {extraNav.length > 0 && (
          <nav className="nav-section">
            <div className="nav-section-label">
              {user?.rol === 'administrador' ? 'Administración' : 'Docente'}
            </div>
            {extraNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${router.pathname === item.href ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="sidebar-footer">
          <button
            className="btn btn-outline btn-full"
            onClick={logout}
            style={{ fontSize: '0.82rem', padding: '0.6rem' }}
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="main-wrapper">
        {/* TOPBAR */}
        <header className="topbar">
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <h1 className="topbar-title">{title}</h1>
          <div className="topbar-right">
            <div className="search-bar">
              <span style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>🔍</span>
              <input type="text" placeholder="Buscar en Saggio..." />
            </div>
            <Link href="/notificaciones" className="icon-btn" title="Notificaciones">
              🔔
              <span className="notif-dot" />
            </Link>
            <Link href="/perfil" className="icon-btn" title="Mi perfil">
              👤
            </Link>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
