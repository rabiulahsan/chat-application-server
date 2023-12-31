const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


//server creation
const http = require('http');
const server = http.createServer(app);

//coonnect localhost to socket io
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
  },
});




//socket io connection and code
io.on('connection', (socket) => {

  // if connecting then message 
  console.log('a user connected');

 //send message
 socket.on("send_message", (message) => {
  console.log( message);
  socket.broadcast.emit('receive_message', message)
});

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9ylecqg.mongodb.net/?retryWrites=true&w=majority`;
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


    //database collection
    const usersCollection = client.db("mychat").collection("users");

//get users
app.get('/users', async(req, res)=>{
  const result = await usersCollection.find().toArray();
    res.send(result);
})


//post users
    app.post('/users', async(req, res)=>{
      const user = req.body;
          const query = { email: user.email }
          const exist = await usersCollection.findOne(query);
    
          if (exist) {
            return res.send({ message: 'user already exists' })
          }
    
          const result = await usersCollection.insertOne(user);
          res.send(result);
    })

     //get specific user by id
     app.get("/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
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

//test
app.get('/', (req, res) => {
    res.send('Running')
  })
  
  app.listen(port, () => {
    console.log(`Running on port ${port}`);
  })