# 🚀 Guía de Deploy - Spotify AI Playlist

Esta guía te llevará paso a paso para deployar tu aplicación online de forma gratuita.

## 📋 Prerequisitos

1. Cuenta de GitHub (gratis): https://github.com
2. Cuenta de Render (gratis): https://render.com
3. Cuenta de Vercel (gratis): https://vercel.com

---

## 🎯 PASO 1: Subir el código a GitHub

### 1.1 Inicializar Git (si no lo has hecho)

Desde la carpeta raíz del proyecto:

```bash
git init
git add .
git commit -m "Initial commit - Spotify AI Playlist"
```

### 1.2 Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repo: `spotify-ai-playlist`
3. Déjalo como **Público** o **Privado** (ambos funcionan)
4. **NO** inicialices con README (ya lo tenemos)
5. Click en "Create repository"

### 1.3 Conectar y subir

GitHub te dará comandos, usa estos:

```bash
git remote add origin https://github.com/TU-USUARIO/spotify-ai-playlist.git
git branch -M main
git push -u origin main
```

✅ **Checkpoint**: Tu código ya está en GitHub

---

## 🎯 PASO 2: Deploy del Backend en Render

### 2.1 Crear cuenta en Render

1. Ve a https://render.com
2. Sign up con GitHub (es más fácil)
3. Autoriza a Render

### 2.2 Crear nuevo Web Service

1. Click en "New +" → "Web Service"
2. Conecta tu repositorio `spotify-ai-playlist`
3. Render detectará que es un monorepo, configura así:

**Configuración:**
- **Name**: `spotify-ai-playlist-api` (o el que quieras)
- **Region**: Oregon (US West) - el más cercano gratis
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free

### 2.3 Configurar Variables de Entorno

En la sección "Environment Variables", agrega:

```
CLIENT_ID=6344da91f68d4e14b00d1ce552bad673
CLIENT_SECRET=4268354b54fd4f39a9afb029b8aa7641
PORT=5000
```

**IMPORTANTE**: Deja `REDIRECT_URI` y `FRONTEND_URL` en blanco por ahora, las agregaremos después.

### 2.4 Deploy

1. Click en "Create Web Service"
2. Espera 3-5 minutos mientras hace el deploy
3. Una vez que termine, copia la URL que te da (algo como `https://spotify-ai-playlist-api.onrender.com`)

✅ **Checkpoint**: Guarda esta URL del backend, la necesitarás

---

## 🎯 PASO 3: Deploy del Frontend en Vercel

### 3.1 Crear cuenta en Vercel

1. Ve a https://vercel.com
2. Sign up con GitHub
3. Autoriza a Vercel

### 3.2 Importar proyecto

1. Click en "Add New..." → "Project"
2. Selecciona tu repo `spotify-ai-playlist`
3. Vercel detectará que es un monorepo

**Configuración:**
- **Project Name**: `spotify-ai-playlist` (o el que quieras)
- **Framework Preset**: Create React App
- **Root Directory**: `frontend` ← **MUY IMPORTANTE**
- **Build Command**: `npm run build`
- **Output Directory**: `build`

### 3.3 Configurar Variable de Entorno

En "Environment Variables", agrega:

```
REACT_APP_API_URL=https://TU-BACKEND-URL.onrender.com
```

Reemplaza `TU-BACKEND-URL` con la URL de Render del Paso 2.4

### 3.4 Deploy

1. Click en "Deploy"
2. Espera 2-3 minutos
3. Una vez que termine, Vercel te dará una URL (algo como `https://spotify-ai-playlist.vercel.app`)

✅ **Checkpoint**: Guarda esta URL del frontend

---

## 🎯 PASO 4: Actualizar Spotify Dashboard

Ahora que tienes las URLs reales, actualiza Spotify:

1. Ve a https://developer.spotify.com/dashboard
2. Selecciona tu app
3. Click en "Settings"
4. En **Redirect URIs**, AGREGA (no borres el localhost):
   ```
   https://TU-APP.vercel.app/callback
   ```
5. Guarda los cambios

---

## 🎯 PASO 5: Actualizar Variables de Entorno en Render

Vuelve a Render y agrega las variables que faltaban:

1. Ve a tu servicio en Render
2. Environment → Add Environment Variable
3. Agrega:
   ```
   REDIRECT_URI=https://TU-APP.vercel.app/callback
   FRONTEND_URL=https://TU-APP.vercel.app
   ```
4. Guarda y espera a que se redeploy automáticamente

---

## 🎉 PASO 6: ¡Prueba tu app!

1. Ve a `https://TU-APP.vercel.app`
2. Click en "Conectar con Spotify"
3. Autoriza la app
4. ¡Crea tu primera playlist!

---

## 🔧 Troubleshooting

### Error: "CORS policy"
- Verifica que `FRONTEND_URL` en Render tenga la URL correcta de Vercel
- Asegúrate de no tener un `/` al final de las URLs

### Error: "INVALID_CLIENT"
- Verifica que las credenciales en Render sean correctas
- Asegúrate de que el Redirect URI en Spotify Dashboard incluya la URL de Vercel

### Error: "Cannot connect to backend"
- Verifica que `REACT_APP_API_URL` en Vercel apunte a tu backend de Render
- Asegúrate de que el backend esté corriendo (puede tardar 1-2 min en despertar en el plan gratuito)

### El backend "se duerme"
- En el plan gratuito de Render, el backend se duerme después de 15 min de inactividad
- La primera request después de dormir tardará ~30 segundos
- Solución: Usa un servicio de "ping" como UptimeRobot (gratis) o upgrade a plan de pago ($7/mes)

---

## 📝 Notas Importantes

### Plan Gratuito de Render:
- ✅ 750 horas/mes gratis
- ✅ Suficiente para proyectos personales
- ⚠️ Se duerme después de 15 min sin uso
- ⚠️ Tarda ~30 seg en despertar

### Plan Gratuito de Vercel:
- ✅ 100 GB bandwidth/mes
- ✅ Deploy automático en cada push a GitHub
- ✅ SSL gratis
- ✅ Sin límite de visitas

---

## 🚀 Próximos pasos

### Para hacer el backend más rápido (opcional, $7/mes):
1. En Render, upgrade a "Starter" plan
2. Esto mantiene el backend siempre activo

### Para dominio personalizado (opcional):
1. Compra un dominio (ej: namecheap.com ~$10/año)
2. En Vercel: Settings → Domains → Add
3. Sigue las instrucciones para configurar DNS

### Para updates automáticos:
- Cada vez que hagas `git push`, Vercel y Render harán deploy automáticamente
- Vercel: instantáneo
- Render: 3-5 minutos

---

## 📧 ¿Necesitas ayuda?

Si algo no funciona, revisa:
1. Los logs en Render (Runtime Logs)
2. La consola del navegador (F12)
3. Las variables de entorno en ambos servicios

---

¡Listo! Ahora tienes tu app corriendo 24/7 online 🎉
