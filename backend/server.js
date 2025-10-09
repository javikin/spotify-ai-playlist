const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:8888', 'http://127.0.0.1:8888', 'http://localhost:3000', 'http://127.0.0.1:3000'],
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
    'playlist-modify-private',
    'user-top-read',
    'user-read-recently-played'
  ];

  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.json({ url: authorizeURL });
});

// Ruta de callback para manejar el código de autorización
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:8888';

  console.log('🔄 Callback recibido - Code:', code ? '✓' : '✗');
  console.log('🔄 Frontend URL:', frontendUrl);

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    console.log('✅ Token obtenido exitosamente');
    const redirectUrl = `${frontendUrl}?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`;
    console.log('🔄 Redirigiendo a:', redirectUrl);

    // Redirigir al frontend con el token
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Error al obtener el token:', error);
    res.redirect(`${frontendUrl}?error=auth_failed`);
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
      image: track.album.images[0]?.url,
      preview_url: track.preview_url
    }));
    
    res.json({ tracks });
  } catch (error) {
    console.error('Error al buscar canciones:', error);
    res.status(500).json({ error: 'Failed to search songs' });
  }
});

// Ruta para obtener géneros disponibles
app.get('/api/available-genres', async (req, res) => {
  const { access_token } = req.query;

  try {
    spotifyApi.setAccessToken(access_token);
    const data = await spotifyApi.getAvailableGenreSeeds();

    console.log('✅ Géneros disponibles:', data.body.genres);
    res.json({ genres: data.body.genres });
  } catch (error) {
    console.error('❌ Error al obtener géneros:', error);
    res.status(500).json({ error: 'Failed to get genres' });
  }
});

// Ruta para obtener top tracks del usuario
app.get('/api/my-top-tracks', async (req, res) => {
  const { access_token, limit, time_range } = req.query;

  try {
    spotifyApi.setAccessToken(access_token);

    const data = await spotifyApi.getMyTopTracks({
      limit: limit || 20,
      time_range: time_range || 'short_term' // short_term, medium_term, long_term
    });

    const tracks = data.body.items.map(track => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      image: track.album.images[0]?.url,
      preview_url: track.preview_url
    }));

    res.json({ tracks });
  } catch (error) {
    console.error('❌ Error al obtener top tracks:', error);
    res.status(500).json({ error: 'Failed to get top tracks' });
  }
});

// Ruta para obtener top artists del usuario
app.get('/api/my-top-artists', async (req, res) => {
  const { access_token, limit, time_range } = req.query;

  try {
    spotifyApi.setAccessToken(access_token);

    const data = await spotifyApi.getMyTopArtists({
      limit: limit || 20,
      time_range: time_range || 'short_term'
    });

    const artists = data.body.items.map(artist => ({
      id: artist.id,
      name: artist.name,
      image: artist.images[0]?.url,
      genres: artist.genres
    }));

    res.json({ artists });
  } catch (error) {
    console.error('❌ Error al obtener top artists:', error);
    res.status(500).json({ error: 'Failed to get top artists' });
  }
});

// Ruta para buscar artistas
app.post('/api/search-artists', async (req, res) => {
  const { query, access_token } = req.body;

  try {
    spotifyApi.setAccessToken(access_token);

    const searchResults = await spotifyApi.searchArtists(query, { limit: 10 });

    const artists = searchResults.body.artists.items.map(artist => ({
      id: artist.id,
      name: artist.name,
      image: artist.images[0]?.url,
      genres: artist.genres,
      popularity: artist.popularity
    }));

    res.json({ artists });
  } catch (error) {
    console.error('Error al buscar artistas:', error);
    res.status(500).json({ error: 'Failed to search artists' });
  }
});

// Ruta para obtener canciones similares basadas en artistas (excluyendo a los artistas originales)
app.post('/api/similar-to-artists', async (req, res) => {
  const { access_token, artistIds, config } = req.body;

  try {
    spotifyApi.setAccessToken(access_token);

    console.log('🎵 Buscando similares a artistas:', artistIds);

    // NUEVO ENFOQUE: Obtener géneros de los artistas y buscar por género
    // Primero obtener info de los artistas para conocer sus géneros
    const artistsData = await Promise.all(
      artistIds.slice(0, 5).map(id => spotifyApi.getArtist(id))
    );

    // Extraer géneros únicos de todos los artistas
    const allGenres = artistsData.flatMap(artist => artist.body.genres);
    const uniqueGenres = [...new Set(allGenres)].slice(0, 3); // Máximo 3 géneros

    console.log('🎭 Géneros encontrados:', uniqueGenres);

    // Construir query de búsqueda basado en los géneros
    let searchQuery = '';

    if (uniqueGenres.length > 0) {
      // Usar géneros para buscar
      searchQuery = `genre:${uniqueGenres.join(' OR genre:')}`;
    } else {
      // Fallback: buscar por nombre de los artistas (música similar)
      const artistNames = artistsData.map(a => a.body.name);
      searchQuery = artistNames.join(' OR ');
    }

    console.log('🔎 Query de búsqueda:', searchQuery);

    // Usar búsqueda en lugar de recommendations
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=50`;

    const response = await axios.get(searchUrl, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('✅ Canciones encontradas:', response.data.tracks.items.length);

    // Filtrar canciones de los artistas originales
    const tracks = response.data.tracks.items
      .filter(track => {
        if (!track.artists || track.artists.length === 0) return false;
        const trackArtistId = track.artists[0].id;
        const isOriginalArtist = artistIds.includes(trackArtistId);
        return !isOriginalArtist;
      })
      .slice(0, config?.limit || 20)
      .map(track => ({
        id: track.id,
        uri: track.uri,
        name: track.name,
        artist: track.artists[0].name,
        artistId: track.artists[0].id,
        album: track.album.name,
        image: track.album.images[0]?.url,
        preview_url: track.preview_url
      }));

    console.log('✅ Tracks filtrados:', tracks.length);
    res.json({ tracks });
  } catch (error) {
    console.error('❌ Error al obtener canciones similares:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to get similar tracks', details: error.message });
  }
});

// Ruta para obtener UNA sola recomendación excluyendo tracks específicos
app.post('/api/get-replacement-track', async (req, res) => {
  const { access_token, config, genres, artistIds, excludeTrackIds } = req.body;

  try {
    spotifyApi.setAccessToken(access_token);

    console.log('🔄 Obteniendo canción de reemplazo');
    console.log('📝 Exclude tracks:', excludeTrackIds);

    // Pedir más canciones para poder filtrar las excluidas
    const requestLimit = 50;

    let tracks = [];

    if (artistIds && artistIds.length > 0) {
      // Modo artistas similares - usar búsqueda por géneros
      console.log('🎤 Usando artistas:', artistIds);

      // Obtener géneros de los artistas
      const artistsData = await Promise.all(
        artistIds.slice(0, 5).map(id => spotifyApi.getArtist(id))
      );

      const allGenres = artistsData.flatMap(artist => artist.body.genres);
      const uniqueGenres = [...new Set(allGenres)].slice(0, 3);

      console.log('🎭 Géneros:', uniqueGenres);

      let searchQuery = '';
      if (uniqueGenres.length > 0) {
        searchQuery = `genre:${uniqueGenres.join(' OR genre:')}`;
      } else {
        const artistNames = artistsData.map(a => a.body.name);
        searchQuery = artistNames.join(' OR ');
      }

      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=${requestLimit}`;

      const response = await axios.get(searchUrl, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      tracks = response.data.tracks.items
        .filter(track => {
          if (!track.artists || track.artists.length === 0) return false;
          const trackArtistId = track.artists[0].id;
          const isOriginalArtist = artistIds.includes(trackArtistId);
          return !isOriginalArtist;
        })
        .map(track => ({
          id: track.id,
          uri: track.uri,
          name: track.name,
          artist: track.artists[0].name,
          artistId: track.artists[0].id,
          album: track.album.name,
          image: track.album.images[0]?.url,
          preview_url: track.preview_url
        }));
    } else if (genres && genres.length > 0) {
      // Modo géneros/mood
      console.log('🎭 Usando géneros:', genres);

      const searchTermsByGenre = {
        'hip-hop': 'hip hop rap beats',
        'edm': 'electronic dance music EDM',
        'metal': 'metal rock heavy',
        'indie': 'indie alternative',
        'ambient': 'ambient chill instrumental',
        'acoustic': 'acoustic singer songwriter',
        'latin': 'latin music latino',
        'dance': 'dance party pop',
        'reggaeton': 'reggaeton latin urban',
        'sad': 'sad emotional ballad',
        'emo': 'emo alternative rock',
        'classical': 'classical music orchestra',
        'study': 'study focus instrumental',
        'r-n-b': 'r&b soul rnb',
        'soul': 'soul r&b',
        'jazz': 'jazz'
      };

      const searchQuery = genres.map(g => searchTermsByGenre[g] || g).join(' OR ');
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=${requestLimit}`;

      const response = await axios.get(searchUrl, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      tracks = response.data.tracks.items.map(track => ({
        id: track.id,
        uri: track.uri,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        image: track.album.images[0]?.url,
        preview_url: track.preview_url
      }));
    }

    // Filtrar tracks excluidos
    const filteredTracks = tracks.filter(track => !excludeTrackIds.includes(track.id));

    console.log(`✅ ${filteredTracks.length} tracks disponibles después de filtrar`);

    if (filteredTracks.length === 0) {
      return res.status(404).json({ error: 'No se encontraron más canciones disponibles' });
    }

    // Priorizar canciones con preview
    const sortedTracks = filteredTracks.sort((a, b) => {
      if (a.preview_url && !b.preview_url) return -1;
      if (!a.preview_url && b.preview_url) return 1;
      return 0;
    });

    // Devolver solo la primera
    res.json({ track: sortedTracks[0] });
  } catch (error) {
    console.error('❌ Error al obtener reemplazo:', error.message);
    res.status(500).json({ error: 'Failed to get replacement track', details: error.message });
  }
});

// Ruta para obtener recomendaciones personalizadas basadas en historial + mood
app.post('/api/personalized-recommendations', async (req, res) => {
  const { access_token, config, genres } = req.body;

  try {
    spotifyApi.setAccessToken(access_token);

    console.log('🎵 Generando recomendaciones personalizadas');
    console.log('🔧 Config:', config);

    // NUEVO ENFOQUE: Usar búsqueda de Spotify que SÍ funciona
    console.log('🔍 Usando búsqueda de Spotify basada en mood');

    // Mapear mood a términos de búsqueda
    const searchTermsByGenre = {
      'hip-hop': 'hip hop rap beats',
      'edm': 'electronic dance music EDM',
      'metal': 'metal rock heavy',
      'indie': 'indie alternative',
      'ambient': 'ambient chill instrumental',
      'acoustic': 'acoustic singer songwriter',
      'latin': 'latin music latino',
      'dance': 'dance party pop',
      'reggaeton': 'reggaeton latin urban',
      'sad': 'sad emotional ballad',
      'emo': 'emo alternative rock',
      'classical': 'classical music orchestra',
      'study': 'study focus instrumental',
      'r-n-b': 'r&b soul rnb',
      'soul': 'soul r&b',
      'jazz': 'jazz'
    };

    // Construir query de búsqueda basado en los géneros
    const searchQuery = genres.map(g => searchTermsByGenre[g] || g).join(' OR ');
    console.log('🔎 Query de búsqueda:', searchQuery);

    // Usar el endpoint de búsqueda que SÍ funciona
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=${config?.limit || 20}`;
    console.log('🔗 URL:', searchUrl);

    const response = await axios.get(searchUrl, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    console.log('✅ Canciones encontradas:', response.data.tracks.items.length);

    const tracks = response.data.tracks.items.map(track => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      image: track.album.images[0]?.url,
      preview_url: track.preview_url
    }));

    res.json({
      tracks,
      personalized: false // Por ahora no personalizado
    });
  } catch (error) {
    console.error('❌ Error al obtener recomendaciones:', error.message);
    if (error.response) {
      console.error('❌ StatusCode:', error.response.status);
      console.error('❌ Data:', error.response.data);
    }

    // Si falla, intentar con géneros como último recurso
    const statusCode = error.response?.status || error.statusCode;
    if (statusCode === 404 || statusCode === 400) {
      console.log('⚠️ Error con seeds personalizados, usando géneros como fallback');

      try {
        // Usar géneros válidos de Spotify con axios
        const validGenres = genres && genres.length > 0 ? genres.slice(0, 3) : ['pop', 'indie', 'dance'];

        console.log('📝 Fallback con géneros:', validGenres);

        const fallbackParams = new URLSearchParams();
        fallbackParams.append('limit', (config?.limit || 20).toString());
        // seed_genres también debe ser string separado por comas
        fallbackParams.append('seed_genres', validGenres.join(','));

        const fallbackUrl = `https://api.spotify.com/v1/recommendations?${fallbackParams.toString()}`;
        console.log('🔗 Fallback URL:', fallbackUrl);

        const fallbackResponse = await axios.get(fallbackUrl, {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        });

        const tracks = fallbackResponse.data.tracks.map(track => ({
          id: track.id,
          uri: track.uri,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          image: track.album.images[0]?.url,
          preview_url: track.preview_url
        }));

        console.log('✅ Recomendaciones de fallback obtenidas:', tracks.length);

        return res.json({
          tracks,
          personalized: false
        });
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError.message);
        if (fallbackError.response) {
          console.error('❌ StatusCode fallback:', fallbackError.response.status);
          console.error('❌ Data fallback:', fallbackError.response.data);
        }
        return res.status(500).json({
          error: 'Failed to get recommendations',
          details: fallbackError.message,
          statusCode: fallbackError.response?.status
        });
      }
    }

    res.status(500).json({
      error: 'Failed to get personalized recommendations',
      details: error.message
    });
  }
});

// Ruta para obtener recomendaciones basadas en géneros (fallback)
app.post('/api/recommendations', async (req, res) => {
  const { access_token, config, genres } = req.body;

  try {
    spotifyApi.setAccessToken(access_token);

    console.log('🎵 Generando recomendaciones con géneros:', genres);
    console.log('🔧 Config:', config);

    const options = {
      limit: config?.limit || 20,
      seed_genres: genres || ['pop', 'rock', 'indie']
    };

    // Agregar parámetros de audio si están configurados
    if (config?.energy !== undefined) options.target_energy = config.energy;
    if (config?.valence !== undefined) options.target_valence = config.valence;
    if (config?.tempo !== undefined) options.target_tempo = config.tempo;

    console.log('📝 Opciones finales:', JSON.stringify(options, null, 2));

    const recommendations = await spotifyApi.getRecommendations(options);

    console.log('✅ Recomendaciones obtenidas:', recommendations.body.tracks.length);

    const tracks = recommendations.body.tracks.map(track => ({
      id: track.id,
      uri: track.uri,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      image: track.album.images[0]?.url,
      preview_url: track.preview_url
    }));

    res.json({ tracks });
  } catch (error) {
    console.error('❌ Error completo:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error statusCode:', error.statusCode);

    if (error.body) {
      console.error('❌ Error body:', JSON.stringify(error.body, null, 2));
    }

    // Intentar obtener más detalles
    const errorDetails = {
      message: error.message,
      statusCode: error.statusCode,
      body: error.body,
      errorType: error.constructor.name
    };

    console.error('❌ Error serializado:', JSON.stringify(errorDetails, null, 2));

    res.status(500).json({
      error: 'Failed to get recommendations',
      details: errorDetails
    });
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
