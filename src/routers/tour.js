const express = require('express')
const Tour = require('../models/tourSchema')

const router = express.Router();

router.post('/tours' , async (req,res) =>{
    const tour = new Tour(req.body)
    try{
        await tour.save()
        res.status(201).send(tour)
    }catch(error){
        res.status(400).send(error)
    }
})
router.get('/fromTour', (req, res) => {
    res.send('From tour.js');
});

module.exports = router;