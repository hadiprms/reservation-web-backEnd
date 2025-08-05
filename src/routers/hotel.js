const express = require('express')
const Hotel = require('../models/hotelSchema');
const User = require('../models/userSchema');
const auth = require('../authorization/authorization');
const { checkRole } = require('../authorization/checkRole');

const router = express.Router()

router.post('/hotel', auth , checkRole('Admin') , async (req, res) => {
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

router.post('/reserve-hotel/:hotelId', auth , async (req, res) => {
    const userId = req.user._id;
    const hotelId = req.params.hotelId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        user.hotelReservations.push({ hotelId });
        await user.save();

        res.send({ message: 'Reservation successful' });
    } catch (err) {
        res.status(500).send({ error: 'Error reserving tour' });
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