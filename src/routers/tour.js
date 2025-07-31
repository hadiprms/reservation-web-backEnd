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

module.exports = router;