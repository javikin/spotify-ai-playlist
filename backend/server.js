const express = require('express');
const cors = require('cors');
const path = require('path');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Configurar Spotify API
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});

// Ruta para obtener la URL de autorización
app.get('/auth/login', (req, res) => {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-modify-public',
    'playlist-modify-private'
  ];
  
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.json({ url: authorizeURL });
});

// Ruta de callback para manejar el código de autorización
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;
    
    // Redirigir al frontend con el token
    res.redirect(`http://localhost:3000?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
  } catch (error) {
    console.error('Error al obtener el token:', error);
    res.redirect(`http://localhost:3000?error=auth_failed`);
  }
});

// Ruta para refrescar el token
app.post('/auth/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  
  try {
    spotifyApi.setRefreshToken(refresh_token);
    const data = await spotifyApi.refreshAccessToken();
    res.json({
      access_token: data.body.access_token,
      expires_in: data.body.expires_in
    });
  } catch (error) {
    console.error('Error al refrescar el token:', error);
    res.status(400).json({ error: 'Failed to refresh token' });
  }
});

// Ruta para buscar canciones basadas en un prompt
app.post('/api/search-songs', async (req, res) => {
  const { prompt, access_token, config } = req.body;
  
  try {
    spotifyApi.setAccessToken(access_token);
    
    // Aquí parsearías el prompt para extraer géneros, artistas, mood, etc.
    // Por ahora, haremos una búsqueda simple
    const searchResults = await spotifyApi.searchTracks(prompt, { 
      limit: config?.limit || 20 
    });
    
    const tracks = searchResults.body.tracks.items.map(track => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      image: track.album.images[0]?.url
    }));
    
    res.json({ tracks });
  } catch (error) {
    console.error('Error al buscar canciones:', error);
    res.status(500).json({ error: 'Failed to search songs' });
  }
});

// Ruta para obtener recomendaciones basadas en seeds
app.post('/api/recommendations', async (req, res) => {
  const { access_token, config } = req.body;
  
  try {
    spotifyApi.setAccessToken(access_token);
    
    const options = {
      limit: config?.limit || 20,
      seed_genres: config?.genres || ['pop', 'rock'],
      target_energy: config?.energy || 0.7,
      target_valence: config?.valence || 0.5,
      target_tempo: config?.tempo || 120
    };
    
    const recommendations = await spotifyApi.getRecommendations(options);
    
    const tracks = recommendations.body.tracks.map(track => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      image: track.album.images[0]?.url
    }));
    
    res.json({ tracks });
  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Ruta para crear una playlist
app.post('/api/create-playlist', async (req, res) => {
  const { access_token, name, description, tracks } = req.body;
  
  try {
    spotifyApi.setAccessToken(access_token);
    
    // Obtener el ID del usuario
    const me = await spotifyApi.getMe();
    const userId = me.body.id;
    
    // Crear la playlist
    const playlist = await spotifyApi.createPlaylist(userId, name, {
      description: description || 'Creada con Spotify AI Playlist',
      public: true
    });
    
    // Agregar las canciones
    if (tracks && tracks.length > 0) {
      await spotifyApi.addTracksToPlaylist(playlist.body.id, tracks);
    }
    
    res.json({
      id: playlist.body.id,
      url: playlist.body.external_urls.spotify,
      name: playlist.body.name
    });
  } catch (error) {
    console.error('Error al crear playlist:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Ruta para obtener información del usuario
app.get('/api/me', async (req, res) => {
  const { access_token } = req.query;
  
  try {
    spotifyApi.setAccessToken(access_token);
    const me = await spotifyApi.getMe();
    
    res.json({
      id: me.body.id,
      display_name: me.body.display_name,
      email: me.body.email,
      images: me.body.images
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Ruta catch-all para servir React app (DEBE IR AL FINAL)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
