const express = require('express');
const User = require('../models/userSchema');
const auth = require('../authorization/authorization');
const checkAdmin = require('../authorization/checkRole');


const router = express.Router();

router.post('/banAccount/:id', auth, checkAdmin , async (req, res) => {
  const userId = req.params.id;
  const requesterId = req.user._id;

  try {
    const userToBan = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!userToBan || userToBan.deletedAt) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (requester.role === 'Admin' && userToBan.role === 'Admin') {
      return res.status(403).send({ error: 'Admins cannot ban other Owner or other Admins' });
    }

    // Check if the user is already banned
    if (userToBan.bannedAt) {
      return res.status(400).send({ error: 'User is already banned' });
    }

    await User.findByIdAndUpdate(userId, { bannedAt: new Date() });
    res.status(200).send({ message: 'User Banned successfully' });
  } catch (err) {
    res.status(500).send({ error: 'Failed to Ban' });
  }
});

router.post('/unbanAccount/:id', auth, checkAdmin , async (req, res) => {
  const userId = req.params.id;
  const requesterId = req.user._id;

  try {
    const userToBan = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!userToBan || userToBan.deletedAt) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (requester.role === 'Admin' && userToBan.role === 'Admin') {
      return res.status(403).send({ error: 'Admins cannot unban other Owner or other Admins' });
    }

    // Check if the user is not banned
    if (!userToBan.bannedAt) {
      return res.status(400).send({ error: 'User is not banned' });
    }

    await User.findByIdAndUpdate(userId, { bannedAt: null });
    res.status(200).send({ message: 'User unbanned successfully' });
  } catch (err) {
    res.status(500).send({ error: 'Failed to unban' });
  }
});

module.exports = router;