const express=require('express')
const router=new express.Router()

app.post('/users', async (req,res) => {
    const user = new User(req.body)

    try{
        await user.save()
        res.status(201).send()
    } catch(e){
        res.status(400).send(e)
    }
})
router.get('/test', async(req,res)=>{
    res.send('From user.js')
})

module.exports=userRouter