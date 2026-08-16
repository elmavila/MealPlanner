const apiOrigin = typeof window !== 'undefined'
  ? window.location.origin
  : 'http://localhost:5173';

const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const ApiUrl = isLocalDev
  ? 'http://localhost:3032/api'
  : `${apiOrigin}/api`;