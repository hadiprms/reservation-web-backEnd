const User = require('../models/userSchema');

const checkAdmin = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        if (user.role !== 'Admin') {
            return res.status(403).send({ error: 'Access denied. Admins only.' });
        }
        next();
    } catch (error) {
        res.status(500).send({ error: 'Server error' });
    }
};

module.exports = checkAdmin;