//Cart.js
import mongoose from 'mongoose';

const cartProductSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 }
});

const cartSchema = new mongoose.Schema({
  products: { type: [cartProductSchema], default: [] }
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
// End of Cart.js