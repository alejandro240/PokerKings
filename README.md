# Poker Kings 🎰

Plataforma web multijugador de Texas Hold'em con sistema social, misiones y monetización simulada.

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd fronted
npm install
```

### 2. Iniciar base de datos (PostgreSQL)

```bash
cd backend
docker-compose up -d postgres
```

Esto levanta PostgreSQL en el puerto **5432**.

### 3. Iniciar Backend

Abre una terminal en la carpeta `backend`:

```bash
npm run dev
```

Backend corriendo en: **http://localhost:3000**

### 4. Iniciar Frontend

Abre otra terminal en la carpeta `fronted`:

```bash
npm run dev
```

Frontend corriendo en: **http://localhost:5173**

---

## 🛠️ Comandos Útiles

### Ver contenedores Docker activos
```bash
docker ps
```

### Detener base de datos
```bash
cd backend
docker-compose down
```

### Limpiar base de datos
```bash
cd backend
docker-compose down -v
docker-compose up -d postgres
```

---

## 📦 Estructura del Proyecto

```
PokerKings/
├── backend/           # Servidor Node.js + Express + Socket.IO
│   ├── src/
│   └── docker-compose.yml
├── fronted/           # React + Vite + Bootstrap
│   ├── src/
│   └── public/
└── README.md
```

---

## ⚡ Solución de Problemas

### Error: Puerto 3000 ocupado
El backend ya está corriendo o Docker tiene el contenedor levantado.
```bash
# Detener Docker
cd backend
docker-compose down
```

### Error: Cannot connect to database
Verifica que PostgreSQL esté corriendo:
```bash
docker ps
```
Si no aparece `pokerkings-postgres`, ejecuta:
```bash
cd backend
docker-compose up -d postgres
```

### Error: Module not found
```bash
# Reinstalar dependencias
npm install
```

---

## 🎮 URLs de Desarrollo

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Base de datos:** localhost:5432

---

## 🎨 Stack Tecnológico

**Frontend:**
- React 18
- Vite
- Bootstrap 5
- Socket.IO Client

**Backend:**
- Node.js
- Express
- Socket.IO
- PostgreSQL
- Sequelize ORM

**DevOps:**
- Docker
- Docker Compose
