import { Router } from "express";
import Product from "../models/Product.js";

const router = Router();

// GET con paginate
router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    let filter = {};
    if (query) {
      if (query === "available") filter.stock = { $gt: 0 };
      else filter.category = query;
    }

    let sortOption = {};
    if (sort === "asc") sortOption.price = 1;
    if (sort === "desc") sortOption.price = -1;

    const result = await Product.paginate(filter, {
      limit,
      page,
      sort: sortOption
    });

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `${baseUrl}?page=${result.prevPage}&limit=${limit}` : null,
      nextLink: result.hasNextPage ? `${baseUrl}?page=${result.nextPage}&limit=${limit}` : null
    });

  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// GET por ID
router.get("/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST (crear producto)
router.post("/", async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT (actualizar producto)
router.put("/:pid", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete("/:pid", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.pid);
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
