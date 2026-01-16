# 🚀 GUÍA DE INSTALACIÓN - POKER KINGS

## Para el compañero de equipo que acaba de clonar el repo

### ✅ CHECKLIST ANTES DE EMPEZAR

- [ ] Node.js instalado (v18 o superior)
- [ ] Docker Desktop instalado
- [ ] Git configurado

---

## 📦 PASO 1: Instalar Dependencias

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd fronted
npm install
```

---

## 🐳 PASO 2: Iniciar PostgreSQL con Docker

### Opción A: Docker Desktop (Recomendado)

1. **Abre Docker Desktop** y asegúrate que esté corriendo
2. **Ve a la carpeta raíz del proyecto**
3. **Ejecuta**:
```bash
docker-compose up -d
```

Esto inicia PostgreSQL en segundo plano.

**Verificar que está corriendo:**
```bash
docker ps
```
Deberías ver un contenedor llamado `pokerkings-db` corriendo.

### Opción B: Si Docker no funciona

Si tienes problemas con Docker, puedes instalar PostgreSQL directamente:
- Descarga de: https://www.postgresql.org/download/windows/
- Usuario: `postgres`
- Contraseña: `password`
- Puerto: `5432`
- Crea la base de datos `pokerkings`:
```bash
psql -U postgres -c "CREATE DATABASE pokerkings;"
```

---

## ⚙️ PASO 3: Verificar Variables de Entorno

### Backend: `backend/.env`

Debe existir el archivo `.env` en la carpeta backend con:

```env
PORT=3000
NODE_ENV=development

# PostgreSQL (Docker)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pokerkings
DB_USER=postgres
DB_PASSWORD=password

# JWT Secret
JWT_SECRET=tu_clave_secreta_super_segura_12345
JWT_EXPIRES_IN=7d
```

### Frontend: `fronted/.env`

Debe existir el archivo `.env` en la carpeta fronted con:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

---

## 🚀 PASO 4: Ejecutar el Proyecto

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

**Deberías ver:**
```
🚀 Servidor corriendo en puerto 3000
📍 Entorno: development
📊 Base de datos: PostgreSQL
✅ PostgreSQL connected successfully
✅ Base de datos sincronizada
```

Si ves errores, revisa la sección de **Errores Comunes** abajo ⬇️

### Terminal 2: Frontend
```bash
cd fronted
npm run dev
```

**Deberías ver:**
```
VITE v5.4.21  ready in 379 ms
➜  Local:   http://localhost:5173/
```

---

## 🌐 PASO 5: Probar la Aplicación

1. **Abre el navegador**: http://localhost:5173
2. **Deberías ver la pantalla de Login**
3. **Prueba con un usuario de prueba**: Click en "Jugador 1"
4. **Deberías entrar y ver las mesas disponibles**

---

## 🐛 ERRORES COMUNES

### Error: "Cannot find module"
```bash
# Solución: Instalar dependencias
cd backend
npm install

cd ../fronted
npm install
```

### Error: "ECONNREFUSED localhost:5432"
```bash
# Solución: PostgreSQL no está corriendo

# Verificar Docker:
docker ps

# Si no hay contenedor, iniciar:
docker-compose up -d

# Verificar de nuevo:
docker ps
```

### Error: "Port 3000 already in use"
```bash
# Solución: Matar el proceso en ese puerto

# En PowerShell:
Get-Process node | Stop-Process -Force

# Reintentar:
npm run dev
```

### Error: "docker-compose: command not found"
```bash
# Solución: Instalar Docker Desktop
# Descargar de: https://www.docker.com/products/docker-desktop
```

### Error: "Connection timeout" en Socket.IO
```bash
# Solución: Verificar que el backend esté corriendo
# Terminal 1: npm run dev en backend
# Terminal 2: npm run dev en fronted
```

### Error: "Module not found: socket.io-client"
```bash
# Solución: Instalar dependencias faltantes
cd fronted
npm install socket.io-client axios
```

---

## 🧪 USUARIOS DE PRUEBA

Usa estos para probar la aplicación:

| Email | Contraseña | Chips | Nivel |
|-------|------------|-------|-------|
| jugador1@pokerkings.com | password123 | 5,000 | 5 |
| jugador2@pokerkings.com | password123 | 3,000 | 3 |
| jugador3@pokerkings.com | password123 | 10,000 | 10 |

---

## 📁 ESTRUCTURA DEL PROYECTO

```
PokerKings/
├── backend/                # Servidor Node.js + Express
│   ├── src/
│   │   ├── models/        # Modelos de BD (Sequelize)
│   │   ├── controllers/   # Lógica de negocio
│   │   ├── routes/        # Endpoints del API
│   │   ├── services/      # Servicios (lógica poker, bots)
│   │   ├── sockets/       # Socket.IO (tiempo real)
│   │   └── server.js      # Punto de entrada
│   ├── .env               # Variables de entorno
│   └── package.json
│
├── fronted/               # Cliente React + Vite
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── services/      # API y Socket.IO wrappers
│   │   └── App.jsx
│   ├── .env
│   └── package.json
│
└── docker-compose.yml     # PostgreSQL en Docker
```

---

## 🔍 VERIFICAR QUE TODO FUNCIONA

### 1. Backend corriendo
```bash
# En PowerShell:
curl http://localhost:3000/health

# Debería responder: {"status":"ok"}
```

### 2. PostgreSQL conectado
Revisa los logs del backend, deberías ver:
```
✅ PostgreSQL connected successfully
```

### 3. Frontend cargando
Abre http://localhost:5173 y deberías ver la pantalla de login.

### 4. API funcionando
En la consola del navegador (F12):
```javascript
// Prueba rápida
fetch('http://localhost:3000/api/tables', {
  headers: { 'Authorization': 'Bearer token' }
}).then(r => r.json()).then(console.log)
```

---

## 🆘 SI NADA FUNCIONA

1. **Reinicia Docker Desktop**
2. **Elimina node_modules y reinstala**:
```bash
# Backend
cd backend
rm -rf node_modules
npm install

# Frontend
cd fronted
rm -rf node_modules
npm install
```

3. **Reinicia contenedores Docker**:
```bash
docker-compose down
docker-compose up -d
```

4. **Verifica versiones**:
```bash
node --version    # Debe ser v18+
npm --version     # Debe ser v9+
docker --version  # Debe estar instalado
```

---

## 💬 CONTACTO

Si sigues teniendo problemas, contacta al compañero que configuró el proyecto inicialmente.

**¡Listo para jugar poker! 🎰**
