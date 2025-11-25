//carts.router.js
import { Router } from "express";
import CartManager from "../managers/CartManager.js";
import ProductManager from "../managers/ProductManager.js";
import CartManagerMongo from "../managers/CartManagerMongo.js";
import ProductManagerMongo from "../managers/ProductManagerMongo.js";
import { USE_MONGO } from "../utils/env.js";

const router = Router();
const manager = USE_MONGO ? new CartManagerMongo() : new CartManager("./src/data/carts.json");
const productManager = USE_MONGO ? new ProductManagerMongo() : new ProductManager("./src/data/products.json");

// Crear carrito
router.post("/", async (req, res) => {
  const newCart = await manager.createCart();
  res.status(201).json(newCart);
});

// Obtener carrito y popular productos (resolver ids)
router.get("/:cid", async (req, res) => {
  const cidRaw = req.params.cid;
  const cid = USE_MONGO ? cidRaw : parseInt(cidRaw);
  // If using Mongo manager, request with populate option
  const cart = USE_MONGO ? await manager.getCartById(cid, true) : await manager.getCartById(cid);
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

  if (USE_MONGO) {
    // cart.products already populated by mongoose
    const populatedProducts = (cart.products || []).map(p => ({ product: p.product, quantity: p.quantity }));
    return res.json({ ...cart, products: populatedProducts });
  }

  // Popular productos leyendo ProductManager (archivo JSON)
  const populatedProducts = await Promise.all(
    (cart.products || []).map(async (p) => {
      const product = await productManager.getProductById(parseInt(p.product));
      if (!product) return { product: { id: p.product, title: "Producto no disponible" }, quantity: p.quantity };
      return { product, quantity: p.quantity };
    })
  );

  res.json({ ...cart, products: populatedProducts });
});

// Agregar producto al carrito (mantener lógica)
router.post("/:cid/product/:pid", async (req, res) => {
  const cidRaw = req.params.cid;
  const pidRaw = req.params.pid;
  const cid = USE_MONGO ? cidRaw : parseInt(cidRaw);
  const pid = USE_MONGO ? pidRaw : parseInt(pidRaw);

  const cart = await manager.getCartById(cid);
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

  const product = await productManager.getProductById(pid);
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });

  const existing = cart.products.find(p => (USE_MONGO ? String(p.product._id || p.product) === String(pid) : p.product === pid));
  const nextQty = (existing ? existing.quantity : 0) + 1;
  if (typeof product.stock === "number" && nextQty > product.stock) {
    return res.status(400).json({ error: "No hay stock suficiente" });
  }

  const updatedCart = await manager.addProductToCart(cid, pid);
  res.json(updatedCart);
});

// Nuevo: eliminar un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  const cidRaw = req.params.cid;
  const pidRaw = req.params.pid;
  const cid = USE_MONGO ? cidRaw : parseInt(cidRaw);
  const pid = USE_MONGO ? pidRaw : parseInt(pidRaw);
  const cart = await manager.removeProductFromCart(cid, pid);
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
  res.json(cart);
});

// Nuevo: reemplazar todos los productos del carrito
router.put("/:cid", async (req, res) => {
  const cidRaw = req.params.cid;
  const cid = USE_MONGO ? cidRaw : parseInt(cidRaw);
  const { products } = req.body;
  if (!Array.isArray(products)) return res.status(400).json({ error: "products debe ser un arreglo" });
  const updatedCart = await manager.updateCartProducts(cid, products);
  if (!updatedCart) return res.status(404).json({ error: "Carrito no encontrado" });
  res.json(updatedCart);
});

// Nuevo: actualizar sólo la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
  const cidRaw = req.params.cid;
  const pidRaw = req.params.pid;
  const cid = USE_MONGO ? cidRaw : parseInt(cidRaw);
  const pid = USE_MONGO ? pidRaw : parseInt(pidRaw);
  const quantity = parseInt(req.body.quantity);
  if (isNaN(quantity) || quantity < 1) return res.status(400).json({ error: "quantity debe ser un número entero mayor a 0" });
  const updatedCart = await manager.updateProductQuantity(cid, pid, quantity);
  if (!updatedCart) return res.status(404).json({ error: "Carrito no encontrado" });
  res.json(updatedCart);
});

// Nuevo: vaciar carrito
router.delete("/:cid", async (req, res) => {
  const cidRaw = req.params.cid;
  const cid = USE_MONGO ? cidRaw : parseInt(cidRaw);
  const cart = await manager.clearCart(cid);
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
  res.json(cart);
});

// Implementar métodos para manejar carritos

export default router;
// End of carts.router.js