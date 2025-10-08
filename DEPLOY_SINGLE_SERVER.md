# 🚀 Deploy en Servidor Único (TODO EN UNO)

Esta guía te muestra cómo deployar frontend + backend en un solo servidor.

---

## 🎯 OPCIÓN 1: Render (Recomendada - 100% Gratis)

### Paso 1: Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU-USUARIO/spotify-ai-playlist.git
git push -u origin main
```

### Paso 2: Deploy en Render

1. Ve a https://render.com
2. Sign up con GitHub
3. Click "New +" → "Web Service"
4. Conecta tu repo `spotify-ai-playlist`

**Configuración:**
- **Name**: `spotify-ai-playlist`
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free

### Paso 3: Variables de Entorno

En "Environment Variables", agrega:

```
CLIENT_ID=6344da91f68d4e14b00d1ce552bad673
CLIENT_SECRET=4268354b54fd4f39a9afb029b8aa7641
NODE_ENV=production
PORT=10000
```

**IMPORTANTE**: Deja `REDIRECT_URI` en blanco por ahora.

### Paso 4: Deploy

1. Click "Create Web Service"
2. Espera 5-7 minutos (construye frontend + backend)
3. Copia la URL que te da (ej: `https://spotify-ai-playlist.onrender.com`)

### Paso 5: Actualizar Spotify Dashboard

1. Ve a https://developer.spotify.com/dashboard
2. En Redirect URIs, agrega:
   ```
   https://TU-APP.onrender.com/callback
   ```

### Paso 6: Agregar REDIRECT_URI en Render

1. Vuelve a Render → Environment
2. Agrega:
   ```
   REDIRECT_URI=https://TU-APP.onrender.com/callback
   FRONTEND_URL=https://TU-APP.onrender.com
   ```
3. Guarda (se re-deployará automáticamente)

### ✅ ¡Listo!

Ve a `https://TU-APP.onrender.com` y prueba tu app 🎉

**Ventajas:**
- ✅ TODO en un solo servidor
- ✅ 100% gratis
- ✅ Una sola URL
- ✅ Deploy automático en cada push

**Desventajas:**
- ⚠️ Se duerme después de 15 min sin uso
- ⚠️ Primera request tarda ~30 seg

---

## 🎯 OPCIÓN 2: Railway (Alternativa - Gratis con límites)

### Paso 1: Subir a GitHub (igual que arriba)

### Paso 2: Deploy en Railway

1. Ve a https://railway.app
2. Sign up con GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Selecciona tu repo

**Configuración:**
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Variables de entorno:** (mismas que Render)

**Ventajas:**
- ✅ No se duerme
- ✅ Más rápido que Render
- ✅ $5 gratis/mes

**Desventajas:**
- ⚠️ Límite de $5/mes gratis
- ⚠️ Después de eso hay que pagar

---

## 🎯 OPCIÓN 3: DigitalOcean App Platform ($5/mes)

Similar a Render pero:
- ✅ No se duerme nunca
- ✅ Muy rápido
- ❌ Cuesta $5/mes

---

## 🎯 OPCIÓN 4: VPS Propio (Más control)

Para usar un VPS (DigitalOcean, Linode, AWS EC2):

### Setup inicial en el servidor:

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 (para mantener la app corriendo)
sudo npm install -g pm2

# Clonar el repo
git clone https://github.com/TU-USUARIO/spotify-ai-playlist.git
cd spotify-ai-playlist

# Instalar dependencias
cd backend && npm install
cd ../frontend && npm install && npm run build
cd ..

# Crear .env
cd backend
nano .env
# (pega tus variables de entorno)

# Iniciar con PM2
pm2 start backend/server.js --name spotify-playlist
pm2 save
pm2 startup
```

### Configurar Nginx (opcional pero recomendado):

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Ventajas VPS:**
- ✅ Control total
- ✅ No se duerme
- ✅ Puedes hostear múltiples apps

**Desventajas:**
- ❌ Más complejo
- ❌ Cuesta ~$5/mes
- ❌ Tienes que mantener el servidor

---

## 📊 Comparación Rápida

| Servicio | Costo | Se duerme | Complejidad | Recomendado para |
|----------|-------|-----------|-------------|------------------|
| **Render** | Gratis | Sí (15 min) | Fácil | Proyectos personales |
| **Railway** | $5/mes límite | No | Fácil | Demos/MVPs |
| **DigitalOcean App** | $5/mes | No | Fácil | Apps serias |
| **VPS** | $5/mes | No | Medio | Full control |

---

## 🎖️ Mi Recomendación

### Para empezar:
**Render** - Es gratis y super fácil. Sí, se duerme, pero para un proyecto personal está perfecto.

### Si lo usas mucho:
**Railway** o **DigitalOcean App Platform** - $5/mes, no se duerme, deploy automático.

### Si quieres aprender más:
**VPS con DigitalOcean** - Aprendes sobre servidores, Nginx, PM2, etc.

---

## 🐛 Troubleshooting

### Build falla en Render
- Asegúrate de que `Root Directory` sea `backend`
- Verifica que el Build Command sea: `npm install && npm run build`

### App no carga después de deploy
- Espera 1-2 minutos después del primer deploy
- Revisa los logs en Render
- Verifica que NODE_ENV=production esté en las variables

### Error CORS
- Verifica que FRONTEND_URL apunte a la misma URL de tu app
- No uses URLs diferentes para frontend/backend

---

¡Ahora todo está en un solo servidor! 🎉
