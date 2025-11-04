import { Router } from "express";
import CartManager from "../managers/CartManager.js";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const manager = new CartManager("./src/data/carts.json");
const productManager = new ProductManager("./src/data/products.json");

router.post("/", async (req, res) => {
  const newCart = await manager.createCart();
  res.status(201).json(newCart);
});

router.get("/:cid", async (req, res) => {
  const id = parseInt(req.params.cid);
  const cart = await manager.getCartById(id);
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
  // La consigna pide listar los productos del carrito
  res.json(cart.products);
});

router.post("/:cid/product/:pid", async (req, res) => {
  const cid = parseInt(req.params.cid);
  const pid = parseInt(req.params.pid);

  const cart = await manager.getCartById(cid);
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

  const product = await productManager.getProductById(pid);
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });

  const existing = cart.products.find(p => p.product === pid);
  const nextQty = (existing ? existing.quantity : 0) + 1;
  if (typeof product.stock === "number" && nextQty > product.stock) {
    return res.status(400).json({ error: "No hay stock suficiente" });
  }

  const updatedCart = await manager.addProductToCart(cid, pid);
  res.json(updatedCart);
});

export default router;
