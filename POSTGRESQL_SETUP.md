# Guía de Instalación PostgreSQL - Windows

## Opción 1: Instalador Directo (Recomendado)

### Paso 1: Descargar PostgreSQL
1. Ve a https://www.postgresql.org/download/windows/
2. Descarga la versión **15** o superior
3. Ejecuta el instalador

### Paso 2: Instalación
- **Puerto**: 5432 (por defecto)
- **Usuario**: postgres
- **Contraseña**: password (o la que prefieras)
- **Locale**: Spanish

### Paso 3: Verificar instalación
Abre PowerShell y ejecuta:
```powershell
psql -U postgres -c "SELECT version();"
```

Deberías ver la versión de PostgreSQL.

---

## Opción 2: Docker (Más Fácil)

Si prefieres evitar instalar PostgreSQL en el sistema:

```powershell
# Tener Docker instalado
docker-compose up -d postgres
```

Esto crea un contenedor con PostgreSQL automáticamente.

---

## Crear la Base de Datos

### Con psql (línea de comandos):

```powershell
psql -U postgres
```

Luego ejecuta en la consola psql:

```sql
-- Crear base de datos
CREATE DATABASE pokerkings;

-- Verificar
\l

-- Salir
\q
```

### O con este script (PowerShell):

```powershell
$env:PGPASSWORD = "password"
psql -U postgres -h localhost -c "CREATE DATABASE pokerkings;"
```

---

## Opciones de Contraseña

Si no quieres usar `password`, edita `.env`:

```env
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pokerkings
```

Y cuando crees la BD, usa esa contraseña.

---

## Verificar Conexión desde Node.js

Una vez instalado PostgreSQL:

```bash
cd backend
npm install
npm run dev
```

Deberías ver:
```
✅ PostgreSQL connected successfully
📊 Database: PostgreSQL
```

---

## Troubleshooting

### Error: "psql: comando no encontrado"
→ Agrega PostgreSQL al PATH de Windows
→ Reinicia PowerShell después

### Error: "password authentication failed"
→ Verifica la contraseña en `.env`
→ Verifica que PostgreSQL está ejecutándose

### Error: "port 5432 already in use"
→ PostgreSQL ya está corriendo (normal)
→ O hay otro servicio en el puerto

---

## Siguiente Paso

Una vez tengas PostgreSQL corriendo, ejecuta:

```bash
cd backend
npm install
npm run dev
```

Eso creará las tablas automáticamente en PostgreSQL.
