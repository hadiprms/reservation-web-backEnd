const express = require('express')
const Hotel = require('../models/hotelSchema')

const router = express.Router()

router.post('/hotel', async (req, res) => {
    try {
        const existingHotel = await Hotel.findOne(req.body);
        if (existingHotel) {
            return res.status(400).send({ error: 'Hotel with the same data already exists.' });
        }

        const hotel = new Hotel(req.body);
        await hotel.save();
        res.status(201).send(hotel);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/hotels' , async (req , res) =>{
    try {
        const hotels = await Hotel.find({});
        res.send(hotels);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch hotels.' });
    }
})

module.exports=router;