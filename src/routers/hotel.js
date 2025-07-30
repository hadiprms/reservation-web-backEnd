const express = require('express')
const Hotel = require('../models/hotelSchema')

const router = express.Router()

router.post('/hotel', async(req,res) =>{
    const hotel = new Hotel(req.body)
    try{
        await hotel.save()
        res.status(201).send(hotel)
    }catch(error){
        res.status(400).send(error)
    }
})

router.get('/fromHotel', (req, res) => {
    res.send('From hotel.js');
});

module.exports=router;