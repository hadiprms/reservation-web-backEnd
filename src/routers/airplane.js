const express = require ('express')
const Airplane = require('../models/airplaneSchema')

const router = express.Router();

router.post('/air', async(req,res) =>{
    const airplane = new Airplane(req.body)
    try{
        await airplane.save()
        res.status(201).send(airplane)
    }catch(error){
        res.status(400).send(error)
    }
})

router.get('/fromAir', (req, res) => {
    res.send('From air.js');
});

module.exports = router;