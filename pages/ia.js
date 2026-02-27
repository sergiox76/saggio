import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '../components/Layout'
import { useAuth, useToast } from '../context/AppContext'

const SUGGESTIONS = {
  estudiante: [
    { icon: '📖', label: 'Estrategias de Estudio', text: '¿Qué técnicas de estudio recomiendas para aprender estadística y metodología de investigación?' },
    { icon: '🧩', label: 'Taller Práctico', text: 'Diseña un taller práctico de 2 horas sobre diseño de investigación cualitativa' },
    { icon: '📝', label: 'Preparar Examen', text: 'Ayúdame a crear un plan de repaso para el examen de metodología' },
    { icon: '🔍', label: 'Resolver Dudas', text: '¿Cuál es la diferencia entre investigación cualitativa y cuantitativa? Dame ejemplos prácticos' },
  ],
  profesor: [
    { icon: '💡', label: 'Temas Actuales', text: '¿Qué temas de investigación educativa son tendencia en 2025 para impartir en clase?' },
    { icon: '🎯', label: 'Estrategia Pedagógica', text: 'Recomiéndame un enfoque pedagógico innovador para enseñar estadística a universitarios' },
    { icon: '📖', label: 'Recursos Complementarios', text: 'Necesito bibliografía actualizada sobre metodología de investigación educativa' },
    { icon: '✅', label: 'Técnicas de Evaluación', text: '¿Cuáles son las mejores técnicas de evaluación auténtica en educación superior?' },
  ],
  administrador: [
    { icon: '📊', label: 'Métricas de Plataforma', text: '¿Cuáles son los KPIs más importantes para monitorear una plataforma LMS universitaria?' },
    { icon: '⚙️', label: 'Optimización', text: '¿Cómo puedo mejorar el engagement de los estudiantes en la plataforma?' },
    { icon: '👥', label: 'Gestión de Roles', text: '¿Cuáles son las mejores prácticas para gestión de usuarios en sistemas educativos?' },
    { icon: '🔐', label: 'Seguridad', text: 'Dame recomendaciones de seguridad para una plataforma educativa universitaria' },
  ],
}

const INITIAL_GREETING = {
  estudiante: 'Hola! Soy **Nova**, tu asistente académico de Saggio. 🎓\n\nEstoy aquí para ayudarte con:\n\n• **Estrategias de estudio personalizadas**\n• **Talleres y ejercicios prácticos**\n• **Preparación para evaluaciones**\n• **Explicaciones de temas del curso**\n\n¿Con qué te puedo ayudar hoy?',
  profesor: 'Hola Profesor/a! Soy **Nova**, tu asistente pedagógico de Saggio. 👩‍🏫\n\nPuedo apoyarte con:\n\n• **Temas actuales y tendencias educativas**\n• **Enfoques pedagógicos innovadores**\n• **Recursos y bibliografía actualizada**\n• **Estrategias de evaluación efectiva**\n\n¿Qué necesitas para tus clases?',
  administrador: 'Hola Administrador/a! Soy **Nova**, tu asistente de gestión. ⚙️\n\nPuedo ayudarte con:\n\n• **Análisis de métricas de la plataforma**\n• **Mejores prácticas para LMS**\n• **Gestión de usuarios y roles**\n• **Recomendaciones de configuración**\n\n¿En qué te puedo ayudar?',
}

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />')
    .replace(/•\s/g, '• ')
}

export default function IAPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!user) { router.replace('/login'); return }
    // Initial greeting
    const role = user.rol || 'estudiante'
    setMessages([{
      role: 'assistant',
      content: INITIAL_GREETING[role] || INITIAL_GREETING.estudiante,
    }])
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const msgText = text || input.trim()
    if (!msgText || loading) return
    setInput('')

    const newMessages = [...messages, { role: 'user', content: msgText }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch('/api/ia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userRole: user.rol,
        }),
      })
      const data = await res.json()
      const aiMessage = data.response || 'Lo siento, no pude procesar tu consulta.'
      setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Hubo un error al conectar con el asistente. Por favor intenta nuevamente.',
      }])
    }
    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!user) return null

  const suggestions = SUGGESTIONS[user.rol] || SUGGESTIONS.estudiante
  const roleLabel = { estudiante: 'Estudiante 🎓', profesor: 'Docente 👩‍🏫', administrador: 'Administrador ⚙️' }[user.rol]

  return (
    <>
      <Head><title>Asistente IA — Saggio</title></Head>
      <Layout title="Asistente IA">
        <div style={{ marginBottom:'1.25rem' }}>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'1.4rem', fontWeight:700 }}>
            🤖 Asistente Nova
          </h2>
          <p style={{ color:'var(--gray-400)', fontSize:'0.85rem', marginTop:'0.2rem' }}>
            Modo: {roleLabel} — Respuestas personalizadas según tu rol
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'1.5rem', alignItems:'start' }}>
          {/* CHAT */}
          <div className="chat-container">
            {/* Header */}
            <div className="chat-header">
              <div style={{
                width:40, height:40,
                background:'linear-gradient(135deg,var(--orange),var(--orange-deep))',
                borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem'
              }}>🤖</div>
              <div>
                <div style={{ fontWeight:600, fontSize:'0.9rem' }}>Nova — Asistente Saggio</div>
                <div style={{ fontSize:'0.73rem', color:'#1a8f5a' }}>● En línea</div>
              </div>
              <button
                style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:'0.78rem', color:'var(--gray-400)', padding:'0.4rem 0.8rem', borderRadius:99, border:'1px solid var(--gray-200)' }}
                onClick={() => {
                  const role = user.rol || 'estudiante'
                  setMessages([{ role:'assistant', content: INITIAL_GREETING[role] }])
                }}
              >
                🔄 Limpiar
              </button>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`msg ${msg.role === 'user' ? 'user' : 'bot'}`}>
                  <div className="msg-avatar">
                    {msg.role === 'user'
                      ? (user.nombre?.split(' ')[0]?.[0] || 'U')
                      : '🤖'}
                  </div>
                  <div
                    className="msg-bubble"
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                </div>
              ))}
              {loading && (
                <div className="msg bot">
                  <div className="msg-avatar">🤖</div>
                  <div className="msg-bubble">
                    <div className="typing-indicator">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <textarea
                ref={inputRef}
                className="chat-input"
                placeholder="Escribe tu pregunta... (Enter para enviar)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={loading}
              />
              <button className="send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                ➤
              </button>
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <p style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'0.75rem' }}>
              PREGUNTAS SUGERIDAS
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.text)}
                  disabled={loading}
                  style={{
                    background:'var(--white)', border:'1.5px solid var(--gray-200)',
                    borderRadius:'var(--radius)', padding:'1rem',
                    cursor:'pointer', textAlign:'left', transition:'var(--transition)',
                    fontFamily:'DM Sans, sans-serif',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--orange)'; e.currentTarget.style.background='var(--orange-light)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--gray-200)'; e.currentTarget.style.background='var(--white)' }}
                >
                  <div style={{ fontSize:'1.25rem', marginBottom:'0.35rem' }}>{s.icon}</div>
                  <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--orange)', marginBottom:'0.25rem' }}>{s.label}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--gray-600)', lineHeight:1.5 }}>{s.text}</div>
                </button>
              ))}
            </div>

            <div style={{
              marginTop:'1.25rem', padding:'1rem',
              background:'var(--orange-light)', borderRadius:'var(--radius)',
              border:'1px solid var(--orange-mid)',
            }}>
              <div style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--orange-deep)', marginBottom:'0.4rem' }}>
                💡 Tip para {user.rol === 'estudiante' ? 'estudiantes' : user.rol === 'profesor' ? 'profesores' : 'administradores'}
              </div>
              <div style={{ fontSize:'0.78rem', color:'var(--gray-700)', lineHeight:1.55 }}>
                {user.rol === 'estudiante'
                  ? 'Puedes pedirle a Nova que genere ejercicios, explique conceptos con ejemplos o cree un plan de estudio personalizado.'
                  : user.rol === 'profesor'
                  ? 'Solicita a Nova planes de clase, rúbricas de evaluación o actividades innovadoras basadas en evidencia pedagógica.'
                  : 'Nova puede generarte reportes de actividad, recomendaciones de configuración y resúmenes ejecutivos de la plataforma.'}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
