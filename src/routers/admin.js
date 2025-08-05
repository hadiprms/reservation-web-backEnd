const express = require('express');
const User = require('../models/userSchema');
const auth = require('../authorization/authorization');
const { checkRole } = require('../authorization/checkRole');

const router = express.Router();

router.post('/banAccount/:id', auth, checkRole(['SuperAdmin','Admin']) , async (req, res) => {
  const userId = req.params.id;
  const requesterId = req.user._id;

  try {
    const userToBan = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!userToBan || userToBan.deletedAt) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (requester.role === 'Admin' && (userToBan.role === 'Admin' || userToBan.role === 'SuperAdmin')) {
      return res.status(403).send({ error: `${requester.role} cannot ban ${userToBan.role}` });
    }

    // Check if the user is already banned
    if (userToBan.bannedAt) {
      return res.status(400).send({ error: `${userToBan.role} is already banned` });
    }

    await User.findByIdAndUpdate(userId, { bannedAt: new Date() });
    res.status(200).send({ message: `${userToBan.role} Banned successfully` });
  } catch (err) {
    res.status(500).send({ error: 'Failed to Ban' });
  }
});

router.post('/unbanAccount/:id', auth, checkRole(['SuperAdmin','Admin']) , async (req, res) => {
  const userId = req.params.id;
  const requesterId = req.user._id;

  try {
    const userToBan = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!userToBan || userToBan.deletedAt) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (requester.role === 'Admin' && (userToBan.role === 'Admin' || userToBan.role === 'SuperAdmin')) {
      return res.status(403).send({ error: `${requester.role} cannot unban ${userToBan.role}` });
    }

    // Check if the user is not banned
    if (!userToBan.bannedAt) {
      return res.status(400).send({ error: `${userToBan.role} is not banned` });
    }

    await User.findByIdAndUpdate(userId, { bannedAt: null });
    res.status(200).send({ message: `${userToBan.role} unbanned successfully` });
  } catch (err) {
    res.status(500).send({ error: 'Failed to unban' });
  }
});

router.patch('/admin/change-user-role/:id', auth, checkRole(['SuperAdmin','Admin']), async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  // Validate role
  const validRoles = ['Marketer', 'User'];
  if (!validRoles.includes(role)) {
    return res.status(400).send({ error: 'Invalid role' });
  }

  try {
    const user = await User.findById(userId);
    if (!user || user.deletedAt) {
      return res.status(404).send({ error: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.send({ message: `role updated successfully to ${role}` });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch('/superadmin/change-user-role/:id', auth, checkRole(['SuperAdmin']), async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  // Validate role
  const validRoles = ['Admin', 'Marketer', 'User'];
  if (!validRoles.includes(role)) {
    return res.status(400).send({ error: 'Invalid role' });
  }

  try {
    const user = await User.findById(userId);
    if (!user || user.deletedAt) {
      return res.status(404).send({ error: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.send({ message: `role updated successfully to ${role}` });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/admin/role-requests', async (req, res) => {
  try {
    const requests = await User.find({ roleRequest: { $ne: null } });
    res.send(requests);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch('/admin/approve-role-request/:id', auth, checkRole(['SuperAdmin' , 'Admin']), async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user || user.deletedAt) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (user.roleRequest) {
      // Update user's role to roleRequest and reset roleRequest
      user.role = user.roleRequest;
      user.roleRequest = null;
      await user.save();

      res.send({ message: `User's role updated to ${user.role} based on role request.` });
    } else {
      res.status(400).send({ error: 'No role request found for this user' });
    }
  } catch (err) {
    res.status(500).send({ error: 'Failed to process role request' });
  }
});

module.exports = router;