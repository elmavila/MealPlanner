const apiOrigin =
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:5173";

const isLocalDev =
  typeof window !== "undefined" &&
  (window.location.port === "5173" || window.location.port === "4173");

export const ApiUrl = isLocalDev
  ? `${window.location.protocol}//${window.location.hostname}:3032/api`
  : `${apiOrigin}/api`;
