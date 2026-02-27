import { supabaseAdmin } from '../../../lib/supabase'
import { hashPassword, signToken, setAuthCookie } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const { nombre, email, password, rol } = req.body

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })
  }

  const rolPermitido = ['estudiante', 'profesor'].includes(rol) ? rol : 'estudiante'

  try {
    const hash = hashPassword(password)

    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .insert({
        nombre: nombre.trim(),
        email: email.toLowerCase().trim(),
        password_hash: hash,
        rol: rolPermitido,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Este correo ya está registrado' })
      }
      throw error
    }

    return res.status(201).json({ message: 'Usuario creado exitosamente', userId: user.id })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Error al crear el usuario' })
  }
}
