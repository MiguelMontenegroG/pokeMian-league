# 🔐 Sistema de Login para Entrenadores

## 📋 Descripción

Implementación de sistema de autenticación para entrenadores en la PokéMian League. Los entrenadores pueden iniciar sesión y gestionar únicamente sus propios equipos.

## 🚀 Características

- ✅ Login exclusivo para entrenadores creados por el admin
- ✅ Contraseñas asignadas manualmente en la base de datos
- ✅ Cada entrenador solo puede crear equipos a su nombre
- ✅ Los entrenadores solo ven/editan/borran SUS propios equipos
- ✅ CRUD completo (crear, editar, eliminar) en Supabase
- ✅ Sesión persistente en el navegador
- ✅ Interfaz diferenciada para entrenadores vs admin vs público

## 📦 Instalación

### 1. Actualizar la Base de Datos

Ejecuta el script SQL en tu panel de Supabase:

```sql
-- Ve a: https://tu-proyecto.supabase.co -> SQL Editor
-- Copia y pega el contenido de: update-schema-auth.sql
```

O ejecuta manualmente:

```sql
-- Agregar columna password
ALTER TABLE trainers ADD COLUMN IF NOT EXISTS password TEXT;

-- Hacer name único
ALTER TABLE trainers DROP CONSTRAINT IF EXISTS trainers_name_key;
ALTER TABLE trainers ADD CONSTRAINT trainers_name_key UNIQUE (name);
```

### 2. Asignar Contraseñas

Una vez actualizada la BD, asigna contraseñas a los entrenadores existentes:

```sql
-- Ejemplo:
UPDATE trainers SET password = 'pikachu123' WHERE name = 'Ash Ketchum';
UPDATE trainers SET password = 'charizard456' WHERE name = 'Gary Oak';
```

**Importante:** Las contraseñas se guardan en texto plano (solo para uso personal del proyecto).

## 🎮 Uso

### Para el Administrador

1. **Crear Entrenadores:**
   - Haz click 5 veces en el logo para abrir el login de admin
   - Credenciales: `caterpie` / `bidoof`
   - Ve a la pestaña "Entrenadores"
   - Crea nuevos entrenadores

2. **Asignar Contraseñas:**
   - Ve al SQL Editor en Supabase
   - Ejecuta los UPDATE con las contraseñas deseadas
   - Comunica las credenciales a cada entrenador

### Para los Entrenadores

1. **Iniciar Sesión:**
   - Click en el botón "👤 Soy Entrenador" en el header
   - Ingresa tu nombre de entrenador (exactamente como fue creado)
   - Ingresa la contraseña asignada por el admin

2. **Gestionar Equipos:**
   - Una vez logueado, ve a la pestaña "Equipos"
   - Verás SOLO tus equipos
   - El campo "Entrenador" estará bloqueado con tu nombre (🔒)
   - Puedes crear, editar o eliminar tus propios equipos

## 🔒 Restricciones de Seguridad

### Entrenador NO puede:
- ❌ Crear equipos a nombre de otro entrenador
- ❌ Editar o eliminar equipos de otros
- ❌ Acceder al panel de administración
- ❌ Ver equipos de otros (en la vista de equipos)

### Entrenador SÍ puede:
- ✅ Ver todos los equipos en "Clasificación" (público)
- ✅ Ver todos los entrenadores (público)
- ✅ Crear equipos a SU nombre
- ✅ Editar/borrar SUS equipos

## 📁 Archivos Modificados/Creados

### Nuevos Archivos:
- `lib/auth.ts` - Utilidades de autenticación
- `contexts/AuthContext.tsx` - Contexto global de auth
- `update-schema-auth.sql` - Script de actualización BD

### Archivos Modificados:
- `app/layout.tsx` - Integración de AuthProvider
- `app/page.tsx` - Botón de login y estado de entrenador
- `components/LoginModal.tsx` - Soporte para login de entrenadores
- `components/TeamForm.tsx` - Campo trainerName bloqueado para entrenadores
- `components/TeamsView.tsx` - Filtrado de equipos por entrenador
- `supabase-schema.sql` - Políticas RLS actualizadas

## 🧪 Testing

### Flujo Completo:

1. **Admin crea entrenador:**
   ```
   Admin Panel -> Entrenadores -> Nuevo Entrenador
   Nombre: "Ash Ketchum"
   Pokémon Favorito: "Pikachu"
   ```

2. **Admin asigna contraseña:**
   ```sql
   UPDATE trainers SET password = 'pikachu123' WHERE name = 'Ash Ketchum';
   ```

3. **Entrenador inicia sesión:**
   ```
   Click "Soy Entrenador"
   Usuario: Ash Ketchum
   Contraseña: pikachu123
   ```

4. **Entrenador crea equipo:**
   ```
   Pestaña "Equipos" -> "Nuevo Equipo"
   Nombre Equipo: "Rayos Eléctricos"
   Entrenador: 🔒 Ash Ketchum (Tu cuenta) [BLOQUEADO]
   Pokémon: [Seleccionar 6-10 Pokémon]
   ```

5. **Verificar restricciones:**
   - El entrenador SOLO ve SUS equipos
   - NO puede cambiar el campo "Entrenador"
   - Puede editar/borrar sus equipos

## ⚠️ Notas Importantes

1. **Seguridad:** Este sistema es para uso personal/proyecto. Las contraseñas están en texto plano en la BD.

2. **Nombres Únicos:** Los nombres de entrenadores deben ser únicos. No puede haber dos "Ash Ketchum".

3. **Sesión Persistente:** La sesión se guarda en localStorage. Para cerrar sesión completamente, usar el botón "Salir".

4. **Admin Separado:** El login de admin (5 clicks en logo) es independiente del login de entrenadores.

## 🛠️ Solución de Problemas

### Error: "Credenciales incorrectas"
- Verificar que el nombre está escrito EXACTAMENTE como fue creado
- Confirmar que la contraseña fue asignada en la BD
- Revisar mayúsculas/minúsculas

### Error: "No hay entrenadores registrados"
- El admin debe crear al menos un entrenador primero
- Ir al Admin Panel -> Entrenadores -> Crear nuevo

### El campo "Entrenador" no aparece bloqueado
- Asegurarse de haber iniciado sesión como entrenador (no como admin)
- Verificar que la sesión está activa (debe aparecer "👋 Nombre" en el header)

## 📞 Soporte

Para issues o preguntas, revisar:
- Consola del navegador (F12) para ver errores
- Logs de Supabase en el dashboard
- Verificar que `.env.local` tenga las variables correctas
