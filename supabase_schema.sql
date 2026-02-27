-- ============================================================
-- SAGGIO — Esquema de Base de Datos en Supabase (PostgreSQL)
-- 
-- INSTRUCCIONES:
-- 1. Ve a https://supabase.com y crea un proyecto gratis
-- 2. En el dashboard, ve a SQL Editor
-- 3. Pega TODO este archivo y ejecuta con "Run"
-- ============================================================

-- EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLA: usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('estudiante', 'profesor', 'administrador')),
  activo BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  programa VARCHAR(150),
  semestre INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: modulos (contenido académico)
-- ============================================================
CREATE TABLE IF NOT EXISTS modulos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('fundamentos','metodologia','aplicaciones','avanzado')),
  tag VARCHAR(50),
  lecciones INT DEFAULT 0,
  duracion VARCHAR(30),
  orden INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: contenidos (items dentro de un módulo)
-- ============================================================
CREATE TABLE IF NOT EXISTS contenidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modulo_id UUID NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  tipo VARCHAR(30) DEFAULT 'texto' CHECK (tipo IN ('texto','video','quiz','actividad','recurso')),
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: progreso_usuario
-- ============================================================
CREATE TABLE IF NOT EXISTS progreso_usuario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  modulo_id UUID NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  completado BOOLEAN DEFAULT FALSE,
  porcentaje INT DEFAULT 0,
  ultima_actividad TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, modulo_id)
);

-- ============================================================
-- TABLA: recursos (biblioteca de materiales)
-- ============================================================
CREATE TABLE IF NOT EXISTS recursos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('PDF','Video','DOCX','Enlace','App','Web')),
  icono VARCHAR(10) DEFAULT '📄',
  url TEXT,
  tamano VARCHAR(20),
  subido_por UUID REFERENCES usuarios(id),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: asesores (perfil de tutor/asesor)
-- ============================================================
CREATE TABLE IF NOT EXISTS asesores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  especialidad VARCHAR(255),
  descripcion TEXT,
  tags TEXT[],
  disponible BOOLEAN DEFAULT TRUE,
  calificacion DECIMAL(3,2) DEFAULT 5.0,
  total_sesiones INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id)
);

-- ============================================================
-- TABLA: asesorias (solicitudes y sesiones)
-- ============================================================
CREATE TABLE IF NOT EXISTS asesorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estudiante_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  asesor_id UUID NOT NULL REFERENCES asesores(id) ON DELETE CASCADE,
  area VARCHAR(150),
  tema VARCHAR(255),
  descripcion TEXT,
  modalidad VARCHAR(30) DEFAULT 'virtual' CHECK (modalidad IN ('virtual','presencial','chat')),
  estado VARCHAR(30) DEFAULT 'pendiente' CHECK (estado IN ('pendiente','confirmada','en_curso','completada','cancelada')),
  fecha_programada TIMESTAMPTZ,
  calificacion_estudiante INT CHECK (calificacion_estudiante BETWEEN 1 AND 5),
  notas_asesor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: mensajes_asesoria (chat dentro de asesoría)
-- ============================================================
CREATE TABLE IF NOT EXISTS mensajes_asesoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asesoria_id UUID NOT NULL REFERENCES asesorias(id) ON DELETE CASCADE,
  remitente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: notificaciones
-- ============================================================
CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT,
  tipo VARCHAR(30) DEFAULT 'info' CHECK (tipo IN ('info','success','warning','error')),
  leida BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: chat_ia (historial del asistente)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_ia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rol_usuario VARCHAR(20),
  mensaje_usuario TEXT NOT NULL,
  respuesta_ia TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: cursos_profesor (relación profesor-grupo)
-- ============================================================
CREATE TABLE IF NOT EXISTS cursos_profesor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profesor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  codigo VARCHAR(50) UNIQUE,
  horario VARCHAR(100),
  total_estudiantes INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_progreso_usuario ON progreso_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_asesorias_estudiante ON asesorias(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_asesorias_asesor ON asesorias(asesor_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_chat_ia_usuario ON chat_ia(usuario_id);

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_asesorias_updated_at
  BEFORE UPDATE ON asesorias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- DATOS INICIALES — Módulos del curso
-- ============================================================
INSERT INTO modulos (titulo, descripcion, categoria, tag, lecciones, duracion, orden) VALUES
('Introducción a la Investigación Científica', 'Fundamentos epistemológicos y metodológicos de la investigación académica.', 'fundamentos', 'Módulo 1', 8, '4h 30min', 1),
('Diseño Metodológico Cuantitativo', 'Estrategias y herramientas para el diseño de investigaciones con enfoque cuantitativo.', 'metodologia', 'Módulo 2', 10, '5h 15min', 2),
('Investigación Cualitativa', 'Enfoques interpretativos para comprender fenómenos sociales y educativos.', 'metodologia', 'Módulo 3', 9, '4h 45min', 3),
('Revisión Sistemática de Literatura', 'Técnicas para la búsqueda, evaluación y síntesis de literatura científica.', 'fundamentos', 'Módulo 4', 6, '3h', 4),
('Tecnologías Aplicadas a la Educación', 'Integración de herramientas digitales en procesos de enseñanza-aprendizaje.', 'aplicaciones', 'Módulo 5', 12, '6h', 5),
('Análisis de Datos Educativos', 'Técnicas avanzadas para el análisis e interpretación de datos en contextos educativos.', 'avanzado', 'Módulo 6', 14, '7h', 6),
('Innovación Pedagógica', 'Enfoques y modelos pedagógicos contemporáneos para el aula universitaria.', 'aplicaciones', 'Módulo 7', 8, '4h', 7),
('Publicación Científica', 'Proceso completo para la elaboración y publicación de artículos en revistas indexadas.', 'avanzado', 'Módulo 8', 7, '3h 30min', 8)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DATOS INICIALES — Recursos
-- ============================================================
INSERT INTO recursos (titulo, descripcion, tipo, icono, tamano) VALUES
('Guía de Metodología de Investigación', 'Documento completo con todos los pasos para diseñar una investigación académica robusta.', 'PDF', '📄', '2.4 MB'),
('Video: Cómo hacer una revisión bibliográfica', 'Tutorial paso a paso para buscar y organizar literatura científica.', 'Video', '🎥', '45 min'),
('Plantillas APA 7ma Edición', 'Plantillas editables para trabajos de grado, artículos y referencias.', 'DOCX', '📊', '380 KB'),
('Bases de Datos Académicas', 'Acceso institucional a Scopus, Web of Science, JSTOR, Google Scholar.', 'Enlace', '🔗', '—'),
('Rúbricas de Evaluación', 'Criterios de evaluación estandarizados para trabajos, exposiciones y participación.', 'PDF', '📝', '890 KB'),
('Calculadora Estadística Interactiva', 'Herramienta para calcular medidas de tendencia central y pruebas de hipótesis.', 'App', '🧮', 'En línea'),
('Repositorio de Trabajos de Grado', 'Acceso a tesis y proyectos de grado de egresados de la universidad.', 'Web', '🎓', '—'),
('Calendario Académico 2025-I', 'Fechas importantes del semestre: exámenes, entregas y eventos académicos.', 'PDF', '📅', '240 KB')
ON CONFLICT DO NOTHING;

-- ============================================================
-- USUARIO ADMIN POR DEFECTO
-- Contraseña: Admin@Saggio2025
-- CAMBIA ESTO DESPUÉS DE HACER EL PRIMER LOGIN
-- ============================================================
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador Saggio', 'admin@saggio.edu.co', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMqJqhCangelxeUiH.9xCwCaPS', 'administrador')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Seguridad a nivel de fila
-- ============================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE progreso_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE asesorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_ia ENABLE ROW LEVEL SECURITY;

-- Políticas: los usuarios solo ven sus propios datos
-- (La app usa service_role para operaciones del servidor, por eso esto aplica solo a acceso directo)

CREATE POLICY "Usuarios ven su propio perfil" ON usuarios
  FOR SELECT USING (true);

CREATE POLICY "Usuarios actualizan su propio perfil" ON usuarios
  FOR UPDATE USING (auth.uid()::text = id::text);

-- ============================================================
-- VISTA: resumen_plataforma (para admin dashboard)
-- ============================================================
CREATE OR REPLACE VIEW resumen_plataforma AS
SELECT 
  (SELECT COUNT(*) FROM usuarios WHERE rol = 'estudiante' AND activo = TRUE) AS total_estudiantes,
  (SELECT COUNT(*) FROM usuarios WHERE rol = 'profesor' AND activo = TRUE) AS total_profesores,
  (SELECT COUNT(*) FROM usuarios WHERE activo = TRUE) AS total_usuarios,
  (SELECT COUNT(*) FROM modulos WHERE activo = TRUE) AS total_modulos,
  (SELECT COUNT(*) FROM recursos WHERE activo = TRUE) AS total_recursos,
  (SELECT COUNT(*) FROM asesorias WHERE estado = 'completada') AS asesorias_completadas,
  (SELECT COUNT(*) FROM asesorias WHERE estado = 'pendiente') AS asesorias_pendientes,
  (SELECT COUNT(*) FROM chat_ia) AS consultas_ia_total;
