const express = require('express')
const Tour = require('../models/tourSchema');
const auth = require('../authorization/authorization');
const User = require('../models/userSchema');
const checkAdmin = require('../authorization/checkRole');

const router = express.Router();

router.post('/tour', auth , checkAdmin , async (req, res) => {
    try {
        const existingTour = await Tour.findOne(req.body);
        if (existingTour) {
            return res.status(400).send({ error: 'Tour with the same data already exists.' });
        }

        const tour = new Tour(req.body);
        await tour.save();
        res.status(201).send(tour);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/reserve-tour/:tourId', auth , async (req, res) => {
    const userId = req.user._id;
    const tourId = req.params.tourId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        user.tourReservations.push({ tourId });
        await user.save();

        res.send({ message: 'Reservation successful' });
    } catch (err) {
        res.status(500).send({ error: 'Error reserving tour' });
    }
});

router.get('/tours' , async (req , res) =>{
    try {
        const tours = await Tour.find({});
        res.send(tours);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch tours.' });
    }
})

module.exports = router;