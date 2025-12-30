# Guía de Despliegue: Render + Supabase

Has elegido la opción Pro: **Supabase** para los datos y **Render** para el servidor. Aquí tienes los pasos exactos para ponerlo en marcha.

## 1. Configurar Supabase (Base de Datos)

1.  Ve a [supabase.com](https://supabase.com) y crea una cuenta.
2.  Crea un **New Project**.
3.  Guarda la **Database Password** que definas (la necesitarás luego).
4.  Una vez creado, ve a **Project Settings** -> **Database**.
5.  En la sección "Connection parameters", anota estos datos:
    *   **Host**: `db.xxxx.supabase.co`
    *   **User**: `postgres`
    *   **Database Name**: `postgres` (usualmente)
    *   **Port**: `5432`

## 2. Preparar el repositorio

Asegúrate de subir tu código a GitHub.
*   Si este proyecto es un monorepo (tienes frontend y backend juntos), Render te preguntará el `Root Directory`.
*   Para el backend, el `Root Directory` será: `backend`.

## 3. Desplegar en Render

1.  Ve a [render.com](https://render.com) y crea un **Web Service**.
2.  Conecta tu repositorio de GitHub.
3.  Configuración básica:
    *   **Name**: `facturacion-backend`
    *   **Root Directory**: `backend` (¡Importante!)
    *   **Environment**: `Node`
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm start`
    *   **Plan**: Free

4.  **Variables de Entorno (Environment Variables)**
    Debes agregar las siguientes variables en la sección "Environment":

| Key | Value (Ejemplo/Instrucciones) |
| --- | --- |
| `DB_HOST` | Tu host de Supabase |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | La contraseña que creaste en el paso 1 |
| `DB_NAME` | `postgres` |
| `DB_PORT` | `5432` |
| `SUPABASE_URL` | Settings -> API -> URL |
| `SUPABASE_ANON_KEY` | Settings -> API -> anon public |
| `ADMIN_SECRET` | Crea una contraseña segura inventada por ti |

5.  Haz clic en **Create Web Service**.

## 4. Verificar

Render comenzará a compilar e instalar dependencias. Una vez termine, verás un check verde con la URL pública (ej: `https://facturacion-backend.onrender.com`).

¡Listo! Ya tienes tu backend público.
