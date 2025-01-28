require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;



app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5000"
    ],
    credentials: true,
  })
);
  // app.use(cors())
  app.use(express.json());
  app.use(cookieParser());
 

  const verifyToken = (req, res, next) => {
    console.log(req.cookies);
    const token = req.cookies.token;
    console.log("inside verify midle ware", token);
    if (!token) {
      return res.status(401).send({ Message: "Unauthorized Access" });
    }
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
      if (error) {
        return res.status(401).send({ message: "UnAutherized Access" });
      }
      req.user = decoded;
      next();
    });
  };
  
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
      const productsCollection = client.db("assets-management").collection("products")
      const requestedProductsCollection = client.db("assets-management").collection("requestedProducts")
      // !All post operation

      app.post("/users", async (req, res) => {
        console.log(req.headers.origin)
        const newUsers = req.body;
        const result = await userCollection.insertOne(newUsers);
        res.send(result);
      });

      app.post("/jwt", async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5h" });
        res
          .cookie("token", token, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production',
            secure: false,
          })
          .send({ success: true });
      });
      
      app.post("/logOut", (req, res) => {
        res
          .clearCookie("token", {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production',
            secure: false,
          })
          .send({ success: true });
      });
  

      app.post('/products',async(req,res)=>{
        const newProducts = req.body;
        const result = await productsCollection.insertOne(newProducts);
        res.send(result);
      })

      app.post('/requestedProducts',async(req,res)=>{
        const newProducts = req.body;
        const result = await requestedProductsCollection.insertOne(newProducts);
        res.send(result);
      })
      // ! All get operation
      app.get("/users", async (req, res) => {
        const cursor = userCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });

      app.get("/products", async (req, res) => {
        const cursor = productsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });

      app.get("/products", async (req, res) => {
        const productName = req.query.productName;
        const query = {productName: {$regex: productName, $options: 'i'},};
        console.log(productName,query);
        const result = await productsCollection.find(query).toArray()

        // const {inputValue} = req.query;
        // const result = await productsCollection.find({productName : {$regex : inputValue,$options : 'i'} }).toArray();

        res.send(result);
      });

      app.get("/requestedProducts", async (req, res) => {
        const cursor = requestedProductsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });
      

      app.get('/requestedProducts/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await requestedProductsCollection.findOne(query);
        res.send(result);
      })
      // ! put operatio

      app.patch('/requestedProducts/:id',async(req,res)=>{
        const id= req.params.id;
        try{

          const query = {_id : new ObjectId(id)}
          const updatedRequestedProducts = req.body;
        //   console.log('requested id :',query);
        // console.log('update',req.body);
          const updateProducts = await requestedProductsCollection.findOneAndUpdate(
            query,
            {$set : updatedRequestedProducts},
            {returnDocument : after}
          );
          console.log('updadedData',updateProducts)
          res.json({updateProducts});
        }
        catch(error){
          res.status(500).json({error : 'faild to aprrove'});
        }
      
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
  
  