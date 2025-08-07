const express = require('express');
const User = require('../models/userSchema');
const auth = require('../authorization/authorization');
const { checkRole } = require('../authorization/checkRole');
const roles = require('../models/roles');
const RoleRequest = require('../models/roleRequestSchema');

const router = express.Router();

router.post('/banAccount/:id', auth, checkRole([roles.value.Admin, roles.value.SuperAdmin]) , async (req, res) => {
  const userId = req.params.id;
  const requesterId = req.user._id;

  try {
    const userToBan = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!userToBan || userToBan.deletedAt) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (requester.role === roles.value.Admin && (userToBan.role === roles.value.Admin || userToBan.role === roles.value.SuperAdmin)) {
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

router.post('/unbanAccount/:id', auth, checkRole([roles.value.Admin, roles.value.SuperAdmin]) , async (req, res) => {
  const userId = req.params.id;
  const requesterId = req.user._id;

  try {
    const userToBan = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!userToBan || userToBan.deletedAt) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (requester.role === roles.value.Admin && (userToBan.role === roles.value.Admin || userToBan.role === roles.value.SuperAdmin)) {
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

router.patch('/admin/change-user-role/:id', auth, checkRole([roles.value.Admin, roles.value.SuperAdmin]), async (req, res) => {
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

router.patch('/superadmin/change-user-role/:id', auth, checkRole([roles.value.SuperAdmin]), async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  // Validate role
  const validRoles = [roles.value.Admin, roles.value.Marketer, roles.value.User];
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

router.patch('/admin/approve-role-request/:id', auth, checkRole([roles.value.Admin, roles.value.SuperAdmin]), async (req, res) => {
  const roleRequestId = req.params.id;

  try {
    // Find the RoleRequest document by its ID
    const roleRequestDoc = await RoleRequest.findById(roleRequestId);

    if (!roleRequestDoc || roleRequestDoc.status !== 'Pending') {
      return res.status(404).send({ error: 'Role request not found or already processed' });
    }

    const userId = roleRequestDoc.userId;
    const roleToAssign = roleRequestDoc.roleRequest;

    // Find the user using userId
    const user = await User.findById(userId);

    if (!user || user.deletedAt) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Update user's role and reset roleRequest
    user.role = [roleToAssign];
    user.roleRequest = null;
    await user.save();

    // Update the RoleRequest document's status to Approved
    roleRequestDoc.status = 'Approved';
    roleRequestDoc.processedAt = new Date();
    await roleRequestDoc.save();

    res.send({ message: `User's role updated to ${roleToAssign} based on role request.` });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Failed to process role request' });
  }
});

module.exports = router;