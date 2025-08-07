const express = require('express')
const Tour = require('../models/tourSchema');
const auth = require('../authorization/authorization');
const User = require('../models/userSchema');
const { checkRole } = require('../authorization/checkRole');
const roles = require('../models/roles');
const RoleRequest = require('../models/roleRequestSchema');

const router = express.Router();

router.get('/role-requests', async (req, res) => {
    try {
        const reqs = await RoleRequest.find({});
        res.send(reqs);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch reqs.' });
    }
});

module.exports = router;