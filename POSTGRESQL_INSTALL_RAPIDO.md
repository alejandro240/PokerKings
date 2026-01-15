# Instalación Rápida de PostgreSQL en Windows

## ¿Ya tienes PostgreSQL instalado?

Abre PowerShell y ejecuta:
```powershell
psql --version
```

- **Si ves una versión** → Ya lo tienes instalado, ve al paso 3
- **Si ves "no se reconoce"** → Instala PostgreSQL (sigue abajo)

---

## Paso 1: Descargar PostgreSQL

1. Ve a: https://www.postgresql.org/download/windows/
2. Haz clic en **"Download the installer"**
3. Descarga **PostgreSQL 15** (o superior)

---

## Paso 2: Instalar PostgreSQL

Ejecuta el instalador:

| Campo | Valor |
|-------|-------|
| **Directorio instalación** | (por defecto: `C:\Program Files\PostgreSQL\15`) |
| **Usuario** | `postgres` |
| **Contraseña** | `password` |
| **Puerto** | `5432` |
| **Locale** | Spanish / Español |
| **Components** | Marca TODOS ✓ |

Cuando termine:
- ✓ Marca "Launch Stack Builder?" → **NO**
- ✓ Click en **Finish**

---

## Paso 3: Verificar Instalación

Abre **PowerShell** (como administrador) y ejecuta:

```powershell
psql -U postgres -c "SELECT version();"
```

Si ves algo como:
```
PostgreSQL 15.1 on x86_64-pc-windows-vs15...
```

✅ **Está funcionando!**

---

## Paso 4: Crear la Base de Datos

En PowerShell, ejecuta:

```powershell
$env:PGPASSWORD = "password"
psql -U postgres -h localhost -c "CREATE DATABASE pokerkings;"
psql -U postgres -h localhost -c "\l"
```

Deberías ver "pokerkings" en la lista.

---

## Paso 5: Iniciar el Backend

En PowerShell, navega a la carpeta del proyecto:

```powershell
cd C:\Users\Pablo\Desktop\PROJECTE\PokerKings\backend
npm install
npm run dev
```

Deberías ver:
```
✅ PostgreSQL connected successfully
🎉 ¡Base de datos poblada exitosamente!
🚀 Servidor corriendo en puerto 3000
```

---

## ¿Algo salió mal?

### Error: "No se encuentra psql"
- PostgreSQL no está en el PATH de Windows
- Solución: Reinicia PowerShell después de instalar PostgreSQL

### Error: "Authentication failed"
- La contraseña es incorrecta
- Solución: Usa `password` (sin comillas)

### Error: "Port 5432 already in use"
- PostgreSQL ya está corriendo (¡normal!)
- Intenta conectar directamente

### Error: "Cannot connect"
- PostgreSQL no está ejecutándose
- Solución: Ve a **Services** (Win+R → services.msc) y busca "postgresql-x64-15"
- Haz clic derecho → **Start**

---

## ¿Necesitas ayuda?

Abre una nueva PowerShell y ejecuta esto para obtener más detalles:

```powershell
# Ver si el servicio PostgreSQL está corriendo
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# Conectar a PostgreSQL
$env:PGPASSWORD = "password"
psql -U postgres -h localhost -c "SELECT 1;"
```

Si sale "1" → Está funcionando correctamente.
