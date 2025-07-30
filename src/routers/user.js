const express = require('express');
const User = require('../models/userSchema');

const router = express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    const token = await user.generateAuthToken()
    try {
        await user.save();
        res.status(201).send({user, token});
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/test', (req, res) => {
    res.send('From user.js');
});

module.exports = router;