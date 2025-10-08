import { Router } from "express";
import CartManager from "../managers/CartManager.js";

const router = Router();
const manager = new CartManager("./src/data/carts.json");

router.post("/", async (req, res) => {
  const newCart = await manager.createCart();
  res.status(201).json(newCart);
});

router.get("/:cid", async (req, res) => {
  const id = parseInt(req.params.cid);
  const cart = await manager.getCartById(id);
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
  res.json(cart);
});

router.post("/:cid/product/:pid", async (req, res) => {
  const cid = parseInt(req.params.cid);
  const pid = parseInt(req.params.pid);
  const updatedCart = await manager.addProductToCart(cid, pid);

  if (!updatedCart)
    return res.status(404).json({ error: "Carrito no encontrado" });

  res.json(updatedCart);
});

export default router;
