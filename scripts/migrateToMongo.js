//migratetomongo.js
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import Cart from '../src/models/Cart.js';

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'backend-ecommerce';

if (!MONGO_URI) {
  console.error('Por favor define MONGO_URI en .env antes de ejecutar la migración');
  process.exit(1);
}

async function migrate() {
  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME });
  console.log('Conectado a Mongo para migración');

  const productsData = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));
  const cartsData = JSON.parse(fs.readFileSync('./src/data/carts.json', 'utf8'));

  // Limpiar colecciones (opcional)
  await Product.deleteMany({});
  await Cart.deleteMany({});

  // Insertar productos
  const createdProducts = await Product.insertMany(productsData.map(p => ({
    title: p.title,
    description: p.description,
    code: p.code,
    price: p.price,
    stock: p.stock,
    category: p.category,
    thumbnails: p.thumbnails || [],
    status: p.status !== undefined ? p.status : true
  })));

  console.log(`Migrados ${createdProducts.length} productos`);

  // Crear un mapa code -> ObjectId para relacionar carritos
  const codeToId = {};
  for (const p of createdProducts) {
    codeToId[p.code] = p._id.toString();
  }

  // Insertar carritos
  const cartsToInsert = cartsData.map(c => ({
    products: (c.products || []).map(item => {
      // intentar resolver por product id (num) buscando en productsData por id o code
      const found = productsData.find(pd => pd.id === item.product || pd.code === item.product || String(pd.id) === String(item.product));
      const productId = found ? codeToId[found.code] : null;
      return productId ? { product: mongoose.Types.ObjectId(productId), quantity: item.quantity } : null;
    }).filter(Boolean)
  }));

  const createdCarts = await Cart.insertMany(cartsToInsert);
  console.log(`Migrados ${createdCarts.length} carritos`);

  await mongoose.disconnect();
  console.log('Migración completada y desconectada');
}

migrate().catch(err => {
  console.error('Error en migración:', err);
  process.exit(1);
});
// End of migratetomongo.js