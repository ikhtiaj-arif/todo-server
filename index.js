const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')



const app = express()
const port = process.env.PORT || 5000

//middlewares
app.use(cors())
app.use(express.json())



// verify user with JWT
function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized Access!')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(401).send('Unauthorized Access!')
        }
        req.decoded = decoded;
        next()
    })
}

//mongodb credentials
const uri = process.env.DB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try{
        const usersCollection = client.db('todo').collection('users')
        const todosCollection = client.db('todo').collection('todos')


    
// set or update user to database  
app.put('/users/:email', async(req, res)=>{
    const user = req.body;
    const email = req.params.email;
    const filter = { email: email };
    const option = { upsert: true};
    const updatedDoc = {
        $set: user 
    }
    const result = await usersCollection.updateOne(filter, updatedDoc, option);

    const token = jwt.sign(user, process.env.TOKEN_SECRET, {expiresIn: '1d'});
    console.log(result);
    res.send({user, token})
})
// get user
app.get('/users', async(req, res) => {
    const query = {role: null};
    const result = await usersCollection.find(query).toArray();
    res.send(result)
})

// post todos 
// verifyJWT,
app.post('/todo', async(req, res)=>{
    const todo = req.body;
    console.log(req.body);
    const result = await todosCollection.insertOne(todo);
    res.send(result)
})

// find todo by user email
// verifyJWT
app.get('/todos',  async(req, res)=> {
    const email = req.query.email;
    const query = {email: email};
    const result = await todosCollection.find(query).toArray();
    res.send(result)
})

// update todo by id
// verifyJWT,
app.put('/todo/:id',  async(req, res)=>{
    const id = req.params.id;
    const data = req.body;
    console.log(data);
    const filter = { _id: new ObjectId(id) };
    const option = { upsert: true };
    const updatedDoc = {
        $set: data
    }
    const result =await todosCollection.updateOne(filter, updatedDoc, option)
    res.send(result) 
})


// delete todo
// verifyJWT, 
app.delete('/todo/:id', async(req, res)=>{
    const id = req.params.id;
    const filter = { _id : new ObjectId(id)}
    const result = await todosCollection.deleteOne(filter)
    console.log(filter, result)
    res.send(result)
})





    } finally{

}
}
run().catch(e => console.dir(e))



app.get('/', (req, res) => {
    res.send('Server is running...')
})


app.listen(port, () => {
    console.log(`Server is running...on ${port}`)
  })
  