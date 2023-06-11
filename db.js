const { MongoClient } = require("mongodb");
const url = "mongodb+srv://dbUser:qwerty123@cluster0.6epuscq.mongodb.net/";
const client = new MongoClient(url);
const dbName = "server";

async function main() {
  // Use connect method to connect to the server
  await client.connect();
}

module.exports = {
  main,
  client,
};
