//views.router.js
import { Router } from "express";

import ProductManager from "../managers/ProductManager.js";
import CartManager from "../managers/CartManager.js";
import ProductManagerMongo from "../managers/ProductManagerMongo.js";
import CartManagerMongo from "../managers/CartManagerMongo.js";
import { USE_MONGO } from "../utils/env.js";

const router = Router();
const manager = USE_MONGO ? new ProductManagerMongo() : new ProductManager("./src/data/products.json");
const cartManager = USE_MONGO ? new CartManagerMongo() : new CartManager("./src/data/carts.json");

router.get("/", async (req, res) => {
  const products = await manager.getProducts();
  res.render("home", { products });
});

// Nueva: vista para productos en tiempo real
router.get("/realtimeproducts", async (req, res) => {
  const products = await manager.getProducts();
  res.render("realTimeProducts", { products });
});

// Nueva: vista con paginación y filtros (consulta: limit,page,sort,query)
router.get("/products", async (req, res) => {
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
  const basePath = "/products";
  const buildLink = (p) => {
    const parts = [`limit=${lim}`, `page=${p}`];
    if (sort) parts.push(`sort=${encodeURIComponent(sort)}`);
    if (query) parts.push(`query=${encodeURIComponent(query)}`);
    return `${basePath}?${parts.join("&")}`;
  };

  res.render("home", {
    products: payload,
    pagination: {
      totalPages,
      prevPage: hasPrevPage ? pageClamped - 1 : null,
      nextPage: hasNextPage ? pageClamped + 1 : null,
      page: pageClamped,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? buildLink(pageClamped - 1) : null,
      nextLink: hasNextPage ? buildLink(pageClamped + 1) : null,
    },
  });
});

router.get("/products/:pid", async (req, res) => {
  const rawId = req.params.pid;
  const id = USE_MONGO ? rawId : parseInt(rawId);
  const product = await manager.getProductById(id);
  if (!product) return res.status(404).render("error", { message: "Producto no encontrado" });
  res.render("productDetails", { product });
});

router.get('/carts/:cid', async (req, res) => {
  const rawCid = req.params.cid;
  const cid = USE_MONGO ? rawCid : parseInt(rawCid);
  const cart = USE_MONGO ? await cartManager.getCartById(cid, true) : await cartManager.getCartById(cid);
  if (!cart) return res.status(404).render('error', { message: 'Carrito no encontrado' });
  res.render('cart', { cart });
});

export default router;
// End of views.router.js