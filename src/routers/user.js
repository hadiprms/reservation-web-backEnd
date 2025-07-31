const express = require('express');
const User = require('../models/userSchema');
const auth = require('../authorization/authorization')

const router = express.Router();

router.get('/users/me' , auth , async (req, res) => {
    res.send(req.user);
});


module.exports = router;