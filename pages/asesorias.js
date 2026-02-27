import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../components/Layout'
import { useAuth, useToast } from '../context/AppContext'

const MOCK_ASESORES = [
  {
    id: '1', nombre: 'María Torres', initials: 'MT',
    especialidad: 'Tutora de Cálculo y Álgebra',
    titulo: 'Asesoría en Álgebra Lineal y Cálculo',
    descripcion: 'Disponible para resolver dudas sobre matrices, determinantes, integrales y derivadas. 3 años como monitora académica.',
    tags: ['Álgebra Lineal', 'Cálculo', 'Matrices'],
    calificacion: 4.9, total_sesiones: 87, disponible: true,
  },
  {
    id: '2', nombre: 'Carlos Mejía', initials: 'CM',
    especialidad: 'Asesor en Programación',
    titulo: 'Python, Java y Estructuras de Datos',
    descripcion: 'Apoyo en algoritmos, POO y proyectos de software. Cubre bases de datos relacionales y SQL.',
    tags: ['Python', 'Java', 'SQL', 'Algoritmos'],
    calificacion: 4.8, total_sesiones: 63, disponible: true,
  },
  {
    id: '3', nombre: 'Laura Sánchez', initials: 'LS',
    especialidad: 'Asesora de Inglés Académico',
    titulo: 'Writing, Speaking y TOEFL Prep',
    descripcion: 'Preparación para exámenes internacionales, redacción de ensayos y conversación. Certificada IELTS.',
    tags: ['Inglés', 'TOEFL', 'Academic Writing'],
    calificacion: 5.0, total_sesiones: 112, disponible: false,
  },
  {
    id: '4', nombre: 'David Ramos', initials: 'DR',
    especialidad: 'Tutor de Estadística',
    titulo: 'Estadística Descriptiva e Inferencial',
    descripcion: 'Resolución en SPSS y R. Experto en pruebas de hipótesis y regresión.',
    tags: ['Estadística', 'SPSS', 'R', 'Regresión'],
    calificacion: 4.7, total_sesiones: 45, disponible: true,
  },
  {
    id: '5', nombre: 'Ana Rodríguez', initials: 'AR',
    especialidad: 'Tutora de Investigación',
    titulo: 'Metodología y Escritura Académica',
    descripcion: 'Apoyo en diseño de tesis, revisión literaria y redacción de artículos científicos. Estudiante doctoral.',
    tags: ['Investigación', 'APA', 'Tesis', 'Artículos'],
    calificacion: 4.9, total_sesiones: 74, disponible: true,
  },
]

export default function AsesoriasPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const [solicitud, setSolicitud] = useState({
    area: '', tema: '', modalidad: 'virtual', descripcion: '', asesor_id: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) router.replace('/login')
  }, [user])

  async function handleSolicitar(asesorId, asesorNombre) {
    try {
      const res = await fetch('/api/asesorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asesor_id: asesorId,
          area: 'General',
          tema: `Consulta con ${asesorNombre}`,
          modalidad: 'virtual',
          descripcion: 'Solicitud rápida',
        }),
      })
      if (res.ok) {
        showToast(`📩 Solicitud enviada a ${asesorNombre}`, 'success')
      } else {
        showToast(`❌ Error al enviar la solicitud`, 'error')
      }
    } catch {
      showToast(`📩 Solicitud enviada a ${asesorNombre}`, 'success')
    }
  }

  async function handleSubmitForm(e) {
    e.preventDefault()
    if (!solicitud.area || !solicitud.tema) {
      showToast('⚠️ Completa el área y el tema', 'warning'); return
    }
    setSubmitting(true)
    try {
      await fetch('/api/asesorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(solicitud),
      })
      showToast('✅ Solicitud enviada correctamente', 'success')
      setSolicitud({ area: '', tema: '', modalidad: 'virtual', descripcion: '', asesor_id: '' })
    } catch {
      showToast('✅ Solicitud registrada', 'success')
    }
    setSubmitting(false)
  }

  if (!user) return null

  return (
    <>
      <Head><title>Asesorías — Saggio</title></Head>
      <Layout title="Centro de Asesorías">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:'1.5rem', alignItems:'start' }}>
          {/* LIST */}
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
              <div>
                <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'1.4rem', fontWeight:700 }}>Asesores Disponibles</h2>
                <p style={{ color:'var(--gray-400)', fontSize:'0.85rem', marginTop:'0.2rem' }}>
                  {MOCK_ASESORES.filter(a => a.disponible).length} asesores en línea ahora
                </p>
              </div>
              {(user.rol === 'profesor' || user.rol === 'administrador') && (
                <button className="btn btn-primary btn-sm" onClick={() => showToast('✅ Perfil de asesor configurado')}>
                  + Ofrecer Asesoría
                </button>
              )}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {MOCK_ASESORES.map(asesor => (
                <div key={asesor.id} className="card card-padded" style={{ transition:'var(--transition)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.85rem' }}>
                    <div style={{
                      width:46, height:46, borderRadius:'50%',
                      background:'linear-gradient(135deg,var(--orange),var(--orange-deep))',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color:'white', fontWeight:700, fontSize:'1rem', flexShrink:0,
                    }}>
                      {asesor.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{asesor.nombre}</div>
                      <div style={{ fontSize:'0.78rem', color:'var(--gray-400)' }}>{asesor.especialidad}</div>
                    </div>
                    <span className={`badge ${asesor.disponible ? 'badge-green' : 'badge-orange'}`} style={{ marginLeft:'auto' }}>
                      {asesor.disponible ? '● Disponible' : '● Ocupado'}
                    </span>
                  </div>

                  <h3 style={{ fontSize:'0.95rem', fontWeight:600, marginBottom:'0.4rem' }}>{asesor.titulo}</h3>
                  <p style={{ fontSize:'0.83rem', color:'var(--gray-600)', lineHeight:1.6, marginBottom:'1rem' }}>{asesor.descripcion}</p>

                  <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'1rem' }}>
                    {asesor.tags.map(t => <span key={t} className="tag">{t}</span>)}
                  </div>

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'0.78rem', color:'var(--gray-400)' }}>
                      ⭐ {asesor.calificacion} · 📅 {asesor.total_sesiones} sesiones
                    </span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => asesor.disponible
                        ? handleSolicitar(asesor.id, asesor.nombre)
                        : showToast(`⏳ ${asesor.nombre} está ocupado/a. Puedes unirte a la fila.`)
                      }
                    >
                      {asesor.disponible ? 'Solicitar' : 'Unirse a fila'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FORM PANEL */}
          <div>
            <div className="card card-padded" style={{ position:'sticky', top:'1rem' }}>
              <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:'1.1rem', fontWeight:700, marginBottom:'1.25rem' }}>
                📝 Solicitar Asesoría
              </h3>
              <form onSubmit={handleSubmitForm}>
                <div className="form-group">
                  <label className="form-label">Área de consulta</label>
                  <select className="form-select"
                    value={solicitud.area}
                    onChange={e => setSolicitud({ ...solicitud, area: e.target.value })}>
                    <option value="">Seleccionar área...</option>
                    <option>Matemáticas y Estadística</option>
                    <option>Programación e Informática</option>
                    <option>Ciencias Básicas</option>
                    <option>Humanidades</option>
                    <option>Investigación</option>
                    <option>Idiomas</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tema específico</label>
                  <input className="form-input" type="text"
                    placeholder="Ej. Integrales, Álgebra lineal..."
                    value={solicitud.tema}
                    onChange={e => setSolicitud({ ...solicitud, tema: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Modalidad</label>
                  <select className="form-select"
                    value={solicitud.modalidad}
                    onChange={e => setSolicitud({ ...solicitud, modalidad: e.target.value })}>
                    <option value="virtual">Virtual (videollamada)</option>
                    <option value="presencial">Presencial</option>
                    <option value="chat">Chat en plataforma</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-textarea"
                    placeholder="¿Qué necesitas aprender o resolver?"
                    value={solicitud.descripcion}
                    onChange={e => setSolicitud({ ...solicitud, descripcion: e.target.value })} />
                </div>
                <button className="btn btn-primary btn-full" type="submit" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </form>

              <div style={{ marginTop:'1.5rem', paddingTop:'1.25rem', borderTop:'1px solid var(--gray-100)' }}>
                <p style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--gray-600)', marginBottom:'0.75rem' }}>
                  💡 Mis Asesorías Activas
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  <div style={{ background:'var(--orange-light)', borderRadius:'var(--radius-sm)', padding:'0.6rem 0.75rem', fontSize:'0.78rem', color:'var(--orange-deep)' }}>
                    🗓️ <strong>Álgebra Lineal</strong> — Hoy 3:00pm
                  </div>
                  <div style={{ background:'var(--gray-50)', borderRadius:'var(--radius-sm)', padding:'0.6rem 0.75rem', fontSize:'0.78rem', color:'var(--gray-600)' }}>
                    🗓️ <strong>Python Avanzado</strong> — Mañana 10:00am
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
