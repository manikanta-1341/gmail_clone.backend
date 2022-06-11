const express = require('express')
const connection = require('./shared/connect')
const authRoute = require('./routes/authenticate')
const dotenv = require('dotenv')
const cors = require('cors')
const app =express()

dotenv.config()
connection.connect()
app.use(express.json())
app.use(cors())

app.use('/',(req,res,next)=>{
  next();
})

app.use('/',authRoute)


app.listen(process.env.PORT || 8002)