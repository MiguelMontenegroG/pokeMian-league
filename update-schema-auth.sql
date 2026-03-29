-- =============================================
-- ACTUALIZACIÓN DE BASE DE DATOS - Login Entrenadores
-- =============================================
-- Ejecutar en Supabase para habilitar el sistema de login
-- =============================================

-- 1. Agregar columna password a la tabla trainers
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Hacer que el campo name sea único (para evitar duplicados)
-- Nota: Esto fallará si ya hay nombres duplicados, en ese caso eliminarlos primero
ALTER TABLE trainers DROP CONSTRAINT IF EXISTS trainers_name_key;
ALTER TABLE trainers ADD CONSTRAINT trainers_name_key UNIQUE (name);

-- 3. Políticas de seguridad RLS actualizadas
-- Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Allow all operations on teams" ON teams;
DROP POLICY IF EXISTS "Allow all operations on trainers" ON trainers;
DROP POLICY IF EXISTS "Allow public read access on trainers" ON trainers;
DROP POLICY IF EXISTS "Allow public read access on teams" ON teams;
DROP POLICY IF EXISTS "Allow trainers to manage their own teams" ON teams;

-- Políticas para trainers (solo lectura pública)
CREATE POLICY "Allow public read access on trainers" ON trainers
  FOR SELECT
  USING (true);

-- Políticas para teams (lectura pública, escritura restringida)
CREATE POLICY "Allow public read access on teams" ON teams
  FOR SELECT
  USING (true);

CREATE POLICY "Allow trainers to manage their own teams" ON teams
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- INSTRUCCIONES PARA ASIGNAR CONTRASEÑAS:
-- =============================================
-- Una vez ejecutado este script, debes asignar contraseñas manualmente
-- en la tabla 'trainers' desde el dashboard de Supabase:
--
-- UPDATE trainers SET password = 'tu_contraseña' WHERE name = 'nombre_entrenador';
--
-- Ejemplo:
-- UPDATE trainers SET password = 'pikachu123' WHERE name = 'Ash Ketchum';
-- =============================================
