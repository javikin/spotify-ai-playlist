// Configuración de la API
// En producción, el backend y frontend están en el mismo servidor
const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

export default API_URL;
