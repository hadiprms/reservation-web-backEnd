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
  const { roles: newRoles } = req.body; // Expect roles as an array

  if (!Array.isArray(newRoles) || newRoles.length === 0) {
    return res.status(400).send({ error: 'Roles must be a non-empty array' });
  }

  const validRoles = [roles.value.Marketer, roles.value.User];
  
  // Check if all roles are valid
  const invalidRoles = newRoles.filter(r => !validRoles.includes(r));
  if (invalidRoles.length > 0) {
    return res.status(400).send({ error: `Invalid roles: ${invalidRoles.join(', ')}` });
  }

  try {
    const user = await User.findById(userId);
    if (!user || user.deletedAt) {
      return res.status(404).send({ error: 'User not found' });
    }

    user.role = newRoles;
    await user.save();

    res.send({ message: `Role(s) updated successfully.` });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch('/superadmin/change-user-role/:id', auth, checkRole([roles.value.SuperAdmin]), async (req, res) => {
  const userId = req.params.id;
  const { roles: newRoles } = req.body; // Expect roles as an array

  // Validate roles array
  if (!Array.isArray(newRoles) || newRoles.length === 0) {
    return res.status(400).send({ error: 'Roles must be a non-empty array' });
  }

  const validRoles = [roles.value.Admin, roles.value.Marketer, roles.value.User];

  // Check if all roles are valid
  const invalidRoles = newRoles.filter(r => !validRoles.includes(r));
  if (invalidRoles.length > 0) {
    return res.status(400).send({ error: `Invalid roles: ${invalidRoles.join(', ')}` });
  }

  try {
    const user = await User.findById(userId);
    if (!user || user.deletedAt) {
      return res.status(404).send({ error: 'User not found' });
    }

    user.role = newRoles;
    await user.save();

    res.send({ message: `Role(s) updated successfully.` });
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

module.exports = router;