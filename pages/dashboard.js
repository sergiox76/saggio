import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'
import { useAuth } from './_app'

const ROLE_CONFIG = {
  estudiante: {
    stats: [
      { icon: '📚', value: '6', label: 'Módulos en progreso' },
      { icon: '✅', value: '18', label: 'Actividades completadas' },
      { icon: '🤝', value: '3', label: 'Asesorías activas' },
      { icon: '⭐', value: '4.8', label: 'Promedio académico' },
    ],
    activities: [
      { text: 'Completaste el módulo <strong>Introducción a la Investigación</strong>', time: 'Hace 2 horas' },
      { text: 'Asesoría con <strong>María Torres</strong> confirmada', time: 'Hace 5 horas' },
      { text: 'Nueva actividad en <strong>Metodología Cualitativa</strong>', time: 'Hace 1 día' },
      { text: 'Calificación recibida: <strong>Taller Estadística — 4.5/5.0</strong>', time: 'Hace 2 días' },
    ],
    quickActions: [
      { icon: '🤖', label: 'Asistente IA', href: '/ia' },
      { icon: '🤝', label: 'Buscar Asesoría', href: '/asesorias' },
      { icon: '📚', label: 'Ver Contenidos', href: '/contenido' },
      { icon: '🗂️', label: 'Recursos', href: '/recursos' },
    ],
    bannerSub: 'Continúa tu ruta de aprendizaje y no olvides revisar las asesorías disponibles.',
  },
  profesor: {
    stats: [
      { icon: '👥', value: '125', label: 'Estudiantes activos' },
      { icon: '📋', value: '4', label: 'Grupos activos' },
      { icon: '🤖', value: '89', label: 'Consultas IA / semana' },
      { icon: '🤝', value: '12', label: 'Asesorías programadas' },
    ],
    activities: [
      { text: '<strong>7 estudiantes</strong> completaron el taller de estadística', time: 'Hace 1 hora' },
      { text: 'Nueva solicitud de asesoría del grupo <strong>MAT-101-A</strong>', time: 'Hace 3 horas' },
      { text: 'Recurso recomendado por IA: <strong>Flipped Classroom en universitaria</strong>', time: 'Hace 6 horas' },
      { text: '<strong>14 trabajos</strong> pendientes de calificación', time: 'Ayer' },
    ],
    quickActions: [
      { icon: '🤖', label: 'Asistente IA', href: '/ia' },
      { icon: '📋', label: 'Mis Cursos', href: '/mis-cursos' },
      { icon: '🤝', label: 'Asesorías', href: '/asesorias' },
      { icon: '🗂️', label: 'Recursos', href: '/recursos' },
    ],
    bannerSub: 'Revisa las recomendaciones pedagógicas y los grupos activos del semestre.',
  },
  administrador: {
    stats: [
      { icon: '👩‍🎓', value: '1.2K', label: 'Estudiantes' },
      { icon: '👩‍🏫', value: '89', label: 'Profesores activos' },
      { icon: '📚', value: '156', label: 'Cursos disponibles' },
      { icon: '🔄', value: '99.8%', label: 'Uptime plataforma' },
    ],
    activities: [
      { text: '<strong>15 nuevos usuarios</strong> registrados hoy', time: 'Hace 30 min' },
      { text: 'Respaldo automático de base de datos <strong>completado</strong>', time: 'Hace 2 horas' },
      { text: 'Actualización del <strong>módulo IA aplicada</strong> exitosamente', time: 'Hace 6 horas' },
      { text: 'Reporte mensual <strong>Febrero 2025</strong> generado', time: 'Ayer' },
    ],
    quickActions: [
      { icon: '👥', label: 'Gestionar Usuarios', href: '/admin/usuarios' },
      { icon: '⚙️', label: 'Panel Admin', href: '/admin' },
      { icon: '🤖', label: 'Asistente IA', href: '/ia' },
      { icon: '📚', label: 'Contenido', href: '/contenido' },
    ],
    bannerSub: 'Gestiona usuarios, contenido y configuración de la plataforma Saggio.',
  },
}

export default function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.replace('/login')
  }, [user])

  if (!user) return null

  const firstName = user.nombre?.split(' ')[0] || 'Usuario'
  const config = ROLE_CONFIG[user.rol] || ROLE_CONFIG.estudiante

  return (
    <>
      <Head><title>Inicio — Saggio</title></Head>
      <Layout title="Inicio">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <h2>¡Bienvenido/a, {firstName}! 👋</h2>
          <p>{config.bannerSub}</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {config.stats.map((s, i) => (
            <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.07}s` }}>
              <span className="stat-icon">{s.icon}</span>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Two column */}
        <div className="two-col">
          {/* Activity */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Actividad Reciente</span>
              <Link href="/contenido" style={{ fontSize:'0.8rem', color:'var(--orange)', textDecoration:'none', fontWeight:500 }}>
                Ver todo →
              </Link>
            </div>
            <div style={{ padding:'0 1.5rem 0.5rem' }}>
              {config.activities.map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-dot" />
                  <div>
                    <div className="activity-text" dangerouslySetInnerHTML={{ __html: a.text }} />
                    <div className="activity-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card card-padded">
            <div style={{ marginBottom:'1.25rem' }}>
              <span className="card-title">Acciones Rápidas</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              {config.quickActions.map((a, i) => (
                <Link key={i} href={a.href} style={{ textDecoration:'none' }}>
                  <div style={{
                    padding:'1rem',
                    borderRadius:'var(--radius-sm)',
                    border:'1.5px solid var(--gray-200)',
                    background:'var(--white)',
                    cursor:'pointer',
                    transition:'var(--transition)',
                    textAlign:'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--orange)'; e.currentTarget.style.background='var(--orange-light)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--gray-200)'; e.currentTarget.style.background='var(--white)' }}
                  >
                    <div style={{ fontSize:'1.5rem', marginBottom:'0.5rem' }}>{a.icon}</div>
                    <div style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--gray-700)' }}>{a.label}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
