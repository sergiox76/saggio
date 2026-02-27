import { supabaseAdmin } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })

  try {
    const { data, error } = await supabaseAdmin
      .from('modulos')
      .select('*, contenidos(*)')
      .eq('activo', true)
      .order('orden')

    if (error) throw error
    return res.status(200).json({ modulos: data })
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener módulos' })
  }
}
