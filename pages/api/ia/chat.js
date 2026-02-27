import { getUserFromRequest } from '../../../lib/auth'
import { supabaseAdmin } from '../../../lib/supabase'

const SYSTEM_PROMPTS = {
  estudiante: `Eres Nova, asistente académico de Saggio, una plataforma educativa universitaria. 
Estás hablando con un ESTUDIANTE universitario.
Responde siempre en español, de forma clara, motivadora y práctica.
Tu rol es ayudar con:
- Estrategias de estudio personalizadas y técnicas de aprendizaje efectivas
- Ejercicios prácticos, talleres y actividades de refuerzo
- Preparación para evaluaciones y exámenes
- Explicación detallada de conceptos académicos con ejemplos
- Orientación sobre metodología de investigación educativa
- Recomendación de recursos adicionales

Usa formato markdown: negritas (**texto**) para conceptos clave, bullets (•) para listas.
Sé conciso pero completo. Máximo 400 palabras por respuesta.
Termina con una pregunta de seguimiento cuando sea apropiado.`,

  profesor: `Eres Nova, asistente pedagógico de Saggio, una plataforma educativa universitaria.
Estás hablando con un PROFESOR universitario.
Responde siempre en español, de forma profesional y basada en evidencia pedagógica.
Tu rol es apoyar con:
- Temas actuales y tendencias en educación superior 2024-2025
- Enfoques pedagógicos innovadores (ABP, Flipped Classroom, Gamificación, etc.)
- Recursos bibliográficos y materiales actualizados
- Técnicas de evaluación auténtica y formativa
- Estrategias didácticas para diferentes estilos de aprendizaje
- Diseño instruccional y planes de clase
- Investigación educativa aplicada al aula

Usa formato markdown. Cita corrientes pedagógicas y autores cuando sea pertinente.
Máximo 400 palabras por respuesta.`,

  administrador: `Eres Nova, asistente de gestión de Saggio, una plataforma LMS universitaria.
Estás hablando con un ADMINISTRADOR de la plataforma.
Responde siempre en español, de forma técnica y orientada a resultados.
Tu rol es apoyar con:
- Mejores prácticas para gestión de plataformas educativas (LMS)
- KPIs y métricas de engagement estudiantil
- Gestión de roles y permisos de usuarios
- Estrategias para aumentar adopción y uso de la plataforma
- Configuración y optimización del sistema
- Seguridad y privacidad de datos en educación
- Análisis de datos y reportería

Usa formato markdown. Sé directo y orientado a soluciones.
Máximo 350 palabras por respuesta.`,
}

// Respuestas de fallback si no hay API key
const FALLBACK_RESPONSES = {
  estudiante: (q) => {
    if (q.includes('estudio') || q.includes('técnica') || q.includes('aprend')) {
      return `**Técnicas de Estudio Recomendadas:**\n\n• **Técnica Pomodoro:** 25 min de estudio + 5 min descanso. Ideal para estadística y metodología\n• **Práctica Espaciada:** Repasa el contenido a los 1, 3, 7 y 14 días. Aumenta retención hasta 80%\n• **Mapas Conceptuales:** Conecta visualmente los temas del módulo con colores\n• **Método Cornell:** Divide tu hoja en notas, preguntas y resumen\n\n¿Quieres que te genere un plan de estudio semanal personalizado?`
    }
    if (q.includes('taller') || q.includes('práctico') || q.includes('ejercicio')) {
      return `**Taller Práctico: Mini-Investigación (3 horas)**\n\n1. Elige un problema cotidiano en tu entorno universitario\n2. Formula una pregunta de investigación SMART\n3. Define objetivos: general y 2 específicos\n4. Propón una hipótesis comprobable\n5. Diseña un mini-instrumento de 5 preguntas\n\n**Criterios de evaluación:**\n• Claridad del problema (25%)\n• Coherencia metodológica (35%)\n• Presentación (40%)\n\n¿Necesitas una plantilla para organizar el taller?`
    }
    return `Entiendo tu consulta. Como estudiante de Saggio, te recomiendo:\n\n• Revisar el módulo correspondiente en **Contenido**\n• Consultar los recursos en la **Biblioteca**\n• Si tienes dudas persistentes, agenda una **asesoría** con un tutor\n• Usa el buscador de la plataforma para encontrar material específico\n\n¿Hay algún tema específico del curso en el que necesites ayuda más detallada?`
  },
  profesor: (q) => {
    if (q.includes('tendencia') || q.includes('actual') || q.includes('tema')) {
      return `**Temas de Alta Relevancia para 2025:**\n\n**🤖 IA en Educación Superior:**\n• Uso ético de IA generativa en el aula\n• Detección de plagio con IA\n• Personalización del aprendizaje\n\n**📊 Learning Analytics:**\n• Dashboards de seguimiento estudiantil\n• Predicción temprana de deserción\n• Evaluación adaptativa\n\n**🌐 Pedagogías Digitales:**\n• Microlearning y nanodegrees\n• Gamificación basada en evidencia\n• Comunidades de práctica en línea\n\n¿Quieres recursos bibliográficos sobre alguno de estos temas?`
    }
    return `Como docente universitario, te sugiero:\n\n• Explorar publicaciones recientes en revistas Q1 del área\n• Adaptar el contenido con **aprendizaje activo**\n• Incorporar evidencias de investigación en tus clases\n• Crear espacios de reflexión crítica\n\n¿Quieres que te ayude a diseñar una actividad o buscar recursos específicos?`
  },
  administrador: (q) => `**Análisis de Gestión Saggio:**\n\nRecomendaciones basadas en mejores prácticas LMS:\n\n• **Engagement:** Implementar notificaciones push personalizadas\n• **Retención:** Gamificación y sistema de logros\n• **Analytics:** Dashboard semanal para coordinadores\n• **Seguridad:** Revisión trimestral de permisos de usuarios\n\n¿Necesitas ayuda con algún aspecto específico de la plataforma?`,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const user = getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'No autenticado' })

  const { messages, userRole } = req.body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Mensajes inválidos' })
  }

  const role = userRole || user.rol || 'estudiante'
  const systemPrompt = SYSTEM_PROMPTS[role] || SYSTEM_PROMPTS.estudiante
  const lastUserMessage = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || ''

  // Try Anthropic API
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (apiKey && apiKey.startsWith('sk-ant-')) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 800,
          system: systemPrompt,
          messages: messages
            .filter(m => m.role !== 'system')
            .slice(-10) // Keep last 10 messages for context
            .map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const aiResponse = data.content?.[0]?.text || ''

        // Save to DB (fire and forget)
        if (supabaseAdmin && lastUserMessage) {
          supabaseAdmin.from('chat_ia').insert({
            usuario_id: user.id,
            rol_usuario: role,
            mensaje_usuario: lastUserMessage,
            respuesta_ia: aiResponse,
          }).then(() => {}).catch(() => {})
        }

        return res.status(200).json({ response: aiResponse })
      }
    } catch (err) {
      console.error('Anthropic API error:', err)
    }
  }

  // Fallback: local responses
  const fallbackFn = FALLBACK_RESPONSES[role] || FALLBACK_RESPONSES.estudiante
  const fallbackResponse = typeof fallbackFn === 'function'
    ? fallbackFn(lastUserMessage.toLowerCase())
    : fallbackFn

  return res.status(200).json({ response: fallbackResponse })
}
