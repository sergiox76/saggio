# 📖 Saggio — Plataforma Educativa Universitaria

Plataforma educativa universitaria con roles de estudiante, profesor y administrador, asistente IA integrado y sistema de asesorías entre pares.

## 🚀 Stack Tecnológico

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| **Frontend + API** | Next.js 14 | Soporte nativo en Vercel, SSR, API routes |
| **Base de datos** | Supabase (PostgreSQL) | Gratis, tiempo real, RLS, auth |
| **IA** | Anthropic Claude API | Respuestas pedagógicas de alta calidad |
| **Deploy** | Vercel | Deploy automático desde Git, gratis |
| **Auth** | JWT + HTTP-only cookies | Seguro, sin dependencias externas |

---

## 📋 Guía de Despliegue Paso a Paso

### PASO 1: Configurar Supabase (Base de datos GRATIS)

1. Ve a **https://supabase.com** y crea una cuenta gratis
2. Click en **"New Project"** → pon un nombre (ej. `saggio-db`) → elige región más cercana (US East o Brazil)
3. Espera ~2 minutos a que inicie el proyecto
4. Ve a **SQL Editor** (menú izquierdo) → **New Query**
5. **Copia todo el contenido del archivo `supabase_schema.sql`** y pégalo en el editor
6. Click en **"Run"** — esto creará todas las tablas y datos iniciales
7. Ve a **Project Settings → API** y copia:
   - `Project URL` → tu `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public` key → tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → tu `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (nunca la expongas en el frontend)

### PASO 2: Subir código a GitHub

```bash
# En la carpeta del proyecto:
git init
git add .
git commit -m "🎓 Saggio - Plataforma educativa inicial"

# Crea un repositorio en github.com y luego:
git remote add origin https://github.com/TU_USUARIO/saggio.git
git branch -M main
git push -u origin main
```

### PASO 3: Desplegar en Vercel (GRATIS)

1. Ve a **https://vercel.com** y crea cuenta (puedes usar tu cuenta de GitHub)
2. Click en **"Add New Project"**
3. Importa tu repositorio de GitHub `saggio`
4. Vercel detecta automáticamente que es Next.js ✅
5. **IMPORTANTE:** Antes de hacer deploy, configura las variables de entorno:

   Click en **"Environment Variables"** y agrega una por una:

   | Variable | Valor |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon key) |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service role key) |
   | `JWT_SECRET` | Genera uno con: `openssl rand -base64 32` |
   | `ANTHROPIC_API_KEY` | `sk-ant-...` (opcional, hay fallback) |

6. Click en **"Deploy"** 🚀
7. En ~2 minutos tendrás tu URL: `https://saggio.vercel.app`

### PASO 4: Primer login

El sistema viene con un usuario admin preconfigurado:
- **Email:** `admin@saggio.edu.co`
- **Contraseña:** `Admin@Saggio2025`

⚠️ **Cambia la contraseña inmediatamente después del primer login**

---

## 👥 Roles del Sistema

| Rol | Acceso | Funcionalidades |
|-----|--------|-----------------|
| **Estudiante** | Dashboard, Contenido, Asesorías, IA, Recursos | Solicitar asesorías, consultar IA para estudio |
| **Profesor** | Todo lo anterior + Mis Cursos | Gestionar grupos, IA pedagógica, ofrecer asesorías |
| **Administrador** | Todo + Panel Admin | CRUD usuarios, configuración, estadísticas |

---

## 🤖 Asistente IA (Nova)

El asistente usa **Claude Haiku** (el modelo más económico de Anthropic) con prompts especializados por rol:

- **Estudiantes:** Técnicas de estudio, talleres prácticos, preparación para exámenes
- **Profesores:** Tendencias pedagógicas, recursos bibliográficos, diseño instruccional
- **Administradores:** KPIs, gestión LMS, mejores prácticas

Si no configuras la API key de Anthropic, hay **respuestas de fallback** locales que funcionan sin necesidad de la API.

**Costo estimado IA:** ~$0.25 USD por 1,000 consultas con Claude Haiku.

---

## 🗄️ Estructura de Base de Datos

```
usuarios          → Todos los roles del sistema
modulos           → Contenido académico del curso
contenidos        → Items dentro de cada módulo
progreso_usuario  → Seguimiento de avance por estudiante
recursos          → Biblioteca de materiales
asesores          → Perfil de tutores
asesorias         → Solicitudes y sesiones de asesoría
mensajes_asesoria → Chat dentro de asesorías
notificaciones    → Centro de notificaciones
chat_ia           → Historial de consultas al asistente
cursos_profesor   → Grupos y cursos por docente
```

---

## 📁 Estructura del Proyecto

```
saggio/
├── pages/
│   ├── _app.js          → Auth context, Toast system
│   ├── index.js         → Redirect handler
│   ├── login.js         → Login + Register
│   ├── dashboard.js     → Inicio personalizado por rol
│   ├── contenido.js     → Módulos académicos
│   ├── asesorias.js     → Centro de asesorías
│   ├── ia.js            → Asistente Nova
│   ├── recursos.js      → Biblioteca
│   ├── mis-cursos.js    → Vista de profesor
│   └── api/
│       ├── auth/        → login, register, me, logout
│       ├── ia/          → chat con Claude
│       ├── asesorias/   → CRUD asesorías
│       └── modulos/     → API de contenido
├── components/
│   ├── Layout.js        → Sidebar + Topbar
│   └── ExtraPages.js    → Recursos, MisCursos, Admin
├── lib/
│   ├── supabase.js      → Cliente Supabase
│   └── auth.js          → JWT, bcrypt, cookies
├── styles/
│   └── globals.css      → Diseño completo
├── supabase_schema.sql  → ← EJECUTAR EN SUPABASE PRIMERO
├── .env.example         → Template de variables
├── vercel.json          → Config Vercel
└── package.json
```

---

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt** (12 rounds)
- Sesiones con **JWT** en cookies HTTP-only (no accesibles por JavaScript)
- **Row Level Security (RLS)** en Supabase
- Service role key solo en el servidor (nunca en el cliente)
- Variables de entorno nunca en el código

---

## 🆓 Costos en Producción

| Servicio | Plan Gratuito |
|----------|--------------|
| **Vercel** | Gratis (hobby) — hasta 100GB bandwidth/mes |
| **Supabase** | Gratis — 500MB DB, 2GB storage, 50K filas |
| **Anthropic** | Sin plan gratis, pero muy barato (~$0.80/millón tokens Haiku) |
| **GitHub** | Gratis para repos públicos y privados |

**Total costo mensual con uso normal universitario: $0** (o menos de $5 USD con IA activa)

---

## 🔧 Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus keys de Supabase

# 3. Iniciar servidor de desarrollo
npm run dev

# Abrir: http://localhost:3000
```

---

## 📞 Soporte

Si tienes problemas durante el despliegue, los errores más comunes son:
1. **"Invalid API key"** → Revisa las variables de entorno en Vercel
2. **"relation does not exist"** → Ejecuta el SQL schema en Supabase
3. **Build error** → Asegúrate de tener Node.js 18+ localmente

---

*Saggio — Plataforma educativa universitaria · Construida con Next.js + Supabase + Vercel*
