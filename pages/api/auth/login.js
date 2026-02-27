import { supabaseAdmin } from '../../../lib/supabase'
import { verifyPassword, signToken, setAuthCookie } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' })
  }

  try {
    // Buscar usuario en Supabase
    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('activo', true)
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const valid = verifyPassword(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    // Crear token JWT
    const token = signToken({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    })

    // Set cookie HTTP-only
    setAuthCookie(res, token)

    return res.status(200).json({
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        programa: user.programa,
        semestre: user.semestre,
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
