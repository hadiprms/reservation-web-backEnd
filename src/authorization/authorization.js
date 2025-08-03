const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decode = jwt.verify(token, 'this Is Secret Code');
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token });

        if (!user) {
            throw new Error();
        }

        // Attach user info including role to request
        req.user = {
            _id: user._id,
            role: decode.role
        };
        next();
    } catch (e) {
        res.status(401).send({ error: 'please authenticate' });
    }
};

module.exports = auth;