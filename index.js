const express = require("express");
const cors = require("cors");
const { client } = require("./db");
const { ObjectId } = require("mongodb");

const app = express();
const port = 3001;

const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/products", async (req, res) => {
  await client.connect();
  const db = client.db("server");
  const products = db.collection("products");
  const listOfProducts = await products.find().toArray();

  res.json(listOfProducts);
});

app.get("/user", async (req, res) => {
  await client.connect();
  const db = client.db("server");
  const users = db.collection("users");
  const admin = await users.findOne({ name: "Nazar" });

  res.json(admin);
});

app.post("/add_product", async (req, res) => {
  const name = req.body.name;
  const price = req.body.price;

  await client.connect();
  const db = client.db("server");
  const products = db.collection("products");

  const insertedProduct = await products.insertOne({ name, price });

  res.json(insertedProduct);
});

app.post("/delete_product", async (req, res) => {
  const id = req.body.id;

  await client.connect();
  const db = client.db("server");
  const products = db.collection("products");

  const deleted = await products.deleteOne({ _id: new ObjectId(id) });
  console.log({ deleted });
  res.json(deleted);
});

app.post("/product_update", async (req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  const price = req.body.price;

  await client.connect();
  const db = client.db("server");
  const products = db.collection("products");

  const updatedProduct = await products.updateOne(
    { _id: new ObjectId(id) },

    { $set: { name, price } }
  );

  res.json(updatedProduct);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
