const User = require('../models/userSchema');

const checkRole = (role) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
      if (user.role !== role) {
        return res.status(403).send({ error: `Access denied. ${role} role required.` });
      }
      next();
    } catch (error) {
      res.status(500).send({ error: 'Server error' });
    }
  };
};


module.exports =  { checkRole };