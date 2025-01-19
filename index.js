require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// app.use(
//     cors({
//       origin: [
//         "http://localhost:5173",
       
//       ],
//       credentials: true,
//     })
//   );
  app.use(cors())
  app.use(express.json());
 
// IlvKkoOVd2HLodCU
  
  // const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.tui29.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.tui29.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
  
  
  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // !All collection
      const userCollection = client.db("assets-management").collection("users");
      // !All post operation

      app.post("/users", async (req, res) => {
        console.log(req.headers.origin)
        const newUsers = req.body;
        const result = await userCollection.insertOne(newUsers);
        res.send(result);
      });
      // ! All get operation
      app.get("/users", async (req, res) => {
        const cursor = userCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run().catch(console.dir);
  app.get("/", (req, res) => {
    res.send("this is jobs portlar site");
  });
  
  app.listen(port, (req, res) => {
    console.log(`this is running port : ${port}`);
  });
  
  