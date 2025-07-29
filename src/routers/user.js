const express = require('express');
const User = require('../models/usersShcema');

const router = express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        res.status(201).send(user);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get('/test', (req, res) => {
    res.send('From user.js');
});

module.exports = router;