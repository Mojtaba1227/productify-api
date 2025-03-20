import express from "express"; 
import bodyParser from "body-parser";
import { parse } from "dotenv";
import pg from "pg";


const app = express();
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from 'swagger-ui-express';
const port = 3000; 



const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Product API",
      version: "1.0.0",
      description: "API to manage products in a store",
    },
    servers: [
      {
        url: "http://localhost:3000", 
      },
    ],
    components: {
      schemas: {
        Product: {
          type: "object",
          required: ["product_id", "product_name", "availability", "price", "short_description", "date_created"],
          properties: {
           
            product_name: {
              type: "string",
              example: "Laptop",
            },
            availability: {
              type: "string",
              enum: ["InStock", "OutOfStock"],
              example: "InStock",
            },
            price: {
              type: "number",
              format: "float",
              example: 799,
            },
            short_description: {
              type: "string",
              example: "156screen 8GB RAM 512GB SSD",
            },
            date_created: {
              type: "string",
              format: "date",
              example: "2025-03-02",
            },
          },
        },
      },
    },
  },
  apis: ["./api.js"], 
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));



const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "PRODUCTS",
  password: "cheapertownhall",
  port: 5432,
});
db.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ Connection Error:", err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// GET product by ID
/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Get a product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */


app.get('/product/:id', (req, res) => {

  const productId = req.params.id;
  const query = 'SELECT * FROM product WHERE product_id = $1';
   db.query(query, [productId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const rows = results.rows;

    res.json(results.rows[0]);

  });
});





// POST a new product
/**
 * @swagger
 * /product:
 *   post:
 *     summary: Add a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */

// POST a new product
app.post('/product', (req, res) => {

  const { product_name, availability, price, short_description,date_created } = req.body;
  const query = 'INSERT INTO product (product_name, availability, price, short_description, date_created) VALUES ($1, $2, $3, $4, $5)';
  db.query(query, [product_name, availability, price, short_description,date_created], (err, results) => {
    if (err) {
      return res.status(500).json({ err });
    }
    res.status(201).json({ id: results.insertId, ...req.body });
  });
});

  


// PUT update an existing product
/**
 * @swagger
 * /product/{id}:
 *   put:
 *     summary: Update a product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */

// PUT update an existing product
app.put('/product/:id', (req, res) => {

  const productId = req.params.id;
  const { product_name, availability, price, short_description, } = req.body;
  const query = 'UPDATE product SET product_name = $1, availability = $2, price = $3, short_description = $4  WHERE product_id = $5';
  db.query(query, [product_name, availability, price, short_description, productId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ id: productId, ...req.body });
  });
});

// PATCH partially update an existing product
/**
 * @swagger
 * /product/{id}:
 *   patch:
 *     summary: Partially update a product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_name:
 *                 type: string
 *               availability:
 *                 type: string
 *                 enum: ["InStock", "OutOfStock"]
 *               price:
 *                 type: number
 *                 format: float
 *               short_description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product partially updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */



app.patch('/product/:id', (req, res) => {

  const productId = req.params.id;
  const updates = req.body;
  const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = Object.values(updates);
  const query = `UPDATE product SET ${fields} WHERE product_id = $${values.length + 1}`;
  db.query(query, [...values, productId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ id: productId, ...updates });
  });
});


// DELETE a product
/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */


app.delete('/product/:id', (req, res) => {

  const productId = req.params.id;
  const query = 'DELETE FROM product WHERE product_id = $1';
  db.query(query, [productId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.rowCount === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(204).send();
  });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


   