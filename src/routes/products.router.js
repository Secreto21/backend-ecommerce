import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const manager = new ProductManager("./src/data/products.json");

router.get("/", async (req, res) => {
  const { limit, page, sort, query } = req.query;
  const lim = parseInt(limit) > 0 ? parseInt(limit) : 10;
  const pg = parseInt(page) > 0 ? parseInt(page) : 1;

  let products = await manager.getProducts();

  if (query) {
    const q = query.toString().toLowerCase();
    if (q === "available" || q === "disponible" || q === "stock") {
      products = products.filter((p) => Number(p.stock) > 0);
    } else if (q.startsWith("category:")) {
      const cat = q.split("category:")[1];
      products = products.filter((p) => (p.category || "").toLowerCase() === (cat || "").toLowerCase());
    } else {
      products = products.filter(
        (p) =>
          (p.title || "").toString().toLowerCase().includes(q) ||
          (p.category || "").toString().toLowerCase().includes(q)
      );
    }
  }

  if (sort === "asc") products.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  else if (sort === "desc") products.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));

  const totalItems = products.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / lim));
  const pageClamped = Math.min(Math.max(1, pg), totalPages);
  const start = (pageClamped - 1) * lim;
  const payload = products.slice(start, start + lim);

  const hasPrevPage = pageClamped > 1;
  const hasNextPage = pageClamped < totalPages;

  const basePath = `${req.baseUrl}${req.path}`.replace(/\/$/, "");
  const buildLink = (p) => {
    const parts = [`limit=${lim}`, `page=${p}`];
    if (sort) parts.push(`sort=${encodeURIComponent(sort)}`);
    if (query) parts.push(`query=${encodeURIComponent(query)}`);
    return `${req.protocol}://${req.get("host")}${basePath}?${parts.join("&")}`;
  };

  res.json({
    status: "success",
    payload,
    totalPages,
    prevPage: hasPrevPage ? pageClamped - 1 : null,
    nextPage: hasNextPage ? pageClamped + 1 : null,
    page: pageClamped,
    hasPrevPage,
    hasNextPage,
    prevLink: hasPrevPage ? buildLink(pageClamped - 1) : null,
    nextLink: hasNextPage ? buildLink(pageClamped + 1) : null,
  });
});

router.get("/:pid", async (req, res) => {
  const id = parseInt(req.params.pid);
  const product = await manager.getProductById(id);
  if (!product) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(product);
});

router.post("/", async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;
  if (!title || !description || !code || !price || !stock || !category)
    return res.status(400).json({ error: "Faltan campos obligatorios" });

  const newProduct = await manager.addProduct({ title, description, code, price, stock, category, thumbnails: thumbnails || [] });
  const io = req.app.get("io");
  const products = await manager.getProducts();
  io.emit("productsUpdated", products);
  res.status(201).json(newProduct);
});

router.put("/:pid", async (req, res) => {
  const id = parseInt(req.params.pid);
  const updated = await manager.updateProduct(id, req.body);
  if (!updated) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(updated);
});

router.delete("/:pid", async (req, res) => {
  const id = parseInt(req.params.pid);
  await manager.deleteProduct(id);
  const io = req.app.get("io");
  const products = await manager.getProducts();
  io.emit("productsUpdated", products);
  res.json({ message: "Producto eliminado correctamente" });
});

export default router;
