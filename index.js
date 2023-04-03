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






app.get('/', (req, res) => {
    res.send('Server is running...')
})


app.listen(port, () => {
    console.log(`Server is running...on ${port}`)
  })
  