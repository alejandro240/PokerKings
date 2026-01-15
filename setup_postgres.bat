@echo off
REM Script de instalación automatizada de PostgreSQL 15 en Windows

echo.
echo ========================================
echo   Instalacion de PostgreSQL 15
echo ========================================
echo.

REM Verificar si postgresql ya está instalado
psql --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL ya está instalado
    psql --version
    goto check_database
)

echo [!] PostgreSQL no está instalado
echo.
echo Por favor, descarga PostgreSQL 15 desde:
echo https://www.postgresql.org/download/windows/
echo.
echo Instrucciones de instalación:
echo 1. Ejecuta el instalador
echo 2. Usuario: postgres
echo 3. Contraseña: password
echo 4. Puerto: 5432
echo 5. Locale: Spanish
echo 6. Instala todos los componentes
echo.
pause

:check_database
echo.
echo Verificando si la base de datos pokerkings existe...
echo.

REM Intentar conectar a PostgreSQL
psql -U postgres -h localhost -c "SELECT 1;" >nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] Conexion a PostgreSQL exitosa
    
    REM Verificar si la BD existe
    psql -U postgres -h localhost -c "\l" | find "pokerkings" >nul 2>&1
    
    if %errorlevel% equ 0 (
        echo [OK] Base de datos 'pokerkings' ya existe
    ) else (
        echo [!] Creando base de datos 'pokerkings'...
        psql -U postgres -h localhost -c "CREATE DATABASE pokerkings;"
        if %errorlevel% equ 0 (
            echo [OK] Base de datos creada exitosamente
        ) else (
            echo [ERROR] No se pudo crear la base de datos
            pause
            exit /b 1
        )
    )
) else (
    echo [ERROR] No se puede conectar a PostgreSQL
    echo.
    echo Verifica que:
    echo - PostgreSQL está instalado
    echo - El servicio postgres está en ejecución
    echo - Usuario: postgres, Contraseña: password
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Setup completado!
echo ========================================
echo.
echo Ahora ejecuta en la carpeta 'backend':
echo   npm install
echo   npm run dev
echo.
pause
