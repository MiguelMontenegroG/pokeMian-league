# Configuración de Supabase para PokéMian League

## Pasos para configurar la base de datos:

### 1. Crear proyecto en Supabase
1. Ve a https://app.supabase.com
2. Inicia sesión o crea una cuenta gratuita
3. Click en "New Project"
4. Elige un nombre (ej: "pokeMian-league")
5. Establece una contraseña fuerte para la base de datos
6. Selecciona una región cercana a ti
7. Click en "Create new project" (toma ~2 minutos)

### 2. Obtener credenciales
Una vez creado el proyecto:
1. Ve a **Settings** (engranaje en la barra lateral)
2. Click en **API**
3. Copia los siguientes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configurar variables de entorno
1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza los valores:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-key-aqui
```

### 4. Crear tablas en Supabase
1. En tu proyecto de Supabase, ve a **SQL Editor** (en la barra lateral)
2. Click en "New Query"
3. Copia y pega TODO el contenido del archivo `supabase-schema.sql`
4. Click en "Run" o presiona Ctrl+Enter
5. Deberías ver mensajes de éxito como "Success. No rows returned"

Esto creará:
- ✅ Tabla `teams` para equipos Pokémon
- ✅ Tabla `trainers` para entrenadores con medallas
- ✅ Políticas de seguridad (RLS) para permitir acceso total
- ✅ Índices para mejor rendimiento

### 5. Verificar creación
1. Ve a **Table Editor** en Supabase
2. Deberías ver dos tablas: `teams` y `trainers`
3. ¡Listo! Ya puedes usar la aplicación

## Despliegue en Vercel

### 1. Subir código a GitHub
```bash
git init
git add .
git commit -m "Initial commit with Supabase"
git branch -M main
git remote add origin https://github.com/tu-usuario/pokeMian-league.git
git push -u origin main
```

### 2. Conectar Vercel con GitHub
1. Ve a https://vercel.com
2. Inicia sesión con GitHub
3. Click en "Add New..." → "Project"
4. Importa tu repositorio de GitHub
5. **IMPORTANTE**: Agrega las variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click en "Deploy"

### 3. Actualizar políticas RLS (opcional pero recomendado)
Para producción, deberías restringir el acceso:

En Supabase SQL Editor, ejecuta:
```sql
-- Solo lectura pública (cualquiera puede ver)
DROP POLICY "Allow all operations on teams" ON teams;
CREATE POLICY "Public read access for teams" ON teams
  FOR SELECT
  USING (true);

-- Solo admin puede escribir (requiere autenticación)
-- Esto requiere implementar auth.user_id en el futuro

-- Lo mismo para trainers
DROP POLICY "Allow all operations on trainers" ON trainers;
CREATE POLICY "Public read access for trainers" ON trainers
  FOR SELECT
  USING (true);
```

## Notas importantes:

- ✅ **Plan gratuito**: 500MB de base de datos, 50k lecturas/día (suficiente para uso personal)
- ✅ **Datos persistentes**: Los datos se mantienen aunque cierres la app
- ✅ **Multi-dispositivo**: Los mismos datos en todos lados
- ⚠️ **Seguridad**: Las políticas actuales permiten todo acceso. Para producción real, implementa autenticación

## Solución de problemas:

### Error: "Invalid API key"
- Verifica que copiaste bien las keys en `.env.local`
- Asegúrate de usar `NEXT_PUBLIC_` en los nombres
- Reinicia el servidor: `npm run dev`

### Error: "relation does not exist"
- Ejecutaste el SQL schema en Supabase?
- Verifica en Table Editor que existen las tablas

### Los datos no se guardan
- Revisa la consola del navegador (F12) para errores
- Verifica que Supabase está conectado en la red

## Migración desde localStorage

Si ya tenías datos en localStorage y quieres migrarlos:

1. Abre la consola del navegador en tu app
2. Ejecuta:
```javascript
// Exportar teams
const teams = JSON.parse(localStorage.getItem('pokeMianTeams') || '[]')
console.log('Teams a migrar:', teams)

// Luego inserta manualmente en Supabase Table Editor o usa el SQL Editor
```
