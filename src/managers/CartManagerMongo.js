//CartManagerMongo.js
import Cart from '../models/Cart.js';
import mongoose from 'mongoose';

export default class CartManagerMongo {
  constructor() {}

  async getCartById(id, populate = false) {
    try {
      if (populate) return await Cart.findById(id).populate('products.product').lean();
      return await Cart.findById(id).lean();
    } catch (err) {
      return null;
    }
  }

  async createCart() {
    const created = await Cart.create({ products: [] });
    return created.toObject();
  }

  async addProductToCart(cid, pid) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) return null;
      const prodId = mongoose.Types.ObjectId(pid);
      const existing = cart.products.find(p => p.product.equals(prodId));
      if (existing) existing.quantity += 1;
      else cart.products.push({ product: prodId, quantity: 1 });
      await cart.save();
      return cart.toObject();
    } catch (err) {
      return null;
    }
  }

  async removeProductFromCart(cid, pid) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) return null;
      cart.products = cart.products.filter(p => !p.product.equals(mongoose.Types.ObjectId(pid)));
      await cart.save();
      return cart.toObject();
    } catch (err) {
      return null;
    }
  }

  async updateCartProducts(cid, productsArray) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) return null;
      const normalized = Array.isArray(productsArray)
        ? productsArray.map(p => ({ product: mongoose.Types.ObjectId(p.product), quantity: Number(p.quantity) || 1 }))
        : cart.products;
      cart.products = normalized;
      await cart.save();
      return cart.toObject();
    } catch (err) {
      return null;
    }
  }

  async updateProductQuantity(cid, pid, quantity) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) return null;
      const prodId = mongoose.Types.ObjectId(pid);
      const existing = cart.products.find(p => p.product.equals(prodId));
      if (!existing) return null;
      if (typeof quantity === 'number' && quantity > 0) existing.quantity = quantity;
      else cart.products = cart.products.filter(p => !p.product.equals(prodId));
      await cart.save();
      return cart.toObject();
    } catch (err) {
      return null;
    }
  }

  async clearCart(cid) {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) return null;
      cart.products = [];
      await cart.save();
      return cart.toObject();
    } catch (err) {
      return null;
    }
  }
}
// End of CartManagerMongo.js