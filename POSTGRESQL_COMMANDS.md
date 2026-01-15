# Scripts de Utilidad para PostgreSQL

## En PowerShell (Windows)

### Ver la versión de PostgreSQL
```powershell
psql -U postgres -c "SELECT version();"
```

### Conectar a la base de datos
```powershell
psql -U postgres -d pokerkings
```

### Ver todas las bases de datos
```powershell
psql -U postgres -l
```

### Ver todas las tablas
```powershell
psql -U postgres -d pokerkings -c "\dt"
```

### Ver esquema de una tabla específica
```powershell
psql -U postgres -d pokerkings -c "\d users"
```

### Hacer backup de la BD
```powershell
pg_dump -U postgres pokerkings > backup.sql
```

### Restaurar de backup
```powershell
psql -U postgres pokerkings < backup.sql
```

### Eliminar la base de datos
```powershell
psql -U postgres -c "DROP DATABASE pokerkings;"
```

### Crear la base de datos de nuevo
```powershell
psql -U postgres -c "CREATE DATABASE pokerkings;"
```

---

## Variables de Entorno Necesarias

Asegúrate de que tu archivo `.env` tiene:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pokerkings
DB_USER=postgres
DB_PASSWORD=password
```

Si usas Docker, en lugar de `localhost` usa `postgres`.

---

## Comandos Node.js

### Instalar dependencias
```bash
npm install
```

### Iniciar en desarrollo (con hot reload)
```bash
npm run dev
```

### Iniciar en producción
```bash
npm start
```

### Ver los logs del servidor
```bash
npm run dev 2>&1 | Tee-Object -FilePath server.log
```

---

## Verificar Conexión a BD

Para verificar que todo funciona:

1. Abre PowerShell en la carpeta `backend`
2. Ejecuta `npm run dev`
3. Deberías ver:
   ```
   ✅ PostgreSQL connected successfully
   🎉 ¡Base de datos poblada exitosamente!
   🚀 Servidor corriendo en puerto 3000
   ```

Si algo falla, comprueba:
- ¿PostgreSQL está ejecutándose? (Services de Windows)
- ¿El puerto 5432 está libre?
- ¿Las credenciales en `.env` son correctas?
