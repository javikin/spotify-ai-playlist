#!/bin/bash

echo "🎵 Instalando Spotify AI Playlist Generator..."
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Instalar dependencias del backend
echo -e "${BLUE}📦 Instalando dependencias del backend...${NC}"
cd backend
npm install
cd ..

echo ""

# Instalar dependencias del frontend
echo -e "${BLUE}📦 Instalando dependencias del frontend...${NC}"
cd frontend
npm install
cd ..

echo ""
echo -e "${GREEN}✅ ¡Instalación completada!${NC}"
echo ""
echo "🚀 Para ejecutar la aplicación:"
echo ""
echo "   Terminal 1 - Backend:"
echo "   cd backend && npm start"
echo ""
echo "   Terminal 2 - Frontend:"
echo "   cd frontend && npm start"
echo ""
echo "📖 Lee el README.md para más información"
