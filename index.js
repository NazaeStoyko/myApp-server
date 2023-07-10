const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { client } = require("./db");
const { ObjectId } = require("mongodb");
// require("mongodb");
const path = require("path");
const cl = require("./cloudinary.js")

const app = express();
const port = 3001;

const fs = require("fs")

const corsOptions = {
  origin: "https://gamepad-1.onrender.com",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const _phone_blank_img = "https://res.cloudinary.com/dxsbqj6z1/image/upload/v1687559052/smartphome/phones/phone_blank.png";



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

app.get("/products", (req, res) => {
  const { sort, filterMinPrice, filterMaxPrice } = req.query;
  const collection = client.db("server").collection("products");

  let filterOptions = {};
  if (filterMinPrice && filterMaxPrice) {
    filterOptions = {
      price: {
        $gte: parseInt(filterMinPrice), // Filter by minimum price
        $lte: parseInt(filterMaxPrice), // Filter by maximum price
      },
    };
  }

  let sortOption = {};
  if (sort === "lowest") {
    sortOption = { price: 1 }; // Sort by ascending price
  } else if (sort === "highest") {
    sortOption = { price: -1 }; // Sort by descending price
  }

  collection
    .find(filterOptions)
    .sort(sortOption)
    .toArray()
    .then((products) => {
      res.json(products);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    });
});


app.get("/products", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("server");
    const products = db.collection("products");
    const listOfProducts = await products.find({}).toArray();

    res.json(listOfProducts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/user", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("server");
    const users = db.collection("users");
    const admin = await users.findOne({ name: "Nazar" });

    res.json(admin);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/add_product", upload.single("photo"), async (req, res) => {
  try {
    const name = req.body.name;
    const price = req.body.price;
    await client.connect();
    const db = client.db("server");
    const products = db.collection("products");

    let imageUrl;
    if (!req.file) {
      imageUrl = _phone_blank_img;
    }
    else {
      imageUrl = await cl.uploadImage(req.file.path);
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error(err);
        }
        console.log('File deleted successfully');
      });
    }

    const insertedProduct = await products.insertOne({ name, price, imageUrl });

    res.json(insertedProduct);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




app.post("/delete_product", async (req, res) => {
  try {

    const id = req.body.id;

    await client.connect();
    const db = client.db("server");
    const products = db.collection("products");
    const deleted = await products.deleteOne({ _id: new ObjectId(id) });

    console.log(id)

    console.log(products)
    // if (data === null) {
    //   throw "no product with this id"
    // }
    // const imageLink = data.imageUrl;
    // if (imageLink === _phone_blank_img) {
    //   console.log("blank image, skipping...")
    // }
    // else {
    //   const public_id = getPublicIdFromLink(imageLink);
    //   console.log("deleting image with public_id: ", public_id);
    //   const delImageResponse = await cl.deleteImage(public_id);
    //   console.log("result of deleting the image:", delImageResponse);
    // }
    // const delDataResponse = await products.findByIdAndDelete(id);
    console.log("deleted.")
    res.sendStatus(200);

    // const deleted = await products.deleteOne({ _id: new ObjectId(id) });


  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function getPublicIdFromLink(link) {
  const pattern = new RegExp(`${cl.destFolder}/[a-zA-Z_0-9]+`);
  const execRes = pattern.exec(link);
  let public_id;
  if (execRes !== null) {
    public_id = pattern.exec(link)[0];
    return public_id;
  }
  else {
    throw "can't extract public_id from link";
  }
}

app.post("/product_update", async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});











