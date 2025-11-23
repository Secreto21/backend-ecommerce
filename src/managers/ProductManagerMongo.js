import Product from '../models/Product.js';

export default class ProductManagerMongo {
  constructor() {}

  async getProducts() {
    const products = await Product.find().lean();
    return products.map(p => ({ ...p, id: p._id }));
  }

  async getProductById(id) {
    try {
      const product = await Product.findById(id).lean();
      if (!product) return null;
      return { ...product, id: product._id };
    } catch (err) {
      return null;
    }
  }

  async addProduct(product) {
    const created = await Product.create({ ...product, status: true });
    const obj = created.toObject();
    return { ...obj, id: obj._id };
  }

  async updateProduct(id, updatedProduct) {
    try {
      const updated = await Product.findByIdAndUpdate(id, updatedProduct, { new: true, runValidators: true }).lean();
      return updated;
    } catch (err) {
      return null;
    }
  }

  async deleteProduct(id) {
    try {
      await Product.findByIdAndDelete(id);
      return true;
    } catch (err) {
      return false;
    }
  }
}
