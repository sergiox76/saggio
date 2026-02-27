import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../components/Layout'
import { useAuth, useToast } from '../context/AppContext'

const RECURSOS = [
  { icon:'📄', titulo:'Guía de Metodología de Investigación', desc:'Documento completo con todos los pasos para diseñar una investigación académica robusta.', tipo:'PDF', tamano:'2.4 MB' },
  { icon:'🎥', titulo:'Video: Cómo hacer una revisión bibliográfica', desc:'Tutorial paso a paso para buscar y organizar literatura científica en bases de datos.', tipo:'Video', tamano:'45 min' },
  { icon:'📊', titulo:'Plantillas APA 7ma Edición', desc:'Plantillas editables para trabajos de grado, artículos y referencias bibliográficas.', tipo:'DOCX', tamano:'380 KB' },
  { icon:'🔗', titulo:'Bases de Datos Académicas', desc:'Acceso institucional a Scopus, Web of Science, JSTOR, Google Scholar y más.', tipo:'Enlace', tamano:'—' },
  { icon:'📝', titulo:'Rúbricas de Evaluación', desc:'Criterios estandarizados para trabajos, exposiciones y participación en clase.', tipo:'PDF', tamano:'890 KB' },
  { icon:'🧮', titulo:'Calculadora Estadística Interactiva', desc:'Herramienta para calcular medidas de tendencia central y pruebas de hipótesis.', tipo:'App', tamano:'En línea' },
  { icon:'🎓', titulo:'Repositorio de Trabajos de Grado', desc:'Acceso a tesis y proyectos de grado de egresados de la universidad.', tipo:'Web', tamano:'—' },
  { icon:'📅', titulo:'Calendario Académico 2025-I', desc:'Fechas importantes del semestre: exámenes, entregas y eventos académicos.', tipo:'PDF', tamano:'240 KB' },
]

export function RecursosPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => { if (!user) router.replace('/login') }, [user])
  if (!user) return null

  return (
    <>
      <Head><title>Recursos — Saggio</title></Head>
      <Layout title="Recursos Educativos">
        <div style={{ marginBottom:'1.5rem' }}>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'1.4rem', fontWeight:700 }}>Biblioteca de Recursos</h2>
          <p style={{ color:'var(--gray-400)', fontSize:'0.85rem', marginTop:'0.2rem' }}>Materiales de estudio, guías y herramientas de apoyo académico</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'1.25rem' }}>
          {RECURSOS.map((r, i) => (
            <div key={i} className="card card-padded card-hover"
              onClick={() => showToast(`📥 Accediendo: ${r.titulo}`)}>
              <div style={{
                width:52, height:52, borderRadius:'var(--radius-sm)',
                background:'var(--orange-light)', display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:'1.5rem', marginBottom:'1rem',
              }}>{r.icon}</div>
              <h3 style={{ fontSize:'0.95rem', fontWeight:600, marginBottom:'0.5rem', color:'var(--gray-800)' }}>{r.titulo}</h3>
              <p style={{ fontSize:'0.82rem', color:'var(--gray-600)', lineHeight:1.6, flex:1, marginBottom:'1rem' }}>{r.desc}</p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:'0.75rem', color:'var(--gray-400)' }}>{r.tipo} · {r.tamano}</span>
                <button className="btn btn-primary btn-sm">Acceder</button>
              </div>
            </div>
          ))}
        </div>
      </Layout>
    </>
  )
}

export function MisCursosPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.replace('/login')
    else if (user.rol !== 'profesor' && user.rol !== 'administrador') router.replace('/dashboard')
  }, [user])

  if (!user) return null

  return (
    <>
      <Head><title>Mis Cursos — Saggio</title></Head>
      <Layout title="Mis Cursos">
        <div style={{ marginBottom:'1.5rem' }}>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'1.4rem', fontWeight:700 }}>Mis Cursos</h2>
          <p style={{ color:'var(--gray-400)', fontSize:'0.85rem', marginTop:'0.2rem' }}>Gestiona tus grupos y contenido académico</p>
        </div>

        <div className="stats-grid" style={{ marginBottom:'1.5rem' }}>
          {[
            { icon:'👥', value:'125', label:'Estudiantes activos' },
            { icon:'📋', value:'4', label:'Grupos activos' },
            { icon:'📝', value:'14', label:'Tareas por calificar' },
            { icon:'🤝', value:'12', label:'Asesorías del mes' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <span className="stat-icon">{s.icon}</span>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Grupos Activos</span>
            <button className="btn btn-primary btn-sm" onClick={() => showToast('📝 Formulario de nuevo grupo en desarrollo')}>
              + Nuevo Grupo
            </button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Curso</th><th>Código</th><th>Estudiantes</th><th>Horario</th><th>Estado</th><th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Cálculo Diferencial', 'MAT-101-A', 34, 'Lun/Mié 8:00am', 'active'],
                  ['Álgebra Lineal', 'MAT-203-B', 28, 'Mar/Jue 10:00am', 'active'],
                  ['Estadística Aplicada', 'EST-301-A', 41, 'Vie 2:00pm', 'active'],
                  ['Taller de Investigación', 'INV-101-C', 22, 'Mié 4:00pm', 'inactive'],
                ].map(([nombre, codigo, est, horario, estado], i) => (
                  <tr key={i}>
                    <td><strong>{nombre}</strong></td>
                    <td>{codigo}</td>
                    <td>{est}</td>
                    <td>{horario}</td>
                    <td><span className={`status-dot ${estado}`}>{estado === 'active' ? 'Activo' : 'Pausado'}</span></td>
                    <td><span style={{ color:'var(--orange)', cursor:'pointer', fontSize:'0.8rem', fontWeight:500 }}
                      onClick={() => showToast(`📋 Abriendo ${nombre}`)}>Ver grupo</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    </>
  )
}

export function AdminPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.replace('/login')
    else if (user.rol !== 'administrador') router.replace('/dashboard')
  }, [user])

  if (!user || user.rol !== 'administrador') return null

  return (
    <>
      <Head><title>Administración — Saggio</title></Head>
      <Layout title="Panel de Administración">
        <div style={{ marginBottom:'1.5rem' }}>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'1.4rem', fontWeight:700 }}>⚙️ Panel de Administración</h2>
          <p style={{ color:'var(--gray-400)', fontSize:'0.85rem', marginTop:'0.2rem' }}>Gestiona usuarios, contenido y configuración de Saggio</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1rem', marginBottom:'1.75rem' }}>
          {[
            { icon:'👩‍🎓', value:'1,247', label:'Estudiantes registrados' },
            { icon:'👩‍🏫', value:'89', label:'Profesores activos' },
            { icon:'📚', value:'156', label:'Cursos disponibles' },
            { icon:'🤝', value:'342', label:'Asesorías completadas' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem', transition:'var(--transition)' }}>
              <div style={{ width:48, height:48, borderRadius:'var(--radius-sm)', background:'var(--orange-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:'1.75rem', fontWeight:700, color:'var(--gray-800)', lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--gray-400)', marginTop:'0.2rem' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <div className="card-header">
            <span className="card-title">Usuarios Recientes</span>
            <button className="btn btn-primary btn-sm" onClick={() => showToast('📝 Formulario de usuario disponible pronto')}>
              + Agregar Usuario
            </button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acción</th></tr>
              </thead>
              <tbody>
                {[
                  ['Ana García', 'a.garcia@saggio.edu.co', 'Estudiante', true],
                  ['Carlos Ríos', 'c.rios@saggio.edu.co', 'Profesor', true],
                  ['María López', 'm.lopez@saggio.edu.co', 'Estudiante', false],
                  ['Juan Torres', 'j.torres@saggio.edu.co', 'Profesor', true],
                  ['Sofía Méndez', 's.mendez@saggio.edu.co', 'Estudiante', true],
                ].map(([nombre, email, rol, activo], i) => (
                  <tr key={i}>
                    <td><strong>{nombre}</strong></td>
                    <td style={{ fontSize:'0.82rem', color:'var(--gray-500)' }}>{email}</td>
                    <td>{rol}</td>
                    <td><span className={`status-dot ${activo ? 'active' : 'inactive'}`}>{activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td><span style={{ color:'var(--orange)', cursor:'pointer', fontSize:'0.8rem', fontWeight:500 }} onClick={() => showToast(`✏️ Editando ${nombre}`)}>Editar</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Config */}
        <div className="two-col">
          <div className="card card-padded">
            <div style={{ marginBottom:'1.25rem' }}><span className="card-title">Configuración de Plataforma</span></div>
            {[
              { label:'🤖 Asistente IA Activado', active:true },
              { label:'📧 Notificaciones Email', active:true },
              { label:'🌐 Modo Mantenimiento', active:false },
              { label:'🔐 2FA Obligatorio', active:false },
            ].map((item, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'0.75rem 1rem', background:'var(--gray-50)', borderRadius:'var(--radius-sm)',
                marginBottom:'0.5rem',
              }}>
                <span style={{ fontSize:'0.875rem', color:'var(--gray-700)' }}>{item.label}</span>
                <span className={`badge ${item.active ? 'badge-green' : 'badge-gray'}`}>
                  {item.active ? 'ON' : 'OFF'}
                </span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Actividad de la Plataforma</span></div>
            <div style={{ padding:'0 1.5rem 0.5rem' }}>
              {[
                { text:'<strong>15 nuevos usuarios</strong> registrados hoy', time:'Hace 30 min' },
                { text:'Respaldo automático <strong>completado</strong>', time:'Hace 2 horas' },
                { text:'Módulo IA <strong>actualizado</strong> v2.1', time:'Hace 6 horas' },
                { text:'Reporte mensual <strong>generado</strong>', time:'Ayer' },
              ].map((a, i) => (
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
        </div>
      </Layout>
    </>
  )
}
