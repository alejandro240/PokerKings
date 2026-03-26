# Cómo Iniciar el Proyecto

## Modo único: Dockerizado

## 1. Desplegar aplicación y base de datos
```bash
cd /home/Proyecto/PokerKings
bash deploy.sh
```

## 2. Alternativa manual sin script
```bash
cd /home/Proyecto/PokerKings
docker compose up -d --build
```

## URLs
- **Aplicación**: https://pokerkings.duckdns.org
- **API local en el servidor**: http://127.0.0.1:3000

## Notas
- El backend y PostgreSQL ya no se ejecutan fuera de Docker.
- La base de datos no se publica hacia fuera del servidor.
- La aplicación se conecta a PostgreSQL usando `DB_HOST=postgres` dentro de la red interna de Docker.

# Cómo Iniciar el Proyecto

## 1. Iniciar PostgreSQL (Docker)
```bash
cd backend
docker-compose up -d postgres
```

## 2. Iniciar Backend
```bash
cd backend
npm run dev
```

## 3. Iniciar Frontend
```bash
cd fronted
npm run dev
```

## URLs
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **PostgreSQL**: localhost:5432
