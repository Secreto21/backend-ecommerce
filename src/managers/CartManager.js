import fs from "fs";

export default class CartManager {
  constructor(path) {
    this.path = path;
  }

  async getCarts() {
    if (!fs.existsSync(this.path)) return [];
    const data = await fs.promises.readFile(this.path, "utf-8");
    return JSON.parse(data);
  }

  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find(c => c.id === id);
  }

  async createCart() {
    const carts = await this.getCarts();
    const newCart = {
      id: carts.length ? carts[carts.length - 1].id + 1 : 1,
      products: [],
    };
    carts.push(newCart);
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return newCart;
  }

  async addProductToCart(cid, pid) {
    const carts = await this.getCarts();
    const index = carts.findIndex(c => c.id === cid);
    if (index === -1) return null;

    const cart = carts[index];
    const existing = cart.products.find(p => p.product === pid);

    if (existing) {
      existing.quantity++;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return cart;
  }

  async removeProductFromCart(cid, pid) {
    const carts = await this.getCarts();
    const index = carts.findIndex(c => c.id === cid);
    if (index === -1) return null;
    const cart = carts[index];
    cart.products = cart.products.filter(p => p.product !== pid);
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return cart;
  }

  async updateCartProducts(cid, productsArray) {
    const carts = await this.getCarts();
    const index = carts.findIndex(c => c.id === cid);
    if (index === -1) return null;
    carts[index].products = Array.isArray(productsArray) ? productsArray : carts[index].products;
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return carts[index];
  }

  async updateProductQuantity(cid, pid, quantity) {
    const carts = await this.getCarts();
    const index = carts.findIndex(c => c.id === cid);
    if (index === -1) return null;
    const cart = carts[index];
    const existing = cart.products.find(p => p.product === pid);
    if (!existing) return null;
    if (typeof quantity === "number" && quantity > 0) {
      existing.quantity = quantity;
    } else {
      cart.products = cart.products.filter(p => p.product !== pid);
    }
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return cart;
  }

  async clearCart(cid) {
    const carts = await this.getCarts();
    const index = carts.findIndex(c => c.id === cid);
    if (index === -1) return null;
    carts[index].products = [];
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
    return carts[index];
  }
}
