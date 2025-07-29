const express= require('express')
require('./db/mongoose')
const User=require('./models/usersShcema')
const userRouter=require('./routers/user')

const app=express()
const port= 3000

app.use(express.json())
app.use(userRouter)

app.listen(port,()=>{
    console.log('listening on', port)
})