import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from './config';

// Presets de mood - usando SOLO géneros válidos de Spotify
const MOOD_PRESETS = [
  {
    id: 'workout',
    name: '🏋️ Workout',
    emoji: '🏋️',
    genres: ['hip-hop', 'edm', 'metal'],
    energy: 0.9,
    valence: 0.7,
    tempo: 140,
    description: 'Alta energía y ritmo rápido'
  },
  {
    id: 'chill',
    name: '😌 Chill',
    emoji: '😌',
    genres: ['indie', 'ambient', 'acoustic'],
    energy: 0.3,
    valence: 0.6,
    tempo: 90,
    description: 'Relax y vibes tranquilos'
  },
  {
    id: 'party',
    name: '🎉 Fiesta',
    emoji: '🎉',
    genres: ['latin', 'dance', 'reggaeton'],
    energy: 0.85,
    valence: 0.85,
    tempo: 120,
    description: 'Energía positiva para bailar'
  },
  {
    id: 'sad',
    name: '💔 Sad Hours',
    emoji: '💔',
    genres: ['indie', 'sad', 'emo'],
    energy: 0.3,
    valence: 0.2,
    tempo: 80,
    description: 'Mood melancólico y reflexivo'
  },
  {
    id: 'focus',
    name: '🎯 Focus',
    emoji: '🎯',
    genres: ['classical', 'ambient', 'study'],
    energy: 0.4,
    valence: 0.5,
    tempo: 95,
    description: 'Concentración y productividad'
  },
  {
    id: 'latenight',
    name: '🌙 Late Night',
    emoji: '🌙',
    genres: ['r-n-b', 'soul', 'jazz'],
    energy: 0.5,
    valence: 0.4,
    tempo: 85,
    description: 'Smooth vibes nocturnos'
  }
];

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('mood'); // 'mood', 'artists'
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [createdPlaylist, setCreatedPlaylist] = useState(null);

  // States para modo mood
  const [selectedMood, setSelectedMood] = useState(null);
  const [trackCount, setTrackCount] = useState(20);

  // States para modo artistas
  const [artistQuery, setArtistQuery] = useState('');
  const [searchedArtists, setSearchedArtists] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);

  // States para preview de audio
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingTrackId, setPlayingTrackId] = useState(null);

  // State para modal de Spotify Player
  const [spotifyPlayerTrack, setSpotifyPlayerTrack] = useState(null);

  // States para mejorar playlist con reemplazos
  const [removedTrackIds, setRemovedTrackIds] = useState([]);
  const [currentPlaylistConfig, setCurrentPlaylistConfig] = useState(null);
  const [fetchingReplacement, setFetchingReplacement] = useState(false);

  // Verificar si hay un token en la URL al cargar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');

    if (token) {
      setAccessToken(token);
      localStorage.setItem('spotify_token', token);

      // Limpiar la URL
      window.history.replaceState({}, document.title, '/');

      // Obtener info del usuario
      fetchUserInfo(token);
    } else {
      // Intentar obtener el token del localStorage
      const savedToken = localStorage.getItem('spotify_token');
      if (savedToken) {
        setAccessToken(savedToken);
        fetchUserInfo(savedToken);
      }
    }
  }, []);

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/me?access_token=${token}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error al obtener info del usuario:', error);
      localStorage.removeItem('spotify_token');
      setAccessToken(null);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/login`);
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  const handleGenerateFromMood = async (preset) => {
    setLoading(true);
    setCreatedPlaylist(null);
    setSelectedMood(preset);
    setRemovedTrackIds([]); // Reset removed tracks

    try {
      // Guardar la configuración para futuros reemplazos
      const playlistConfig = {
        type: 'mood',
        genres: preset.genres,
        config: {
          limit: trackCount,
          energy: preset.energy,
          valence: preset.valence,
          tempo: preset.tempo
        }
      };
      setCurrentPlaylistConfig(playlistConfig);

      // Usar recomendaciones personalizadas basadas en historial + mood
      const response = await axios.post(`${API_URL}/api/personalized-recommendations`, {
        access_token: accessToken,
        genres: preset.genres, // Fallback si no hay permisos
        config: {
          limit: trackCount,
          energy: preset.energy,
          valence: preset.valence,
          tempo: preset.tempo
        }
      });

      console.log('Tracks recibidos:', response.data.tracks);
      console.log('Primer track preview_url:', response.data.tracks[0]?.preview_url);

      // Ordenar: primero las que tienen preview, luego las que no
      const sortedTracks = [...response.data.tracks].sort((a, b) => {
        if (a.preview_url && !b.preview_url) return -1;
        if (!a.preview_url && b.preview_url) return 1;
        return 0;
      });

      const withPreview = sortedTracks.filter(t => t.preview_url).length;
      console.log(`📊 ${withPreview} de ${sortedTracks.length} canciones tienen preview disponible`);

      setTracks(sortedTracks);
    } catch (error) {
      console.error('Error al generar playlist:', error);
      alert('Error al generar playlist. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchArtists = async () => {
    if (!artistQuery.trim()) {
      alert('Escribe el nombre de un artista');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/search-artists`, {
        query: artistQuery,
        access_token: accessToken
      });

      setSearchedArtists(response.data.artists);
    } catch (error) {
      console.error('Error al buscar artistas:', error);
      alert('Error al buscar artistas. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectArtist = (artist) => {
    if (selectedArtists.find(a => a.id === artist.id)) {
      setSelectedArtists(selectedArtists.filter(a => a.id !== artist.id));
    } else {
      if (selectedArtists.length >= 5) {
        alert('Máximo 5 artistas');
        return;
      }
      setSelectedArtists([...selectedArtists, artist]);
    }
  };

  const handleGetSimilarToArtists = async () => {
    if (selectedArtists.length === 0) {
      alert('Selecciona al menos un artista');
      return;
    }

    setLoading(true);
    setCreatedPlaylist(null);
    setRemovedTrackIds([]); // Reset removed tracks

    try {
      const artistIds = selectedArtists.map(a => a.id);

      // Guardar la configuración para futuros reemplazos
      const playlistConfig = {
        type: 'artists',
        artistIds,
        config: {
          limit: trackCount,
          energy: 0.7,
          valence: 0.6,
          tempo: 120
        }
      };
      setCurrentPlaylistConfig(playlistConfig);

      const response = await axios.post(`${API_URL}/api/similar-to-artists`, {
        access_token: accessToken,
        artistIds,
        config: {
          limit: trackCount,
          energy: 0.7,
          valence: 0.6,
          tempo: 120
        }
      });

      // Ordenar: primero las que tienen preview, luego las que no
      const sortedTracks = [...response.data.tracks].sort((a, b) => {
        if (a.preview_url && !b.preview_url) return -1;
        if (!a.preview_url && b.preview_url) return 1;
        return 0;
      });

      setTracks(sortedTracks);
      setSearchedArtists([]);
      setArtistQuery('');
    } catch (error) {
      console.error('Error al obtener canciones similares:', error);
      alert('Error al obtener canciones similares. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      alert('Dale un nombre a tu playlist');
      return;
    }

    if (tracks.length === 0) {
      alert('No hay canciones para agregar');
      return;
    }

    setLoading(true);

    try {
      const trackUris = tracks.map(track => track.uri);

      const response = await axios.post(`${API_URL}/api/create-playlist`, {
        access_token: accessToken,
        name: playlistName,
        description: selectedMood
          ? `${selectedMood.description} • Creada con Spotify AI Playlist`
          : 'Creada con Spotify AI Playlist',
        tracks: trackUris
      });

      setCreatedPlaylist(response.data);
      setPlaylistName('');
    } catch (error) {
      console.error('Error al crear playlist:', error);
      alert('Error al crear la playlist. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('spotify_token');
    setAccessToken(null);
    setUser(null);
    setTracks([]);
    setCreatedPlaylist(null);
    setSelectedArtists([]);
    setSearchedArtists([]);
  };

  const handlePlayPreview = (track) => {
    // Si no hay preview disponible
    if (!track.preview_url) {
      alert('Preview no disponible para esta canción');
      return;
    }

    // Si hay audio reproduciéndose y es el mismo track, pausar
    if (currentAudio && playingTrackId === track.id) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingTrackId(null);
      return;
    }

    // Si hay audio reproduciéndose y es diferente track, detener el anterior
    if (currentAudio) {
      currentAudio.pause();
    }

    // Reproducir el nuevo audio
    const audio = new Audio(track.preview_url);
    audio.play();
    setCurrentAudio(audio);
    setPlayingTrackId(track.id);

    // Cuando termine el preview, resetear
    audio.onended = () => {
      setCurrentAudio(null);
      setPlayingTrackId(null);
    };
  };

  const handleRemoveTrack = async (trackId) => {
    // Si se está reproduciendo el track que se elimina, detener el audio
    if (playingTrackId === trackId && currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingTrackId(null);
    }

    // Agregar a la blacklist
    const newRemovedIds = [...removedTrackIds, trackId];
    setRemovedTrackIds(newRemovedIds);

    // Remover de la lista actual
    setTracks(prevTracks => prevTracks.filter(track => track.id !== trackId));

    // Si hay configuración guardada, obtener un reemplazo
    if (currentPlaylistConfig) {
      setFetchingReplacement(true);
      try {
        console.log('🔄 Obteniendo reemplazo para canción removida...');

        // IDs a excluir: removidos + los que ya están en la lista
        const currentTrackIds = tracks.map(t => t.id);
        const excludeIds = [...new Set([...newRemovedIds, ...currentTrackIds])];

        const requestBody = {
          access_token: accessToken,
          excludeTrackIds: excludeIds,
          config: currentPlaylistConfig.config
        };

        // Agregar géneros o artistas según el tipo
        if (currentPlaylistConfig.type === 'mood') {
          requestBody.genres = currentPlaylistConfig.genres;
        } else if (currentPlaylistConfig.type === 'artists') {
          requestBody.artistIds = currentPlaylistConfig.artistIds;
        }

        const response = await axios.post(`${API_URL}/api/get-replacement-track`, requestBody);

        if (response.data.track) {
          console.log('✅ Nueva canción obtenida:', response.data.track.name);

          // Agregar la nueva canción al final de la lista
          setTracks(prevTracks => [...prevTracks, response.data.track]);
        }
      } catch (error) {
        console.error('Error al obtener reemplazo:', error);
        // No mostramos alerta para no interrumpir la experiencia
        console.log('⚠️ No se pudo obtener reemplazo, continuando sin él');
      } finally {
        setFetchingReplacement(false);
      }
    }
  };

  const handleOpenSpotifyPlayer = (track) => {
    // Detener audio si hay alguno reproduciéndose
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingTrackId(null);
    }
    setSpotifyPlayerTrack(track);
  };

  const handleCloseSpotifyPlayer = () => {
    setSpotifyPlayerTrack(null);
  };

  // Vista de login
  if (!accessToken) {
    return (
      <div className="container">
        <div className="header">
          <h1>🎵 Spotify AI Playlist</h1>
          <p>Crea playlists increíbles de forma simple y rápida</p>
        </div>
        <div className="login-container">
          <button className="login-button" onClick={handleLogin}>
            Conectar con Spotify
          </button>
        </div>
      </div>
    );
  }

  // Vista principal
  return (
    <div className="container">
      <div className="header">
        <h1>🎵 Spotify AI Playlist</h1>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px' }}>
            {user.images && user.images[0] && (
              <img
                src={user.images[0].url}
                alt={user.display_name}
                style={{ width: '40px', height: '40px', borderRadius: '50%' }}
              />
            )}
            <span style={{ fontWeight: 'bold' }}>{user.display_name}</span>
            <button
              onClick={handleLogout}
              style={{
                marginLeft: 'auto',
                padding: '8px 16px',
                background: '#f0f0f0',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      <div className="main-content">
        {/* Selector de modo */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '10px'
        }}>
          <button
            onClick={() => {
              setMode('mood');
              setTracks([]);
            }}
            style={{
              padding: '12px 24px',
              background: mode === 'mood' ? '#1DB954' : 'transparent',
              color: mode === 'mood' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            🎭 Por Mood
          </button>
          <button
            onClick={() => {
              setMode('artists');
              setTracks([]);
            }}
            style={{
              padding: '12px 24px',
              background: mode === 'artists' ? '#1DB954' : 'transparent',
              color: mode === 'artists' ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            🎤 Artistas Similares
          </button>
        </div>

        {/* Modo: Por Mood */}
        {mode === 'mood' && (
          <div>
            <h2 style={{ marginBottom: '10px' }}>Elige el vibe de tu playlist</h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
              ✨ Selecciona un mood para generar tu playlist
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '15px',
              marginBottom: '30px'
            }}>
              {MOOD_PRESETS.map(preset => (
                <div
                  key={preset.id}
                  onClick={() => handleGenerateFromMood(preset)}
                  style={{
                    padding: '30px 20px',
                    background: selectedMood?.id === preset.id ? '#1DB954' : 'white',
                    color: selectedMood?.id === preset.id ? 'white' : '#333',
                    border: '2px solid',
                    borderColor: selectedMood?.id === preset.id ? '#1DB954' : '#ddd',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    boxShadow: selectedMood?.id === preset.id ? '0 4px 12px rgba(29,185,84,0.3)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>{preset.emoji}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                    {preset.name.replace(preset.emoji, '').trim()}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>{preset.description}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Número de canciones: {trackCount}
              </label>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={trackCount}
                onChange={(e) => setTrackCount(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}

        {/* Modo: Artistas Similares */}
        {mode === 'artists' && (
          <div>
            <h2 style={{ marginBottom: '10px' }}>Busca artistas similares</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Busca tus artistas favoritos y genera una playlist con música similar (sin incluir sus canciones)
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Ej: Paco Amoroso, Bad Bunny..."
                value={artistQuery}
                onChange={(e) => setArtistQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchArtists()}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #ddd',
                  fontSize: '16px'
                }}
              />
              <button
                onClick={handleSearchArtists}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: '#1DB954',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Buscar
              </button>
            </div>

            {selectedArtists.length > 0 && (
              <div style={{ marginBottom: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '12px' }}>
                <h4 style={{ marginBottom: '10px' }}>
                  Artistas seleccionados ({selectedArtists.length}/5):
                </h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                  {selectedArtists.map(artist => (
                    <div
                      key={artist.id}
                      style={{
                        padding: '8px 15px',
                        background: '#1DB954',
                        color: 'white',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSelectArtist(artist)}
                    >
                      {artist.name}
                      <span style={{ fontWeight: 'bold', fontSize: '18px' }}>×</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                    Número de canciones: {trackCount}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={trackCount}
                    onChange={(e) => setTrackCount(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>

                <button
                  onClick={handleGetSimilarToArtists}
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: '#764ba2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%',
                    fontSize: '16px'
                  }}
                >
                  {loading ? 'Generando...' : '✨ Generar Playlist Similar'}
                </button>
              </div>
            )}

            {searchedArtists.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '15px' }}>Resultados (click para seleccionar):</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '15px'
                }}>
                  {searchedArtists.map(artist => {
                    const isSelected = selectedArtists.find(a => a.id === artist.id);
                    return (
                      <div
                        key={artist.id}
                        onClick={() => handleSelectArtist(artist)}
                        style={{
                          padding: '15px',
                          background: isSelected ? '#1DB954' : 'white',
                          color: isSelected ? 'white' : 'black',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          border: '2px solid',
                          borderColor: isSelected ? '#1DB954' : '#ddd',
                          transition: 'all 0.2s'
                        }}
                      >
                        {artist.image && (
                          <img
                            src={artist.image}
                            alt={artist.name}
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              marginBottom: '10px'
                            }}
                          />
                        )}
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{artist.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Generando tu playlist perfecta...</p>
          </div>
        )}

        {tracks.length > 0 && !loading && (
          <div className="tracks-section" style={{ marginTop: '30px' }}>
            <h3>🎵 Tu Playlist ({tracks.length} canciones)</h3>
            <div style={{ marginBottom: '15px' }}>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>
                💡 <strong>Tip:</strong> Haz click en "🎵 Escuchar completa" para reproducir cualquier canción (requiere Spotify Premium)
              </p>
              <p style={{ color: '#1DB954', fontSize: '13px', fontWeight: 'bold' }}>
                ✨ Al quitar una canción, se agregará automáticamente una nueva sugerencia
              </p>
            </div>
            {fetchingReplacement && (
              <div style={{
                padding: '12px',
                background: '#e3f2fd',
                border: '1px solid #2196f3',
                borderRadius: '8px',
                marginBottom: '15px',
                fontSize: '14px',
                color: '#1976d2',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                <span>🔄 Buscando nueva sugerencia...</span>
              </div>
            )}
            <div className="tracks-grid">
              {tracks.map((track) => (
                <div key={track.id} className="track-card" style={{ position: 'relative' }}>
                  <button
                    onClick={() => handleRemoveTrack(track.id)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10
                    }}
                    title="Quitar canción"
                  >
                    ×
                  </button>
                  <img
                    src={track.image || 'https://via.placeholder.com/150'}
                    alt={track.name}
                    className="track-image"
                  />
                  <div className="track-name">{track.name}</div>
                  <div className="track-artist">{track.artist}</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    {/* Botón de Preview (solo si está disponible) */}
                    {track.preview_url && (
                      <button
                        onClick={() => handlePlayPreview(track)}
                        style={{
                          padding: '8px 12px',
                          background: playingTrackId === track.id ? '#ff4444' : '#1DB954',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          width: '100%'
                        }}
                      >
                        {playingTrackId === track.id ? '⏸ Pausar' : '▶ Preview 30s'}
                      </button>
                    )}

                    {/* Botón de Spotify Player (siempre disponible) */}
                    <button
                      onClick={() => handleOpenSpotifyPlayer(track)}
                      style={{
                        padding: '8px 12px',
                        background: '#1ed760',
                        color: '#000',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        width: '100%'
                      }}
                    >
                      🎵 Escuchar completa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="playlist-form" style={{ marginTop: '30px' }}>
              <h3>💾 Guardar en Spotify</h3>
              <input
                type="text"
                placeholder="Nombre de la playlist"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #ddd',
                  fontSize: '16px',
                  marginBottom: '15px'
                }}
              />
              <button
                className="create-playlist-button"
                onClick={handleCreatePlaylist}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: '#1DB954',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                {loading ? 'Creando...' : '💾 Crear Playlist en Spotify'}
              </button>
            </div>
          </div>
        )}

        {createdPlaylist && (
          <div className="success-message" style={{
            marginTop: '20px',
            padding: '20px',
            background: '#1DB954',
            color: 'white',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3>🎉 ¡Playlist creada!</h3>
            <p>
              <a
                href={createdPlaylist.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'white', textDecoration: 'underline' }}
              >
                Abrir "{createdPlaylist.name}" en Spotify →
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Modal del reproductor de Spotify */}
      {spotifyPlayerTrack && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={handleCloseSpotifyPlayer}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '500px',
              width: '90%',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseSpotifyPlayer}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
                color: '#666',
                fontWeight: 'bold',
                lineHeight: '1'
              }}
            >
              ×
            </button>

            <h3 style={{ marginBottom: '15px', marginTop: '0' }}>
              🎵 {spotifyPlayerTrack.name}
            </h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              {spotifyPlayerTrack.artist}
            </p>

            {/* Spotify Embed Player */}
            <iframe
              src={`https://open.spotify.com/embed/track/${spotifyPlayerTrack.id}?utm_source=generator`}
              width="100%"
              height="152"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ borderRadius: '12px' }}
            ></iframe>

            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <a
                href={`spotify:track:${spotifyPlayerTrack.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#1DB954',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Abrir en App
              </a>
              <a
                href={`https://open.spotify.com/track/${spotifyPlayerTrack.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#191414',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                Abrir en Web
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
