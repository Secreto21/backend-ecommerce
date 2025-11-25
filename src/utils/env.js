//env.js
import dotenv from "dotenv";
dotenv.config();

// No poner credenciales aquí. Usa un archivo local `.env` (está en .gitignore).
export const USE_MONGO = process.env.USE_MONGO === "true";
// No incluir una URI por defecto con credenciales en el repo.
export const MONGO_URI = process.env.MONGO_URI || "";
export const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "";



// Mensaje útil si activaste Mongo pero olvidaste la URI
if (USE_MONGO && !MONGO_URI) {
  console.warn("USE_MONGO=true pero MONGO_URI está vacío. Añade MONGO_URI en un archivo .env local.");
}
// End of env.js