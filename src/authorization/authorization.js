const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const JWTToken = process.env.JWTSecretCode;

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decode = jwt.verify(token, JWTToken);
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token });

        if (!user) {
            throw new Error();
        }

        req.token = token;      // Attach token for logout
        req.user = user;        // Attach full user document
        next();
    } catch (e) {
        res.status(401).send({ error: 'please authenticate' });
    }
};

module.exports = auth;