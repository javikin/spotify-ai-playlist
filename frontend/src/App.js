import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from './config';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [config, setConfig] = useState({
    limit: 20,
    energy: 0.7,
    valence: 0.5,
    tempo: 120
  });
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [createdPlaylist, setCreatedPlaylist] = useState(null);

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

  const handleGeneratePlaylist = async () => {
    if (!prompt.trim()) {
      alert('Por favor escribe un prompt');
      return;
    }

    setLoading(true);
    setCreatedPlaylist(null);
    
    try {
      // Opción 1: Buscar por prompt
      const response = await axios.post(`${API_URL}/api/search-songs`, {
        prompt,
        access_token: accessToken,
        config
      });
      
      setTracks(response.data.tracks);
    } catch (error) {
      console.error('Error al generar playlist:', error);
      alert('Error al buscar canciones. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    setLoading(true);
    setCreatedPlaylist(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/recommendations`, {
        access_token: accessToken,
        config
      });
      
      setTracks(response.data.tracks);
    } catch (error) {
      console.error('Error al obtener recomendaciones:', error);
      alert('Error al obtener recomendaciones. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      alert('Por favor ingresa un nombre para la playlist');
      return;
    }

    if (tracks.length === 0) {
      alert('No hay canciones para agregar a la playlist');
      return;
    }

    setLoading(true);
    
    try {
      const trackUris = tracks.map(track => track.uri);
      
      const response = await axios.post(`${API_URL}/api/create-playlist`, {
        access_token: accessToken,
        name: playlistName,
        description: playlistDescription || `Generada con IA: ${prompt}`,
        tracks: trackUris
      });
      
      setCreatedPlaylist(response.data);
      setPlaylistName('');
      setPlaylistDescription('');
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
  };

  // Vista de login
  if (!accessToken) {
    return (
      <div className="container">
        <div className="header">
          <h1>🎵 Spotify AI Playlist</h1>
          <p>Crea playlists increíbles usando inteligencia artificial</p>
        </div>
        <div className="login-container">
          <button className="login-button" onClick={handleLogin}>
            Conectar con Spotify
          </button>
        </div>
      </div>
    );
  }

  // Vista principal (cuando está logueado)
  return (
    <div className="container">
      <div className="header">
        <h1>🎵 Spotify AI Playlist</h1>
        <p>Describe la playlist que quieres y déjame crearla para ti</p>
      </div>

      <div className="main-content">
        {user && (
          <div className="user-info">
            {user.images && user.images[0] && (
              <img 
                src={user.images[0].url} 
                alt={user.display_name}
                className="user-avatar"
              />
            )}
            <div className="user-details">
              <h3>¡Hola, {user.display_name}!</h3>
              <p>{user.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                marginLeft: 'auto',
                padding: '10px 20px',
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

        <div className="prompt-section">
          <h2>Describe tu playlist ideal</h2>
          <textarea
            className="prompt-input"
            placeholder="Ej: Quiero una playlist energética para el gym con rock alternativo, hip hop underground y algo de electrónica pesada. Canciones que motiven pero que no sean las más populares..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="config-section">
          <h3>⚙️ Configuración de la playlist</h3>
          <div className="config-grid">
            <div className="config-item">
              <label>Número de canciones</label>
              <input
                type="number"
                min="5"
                max="50"
                value={config.limit}
                onChange={(e) => setConfig({...config, limit: parseInt(e.target.value)})}
              />
            </div>

            <div className="config-item">
              <label>Energía (0-1)</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.energy}
                onChange={(e) => setConfig({...config, energy: parseFloat(e.target.value)})}
              />
              <div className="range-value">{config.energy}</div>
            </div>

            <div className="config-item">
              <label>Positividad (0-1)</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.valence}
                onChange={(e) => setConfig({...config, valence: parseFloat(e.target.value)})}
              />
              <div className="range-value">{config.valence}</div>
            </div>

            <div className="config-item">
              <label>Tempo (BPM)</label>
              <input
                type="range"
                min="60"
                max="200"
                step="5"
                value={config.tempo}
                onChange={(e) => setConfig({...config, tempo: parseInt(e.target.value)})}
              />
              <div className="range-value">{config.tempo}</div>
            </div>
          </div>
        </div>

        <button 
          className="generate-button"
          onClick={handleGeneratePlaylist}
          disabled={loading}
        >
          {loading ? 'Generando...' : '🎵 Generar Playlist'}
        </button>

        <button 
          className="generate-button"
          onClick={handleGetRecommendations}
          disabled={loading}
          style={{marginTop: '10px', backgroundColor: '#764ba2'}}
        >
          {loading ? 'Buscando...' : '✨ Obtener Recomendaciones'}
        </button>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Buscando las mejores canciones para ti...</p>
          </div>
        )}

        {tracks.length > 0 && !loading && (
          <div className="tracks-section">
            <h3>🎵 Canciones encontradas ({tracks.length})</h3>
            <div className="tracks-grid">
              {tracks.map((track) => (
                <div key={track.id} className="track-card">
                  <img 
                    src={track.image || 'https://via.placeholder.com/150'} 
                    alt={track.name}
                    className="track-image"
                  />
                  <div className="track-name">{track.name}</div>
                  <div className="track-artist">{track.artist}</div>
                </div>
              ))}
            </div>

            <div className="playlist-form">
              <h3>Crear Playlist en Spotify</h3>
              <input
                type="text"
                placeholder="Nombre de la playlist"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Descripción (opcional)"
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
              />
              <button 
                className="create-playlist-button"
                onClick={handleCreatePlaylist}
                disabled={loading}
              >
                {loading ? 'Creando...' : '💾 Crear Playlist en Spotify'}
              </button>
            </div>
          </div>
        )}

        {createdPlaylist && (
          <div className="success-message">
            <h3>🎉 ¡Playlist creada exitosamente!</h3>
            <p>
              <a href={createdPlaylist.url} target="_blank" rel="noopener noreferrer">
                Abrir "{createdPlaylist.name}" en Spotify
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
