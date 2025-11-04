# Backend Entrega 1 - Gestión de Productos y Carritos

Este proyecto es un servidor en **Node.js** con **Express**, diseñado para gestionar productos y carritos de compra.

---

## 📂 Estructura del proyecto

```
backend-entrega1/
├── src/
│   ├── app.js
│   ├── routes/
│   │   ├── products.router.js
│   │   └── carts.router.js
│   ├── managers/
│   │   ├── ProductManager.js
│   │   └── CartManager.js
│   └── data/
│       ├── products.json   ← vacío
│       └── carts.json      ← vacío
├── package.json
└── .gitignore (con node_modules)
```

---

## ⚙️ Instalación y ejecución

1. Clonar el repositorio:

```bash
git clone https://github.com/Secreto21/backend-ecommerce
```

2. Instalar dependencias:

```bash
npm install
```

3. Iniciar el servidor:

```bash
npm start
```

El servidor escuchará en el puerto **8080**.

---

## 🚀 Endpoints

### Productos (`/api/products`)

| Método | Ruta    | Descripción                     | Body (JSON)                                                                                                                  |
| ------ | ------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/`     | Lista todos los productos       | -                                                                                                                            |
| GET    | `/:pid` | Trae un producto por su id      | -                                                                                                                            |
| POST   | `/`     | Crea un nuevo producto          | `{ "title": "", "description": "", "code": "", "price": 0, "status": true, "stock": 0, "category": "", "thumbnails": [""] }` |
| PUT    | `/:pid` | Actualiza un producto existente | `{ "price": 0, "stock": 0 }`                                                                                                 |
| DELETE | `/:pid` | Elimina un producto por su id   | -                                                                                                                            |

---

### Carritos (`/api/carts`)

| Método | Ruta                 | Descripción                   | Body |
| ------ | -------------------- | ----------------------------- | ---- |
| POST   | `/`                  | Crea un nuevo carrito vacío   | -    |
| GET    | `/:cid`              | Trae un carrito por id        | -    |
| POST   | `/:cid/product/:pid` | Agrega un producto al carrito | -    |

> Si un producto ya existe en el carrito, se incrementa automáticamente la cantidad (`quantity`).

---

## 💡 Notas importantes

* Los archivos **products.json** y **carts.json** se utilizan para la **persistencia** de datos y deben estar vacíos al momento de la entrega (`[]`).
* La carpeta **node_modules** está ignorada mediante `.gitignore`.
* Todos los endpoints se pueden probar con **Postman** u otro cliente HTTP.
* El `id` de productos y carritos se genera automáticamente, no es necesario enviarlo en el body.

---

### 🔧 Ejemplo de POST en productos (JSON)

```json
{
  "title": "Sushi Vegano",
  "description": "Rolls de vegetales frescos con salsa de soja",
  "code": "SV001",
  "price": 2500,
  "status": true,
  "stock": 15,
  "category": "Comida Japonesa",
  "thumbnails": ["img/sushi1.png", "img/sushi2.png"]
}
```

---

### 🔧 Ejemplo de POST en carrito

```bash
POST http://localhost:8080/api/carts/1/product/1
```

* Esto agrega **el producto con id 1** al **carrito 1**.
* Si el producto ya existe, se incrementa `quantity` en 1.
