const express = require('express');
const User = require('../models/userSchema');
const auth = require('../authorization/authorization')

const router = express.Router();

router.post('/user/signup', async (req, res) => {
    const user = new User(req.body)
    const token = await user.generateAuthToken()
    try {
        await user.save();
        res.status(201).send({user, token});
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
});

module.exports = router;