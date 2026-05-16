import axios from 'axios'

// En développement  : baseURL = '/api'  → redirigé vers localhost:6000 par le proxy Vite
// En production     : baseURL = valeur de VITE_API_URL dans Vercel (ex: https://tonsite.infinityfreeapp.com)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
  timeout: 8000,
})

api.interceptors.response.use(
  res => res,
  err => {
    let msg
    if (!err.response) {
      // Pas de réponse = serveur PHP éteint ou inaccessible
      msg = 'Serveur inaccessible — vérifiez que PHP est démarré sur le port 6000'
    } else {
      msg = err.response?.data?.message || 'Une erreur est survenue'
    }
    return Promise.reject({ ...err, userMessage: msg })
  }
)

export default api
