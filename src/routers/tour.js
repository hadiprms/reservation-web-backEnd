const express = require('express')
const Tour = require('../models/tourSchema')

const router = express.Router();

router.post('/tour', async (req, res) => {
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

router.get('/tours' , async (req , res) =>{
    try {
        const tours = await Tour.find({});
        res.send(tours);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch tours.' });
    }
})

module.exports = router;