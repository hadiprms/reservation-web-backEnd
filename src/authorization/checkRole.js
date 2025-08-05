const User = require('../models/userSchema');

const checkRole = (roles) => {
  // roles should be an array of allowed roles
  return async (req, res, next) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
      
      // Check if user role is in the permissible roles array
      if (!roles.includes(user.role)) {
        return res.status(403).send({ error: `Access denied. Requires one of: ${roles.join(', ')}` });
      }
      
      next();
      
    } catch (error) {
      res.status(500).send({ error: 'Server error' });
    }
  };
};


module.exports =  { checkRole };