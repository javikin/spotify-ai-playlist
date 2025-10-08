#!/bin/bash

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎵  SPOTIFY AI PLAYLIST - DEPLOY AUTOMÁTICO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Paso 1: GitHub
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 PASO 1: Subir a GitHub${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Ve a: https://github.com/new"
echo "2. Nombre del repo: spotify-ai-playlist"
echo "3. Déjalo como PÚBLICO"
echo "4. NO inicialices con README"
echo "5. Click en 'Create repository'"
echo ""
read -p "Presiona ENTER cuando hayas creado el repo en GitHub..."

echo ""
read -p "Ingresa tu usuario de GitHub: " GITHUB_USER

echo ""
echo -e "${GREEN}Subiendo código a GitHub...${NC}"

git remote add origin https://github.com/$GITHUB_USER/spotify-ai-playlist.git
git push -u origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Código subido exitosamente!${NC}"
else
    echo -e "${RED}❌ Error al subir. Intenta manualmente:${NC}"
    echo "git remote add origin https://github.com/$GITHUB_USER/spotify-ai-playlist.git"
    echo "git push -u origin main"
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ PASO 1 COMPLETADO - Código en GitHub${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Paso 2: Render
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 PASO 2: Deploy en Render${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Ve a: https://render.com"
echo "2. Sign up con GitHub (si no tienes cuenta)"
echo "3. Click en 'New +' → 'Web Service'"
echo "4. Conecta tu repo: spotify-ai-playlist"
echo ""
echo "CONFIGURACIÓN:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Name: spotify-ai-playlist"
echo "Region: Oregon (US West)"
echo "Branch: main"
echo "Root Directory: backend"
echo "Runtime: Node"
echo "Build Command: npm install && npm run build"
echo "Start Command: npm start"
echo "Plan: FREE"
echo ""
echo "VARIABLES DE ENTORNO (Environment):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CLIENT_ID=6344da91f68d4e14b00d1ce552bad673"
echo "CLIENT_SECRET=4268354b54fd4f39a9afb029b8aa7641"
echo "NODE_ENV=production"
echo "PORT=10000"
echo ""
read -p "Presiona ENTER cuando hayas dado click en 'Create Web Service'..."

echo ""
echo "⏳ Esperando que termine el deploy (esto toma 5-7 minutos)..."
echo "   Puedes ver los logs en Render mientras esperas."
echo ""
read -p "Presiona ENTER cuando el deploy esté COMPLETO (status: Live)..."

echo ""
read -p "Ingresa la URL de tu app en Render (ej: https://spotify-ai-playlist.onrender.com): " RENDER_URL

# Limpiar la URL (quitar trailing slash)
RENDER_URL=${RENDER_URL%/}

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ PASO 2 COMPLETADO - App deployada en Render${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Paso 3: Spotify Dashboard
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎵 PASO 3: Actualizar Spotify Dashboard${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Ve a: https://developer.spotify.com/dashboard"
echo "2. Selecciona tu app: Sync Claude"
echo "3. Click en 'Settings'"
echo "4. En 'Redirect URIs' AGREGA (no borres localhost):"
echo ""
echo -e "${GREEN}   $RENDER_URL/callback${NC}"
echo ""
echo "5. Click en 'Save'"
echo ""
read -p "Presiona ENTER cuando hayas guardado el Redirect URI..."

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ PASO 3 COMPLETADO - Spotify actualizado${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Paso 4: Actualizar variables en Render
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}⚙️  PASO 4: Actualizar variables en Render${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Vuelve a Render → Tu servicio"
echo "2. Ve a 'Environment'"
echo "3. Agrega estas DOS variables:"
echo ""
echo -e "${GREEN}   REDIRECT_URI=$RENDER_URL/callback${NC}"
echo -e "${GREEN}   FRONTEND_URL=$RENDER_URL${NC}"
echo ""
echo "4. Click en 'Save Changes'"
echo "5. Espera 1-2 minutos a que se re-deploye automáticamente"
echo ""
read -p "Presiona ENTER cuando las variables estén guardadas..."

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ PASO 4 COMPLETADO - Variables actualizadas${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 ¡DEPLOY COMPLETADO EXITOSAMENTE!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "Tu app está lista en: ${GREEN}$RENDER_URL${NC}"
echo ""
echo "🎵 Abre el navegador y prueba tu app:"
echo -e "   ${BLUE}$RENDER_URL${NC}"
echo ""
echo "⚠️  NOTA: El primer acceso puede tardar ~30 segundos"
echo "   (el servidor gratuito se duerme después de 15 min sin uso)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
