import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import exphbs from "express-handlebars";
import mongoose from "mongoose";
import { USE_MONGO, MONGO_URI, MONGO_DB_NAME } from './utils/env.js';

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

// Exponer io para usarlo dentro de los routers HTTP
app.set("io", io);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Handlebars
const hbs = exphbs.create({ defaultLayout: false });
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Routers
app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
// Conectar a Mongo solo si USE_MONGO=true en .env
if (USE_MONGO) {
  mongoose
    .connect(MONGO_URI, { dbName: MONGO_DB_NAME })
    .then(() => console.log('Conectado a MongoDB'))
    .catch((err) => console.error('Error conectando a MongoDB:', err));
} else {
  console.log('USE_MONGO != true, usando persistencia por archivos JSON.');
}

// WebSockets
io.on("connection", socket => {
  console.log("Cliente conectado:", socket.id);
});

const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT} 🚀`);
});
