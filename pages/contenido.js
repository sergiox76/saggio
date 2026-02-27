import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../components/Layout'
import { useAuth, useToast } from '../context/AppContext'

const TOPICS = [
  { id:1, titulo:'Introducción a la Investigación Científica', categoria:'fundamentos', tag:'Módulo 1', desc:'Fundamentos epistemológicos y metodológicos de la investigación académica universitaria.', lecciones:8, duracion:'4h 30min', contenidos:['Tipos de conocimiento científico','Paradigmas de investigación','El problema científico','Objetivos e hipótesis','Ética en la investigación'] },
  { id:2, titulo:'Diseño Metodológico Cuantitativo', categoria:'metodologia', tag:'Módulo 2', desc:'Estrategias y herramientas para el diseño de investigaciones con enfoque cuantitativo.', lecciones:10, duracion:'5h 15min', contenidos:['Diseño experimental','Muestreo probabilístico','Instrumentos de medición','Validez y confiabilidad','Análisis estadístico'] },
  { id:3, titulo:'Investigación Cualitativa', categoria:'metodologia', tag:'Módulo 3', desc:'Enfoques interpretativos para comprender fenómenos sociales y educativos.', lecciones:9, duracion:'4h 45min', contenidos:['Etnografía y observación','Entrevistas en profundidad','Grupos focales','Análisis del discurso','Teoría fundamentada'] },
  { id:4, titulo:'Revisión Sistemática de Literatura', categoria:'fundamentos', tag:'Módulo 4', desc:'Técnicas para la búsqueda, evaluación y síntesis de literatura científica.', lecciones:6, duracion:'3h', contenidos:['Bases de datos académicas','Criterios de inclusión/exclusión','Protocolo PRISMA','Síntesis narrativa','Metaanálisis'] },
  { id:5, titulo:'Tecnologías Aplicadas a la Educación', categoria:'aplicaciones', tag:'Módulo 5', desc:'Integración de herramientas digitales en procesos de enseñanza-aprendizaje.', lecciones:12, duracion:'6h', contenidos:['LMS y plataformas e-learning','Gamificación educativa','IA en el aula','Realidad aumentada','Evaluación digital'] },
  { id:6, titulo:'Análisis de Datos Educativos', categoria:'avanzado', tag:'Módulo 6', desc:'Técnicas avanzadas para el análisis e interpretación de datos educativos.', lecciones:14, duracion:'7h', contenidos:['R y Python para educación','Visualización de datos','Minería de datos','Modelos predictivos','Dashboard educativo'] },
  { id:7, titulo:'Innovación Pedagógica', categoria:'aplicaciones', tag:'Módulo 7', desc:'Enfoques y modelos pedagógicos contemporáneos para el aula universitaria.', lecciones:8, duracion:'4h', contenidos:['Aula invertida (Flipped)','Aprendizaje basado en proyectos','Design Thinking','Evaluación auténtica','Comunidades de aprendizaje'] },
  { id:8, titulo:'Publicación Científica', categoria:'avanzado', tag:'Módulo 8', desc:'Proceso completo para la elaboración y publicación de artículos en revistas indexadas.', lecciones:7, duracion:'3h 30min', contenidos:['Estructura IMRAD','Selección de revistas','Revisión por pares','Gestores de referencias','Acceso abierto'] },
]

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'fundamentos', label: 'Fundamentos' },
  { id: 'metodologia', label: 'Metodología' },
  { id: 'aplicaciones', label: 'Aplicaciones' },
  { id: 'avanzado', label: 'Avanzado' },
]

export default function ContenidoPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [filter, setFilter] = useState('todos')
  const [selectedTopic, setSelectedTopic] = useState(null)

  useEffect(() => {
    if (!user) router.replace('/login')
  }, [user])

  const filtered = filter === 'todos' ? TOPICS : TOPICS.filter(t => t.categoria === filter)

  function getRoleContent(topic) {
    if (user?.rol === 'estudiante') return {
      title: '🎯 Actividades Recomendadas',
      items: ['Crea un mapa conceptual del módulo','Realiza el cuestionario de autoevaluación','Practica con el ejercicio de caso de estudio','Revisa lecturas complementarias en Recursos','Consulta con un tutor si tienes dudas'],
    }
    if (user?.rol === 'profesor') return {
      title: '💡 Recomendaciones Pedagógicas',
      items: ['Inicia con actividad rompe-hielo de 10 minutos','Usa casos reales del contexto local','Asigna lectura previa para flipped classroom','Evalúa con debate estructurado en pares','Comparte recursos del repositorio'],
    }
    return {
      title: '⚙️ Gestión del Módulo',
      items: ['Verificar permisos de acceso por grupo','Revisar estadísticas de completación','Actualizar materiales si es necesario'],
    }
  }

  if (!user) return null

  const roleContent = selectedTopic ? getRoleContent(selectedTopic) : null

  return (
    <>
      <Head><title>Contenido — Saggio</title></Head>
      <Layout title="Biblioteca de Contenido">
        {/* Header */}
        <div className="card card-padded" style={{ marginBottom:'1.5rem' }}>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'1.4rem', fontWeight:700, marginBottom:'0.5rem' }}>
            Módulos del Curso
          </h2>
          <p style={{ color:'var(--gray-600)', fontSize:'0.9rem', lineHeight:1.6 }}>
            Explora el contenido organizado por categoría. Haz clic en cualquier módulo para ver los detalles y recursos.
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding:'0.4rem 1rem', borderRadius:99,
                border: filter === f.id ? '1.5px solid var(--orange)' : '1.5px solid var(--gray-200)',
                background: filter === f.id ? 'var(--orange)' : 'var(--white)',
                color: filter === f.id ? 'white' : 'var(--gray-600)',
                fontFamily:'DM Sans,sans-serif', fontSize:'0.82rem', fontWeight:500,
                cursor:'pointer', transition:'var(--transition)',
              }}
            >{f.label}</button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1.25rem' }}>
          {filtered.map(t => (
            <div key={t.id} className="card card-hover" onClick={() => setSelectedTopic(t)}>
              <div style={{ height:5, background:'linear-gradient(90deg,var(--orange),var(--orange-mid))' }} />
              <div style={{ padding:'1.25rem' }}>
                <span className="badge badge-orange" style={{ marginBottom:'0.75rem' }}>{t.tag}</span>
                <h3 style={{ fontFamily:'Playfair Display,serif', fontSize:'1rem', fontWeight:700, marginBottom:'0.5rem', lineHeight:1.4 }}>
                  {t.titulo}
                </h3>
                <p style={{ fontSize:'0.82rem', color:'var(--gray-600)', lineHeight:1.6 }}>{t.desc}</p>
              </div>
              <div style={{ padding:'0.75rem 1.25rem', borderTop:'1px solid var(--gray-100)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontSize:'0.75rem', color:'var(--gray-400)' }}>
                  📖 {t.lecciones} lecciones · ⏱️ {t.duracion}
                </span>
                <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); setSelectedTopic(t) }}>
                  Ver más
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {selectedTopic && (
          <div className="modal-overlay" onClick={() => setSelectedTopic(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{selectedTopic.titulo}</h3>
                <button className="modal-close" onClick={() => setSelectedTopic(null)}>×</button>
              </div>
              <div className="modal-body">
                <p style={{ fontSize:'0.9rem', color:'var(--gray-600)', lineHeight:1.7, marginBottom:'1.25rem' }}>
                  {selectedTopic.desc}
                </p>

                <div style={{ marginBottom:'1.25rem' }}>
                  <h4 style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'0.75rem' }}>
                    📌 Contenidos del Módulo
                  </h4>
                  <ul style={{ paddingLeft:'1.2rem', display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                    {selectedTopic.contenidos.map((c, i) => (
                      <li key={i} style={{ fontSize:'0.875rem', color:'var(--gray-700)' }}>{c}</li>
                    ))}
                  </ul>
                </div>

                {roleContent && (
                  <div style={{ background:'var(--orange-light)', borderRadius:'var(--radius-sm)', padding:'1rem' }}>
                    <h4 style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--orange-deep)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'0.75rem' }}>
                      {roleContent.title}
                    </h4>
                    <ul style={{ paddingLeft:'1.2rem', display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                      {roleContent.items.map((item, i) => (
                        <li key={i} style={{ fontSize:'0.875rem', color:'var(--gray-700)' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setSelectedTopic(null)}>Cerrar</button>
                <button className="btn btn-primary" style={{ flex:1 }} onClick={() => { setSelectedTopic(null); router.push('/ia') }}>
                  🤖 Consultar al Asistente IA
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  )
}
