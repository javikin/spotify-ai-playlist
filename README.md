# 🎵 Spotify AI Playlist Generator

Aplicación web que te permite crear playlists de Spotify usando IA y descripciones en lenguaje natural.

## 🚀 Características

- ✅ Login con Spotify OAuth
- ✅ Genera playlists basadas en prompts/descripciones
- ✅ Controles avanzados (energía, tempo, positividad)
- ✅ Búsqueda inteligente de canciones
- ✅ Recomendaciones de Spotify
- ✅ Creación automática de playlists en tu cuenta

## 📋 Requisitos previos

- Node.js (v14 o superior)
- npm o yarn
- Cuenta de Spotify
- Credenciales de Spotify Developer (Client ID y Secret)

## 🔧 Configuración

### 1. Actualizar Redirect URI en Spotify Dashboard

Ve a https://developer.spotify.com/dashboard y en tu app:

- **Redirect URIs**: Agrega `http://localhost:3000/callback`
- Guarda los cambios

### 2. Instalar dependencias

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Configurar variables de entorno

El archivo `backend/.env` ya está configurado con tus credenciales:
```
CLIENT_ID=6344da91f68d4e14b00d1ce552bad673
CLIENT_SECRET=4268354b54fd4f39a9afb029b8aa7641
REDIRECT_URI=http://localhost:3000/callback
PORT=5000
```

## 🚀 Ejecutar la aplicación

### Opción 1: Manualmente (en dos terminales separadas)

#### Terminal 1 - Backend:
```bash
cd backend
npm start
```

El servidor estará corriendo en http://localhost:5000

#### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

La aplicación se abrirá automáticamente en http://localhost:3000

### Opción 2: Con script automatizado

Desde la raíz del proyecto:
```bash
npm run dev
```

## 📖 Cómo usar

1. **Conectar con Spotify**: Click en "Conectar con Spotify" y autoriza la aplicación
2. **Describe tu playlist**: Escribe un prompt describiendo el tipo de música que quieres
   - Ejemplo: "Música energética para el gym con rock alternativo y hip hop underground"
3. **Ajusta la configuración**: 
   - Número de canciones
   - Energía (qué tan intensa es la música)
   - Positividad (qué tan alegre/triste)
   - Tempo (velocidad en BPM)
4. **Genera**: Click en "Generar Playlist" o "Obtener Recomendaciones"
5. **Crea en Spotify**: Dale un nombre y crea la playlist directamente en tu cuenta

## 🎯 Ejemplos de prompts

- "Música relajante para estudiar, principalmente lo-fi y jazz suave"
- "Playlist energética para correr, con electrónica y rock a 140+ BPM"
- "Corridos tumbados y regional mexicano underground para el gym"
- "Música épica de películas y videojuegos para entrenar"
- "Hip hop underground y trap latino, nada comercial"

## 🛠️ Tecnologías

- **Frontend**: React
- **Backend**: Node.js + Express
- **API**: Spotify Web API
- **Autenticación**: OAuth 2.0

## 📝 Notas

- Las búsquedas por prompt son básicas. Para mejores resultados, usa "Obtener Recomendaciones" con la configuración ajustada
- La energía alta (>0.7) da música más intensa
- El tempo alto (>140 BPM) da música más rápida
- La positividad alta (>0.7) da música más alegre

## 🔐 Seguridad

- Las credenciales están en archivos `.env` (no subir a Git en producción)
- El token de acceso se guarda en localStorage del navegador
- La sesión expira después de 1 hora (Spotify OAuth)

## 🐛 Troubleshooting

### Error: "INVALID_CLIENT"
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que el Redirect URI en Spotify Dashboard sea exactamente `http://localhost:3000/callback`

### Error: "Cannot connect to server"
- Asegúrate de que el backend esté corriendo en el puerto 5000
- Verifica que no haya otro proceso usando el puerto

### No encuentra canciones
- Intenta hacer el prompt más general
- Usa "Obtener Recomendaciones" en lugar de búsqueda por prompt
- Ajusta la configuración de energía/tempo/positividad

## 🌐 Deploy Online

¿Quieres tener tu app online 24/7?

**Opción 1 (Recomendada):** Todo en un servidor → Lee [DEPLOY_SINGLE_SERVER.md](DEPLOY_SINGLE_SERVER.md)

**Opción 2:** Frontend y Backend separados → Lee [DEPLOY.md](DEPLOY.md)

## 🎉 Próximas mejoras

- [ ] Integración con Claude/GPT para parsear mejor los prompts
- [ ] Análisis de audio más avanzado
- [ ] Guardar playlists generadas
- [ ] Compartir playlists con otros usuarios
- [ ] Modo oscuro
- [ ] Historial de playlists creadas

## 📄 Licencia

MIT

---

Hecho con ❤️ y Claude
