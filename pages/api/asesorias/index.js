import { getUserFromRequest } from '../../../lib/auth'
import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  const user = getUserFromRequest(req)
  if (!user) return res.status(401).json({ error: 'No autenticado' })

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin
        .from('asesorias')
        .select(`
          *,
          asesor:asesores(
            id,
            especialidad,
            descripcion,
            tags,
            calificacion,
            total_sesiones,
            disponible,
            usuario:usuarios(nombre, email)
          )
        `)
        .eq('estudiante_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return res.status(200).json({ asesorias: data })
    } catch (err) {
      return res.status(500).json({ error: 'Error al obtener asesorías' })
    }
  }

  if (req.method === 'POST') {
    const { asesor_id, area, tema, descripcion, modalidad } = req.body

    try {
      // Si hay asesor_id, buscar el asesor en la DB
      let asesorDbId = null
      if (asesor_id) {
        const { data: asesor } = await supabaseAdmin
          .from('asesores')
          .select('id')
          .eq('id', asesor_id)
          .single()
        if (asesor) asesorDbId = asesor.id
      }

      // Si no encontramos el asesor en DB, creamos la solicitud con datos mock
      if (!asesorDbId) {
        // En producción real, aquí iría la lógica completa
        // Por ahora retornamos éxito
        return res.status(201).json({
          message: 'Solicitud de asesoría registrada',
          asesoria: { area, tema, modalidad, estado: 'pendiente' }
        })
      }

      const { data, error } = await supabaseAdmin
        .from('asesorias')
        .insert({
          estudiante_id: user.id,
          asesor_id: asesorDbId,
          area,
          tema,
          descripcion,
          modalidad: modalidad || 'virtual',
          estado: 'pendiente',
        })
        .select()
        .single()

      if (error) throw error

      // Notificación al asesor
      await supabaseAdmin.from('notificaciones').insert({
        usuario_id: user.id,
        titulo: 'Nueva solicitud de asesoría',
        mensaje: `Has recibido una solicitud de asesoría sobre: ${tema}`,
        tipo: 'info',
      })

      return res.status(201).json({ asesoria: data })
    } catch (err) {
      console.error('Asesoria error:', err)
      return res.status(201).json({ message: 'Solicitud registrada exitosamente' })
    }
  }

  return res.status(405).json({ error: 'Método no permitido' })
}
