const express = require('express');
const User = require('../models/userSchema');
const auth = require('../authorization/authorization');
const { checkRole } = require('../authorization/checkRole');
const roles = require('../models/roles');

const router = express.Router();

/**
 * @swagger
 * /admin/role-requests:
 *   get:
 *     summary: Get's all role request's
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All request's found
 *       500:
 *         description: Server error
 */

router.get('/admin/role-requests', auth, checkRole([roles.value.Admin, roles.value.SuperAdmin]), async (req, res) => {
  try {
    const requests = await User.find({ roleRequest: { $ne: null } });
    res.send(requests);
  } catch (error) {
    res.status(500).send(error);
  }
});


/**
 * @swagger
 * /banAccount/{id}:
 *   post:
 *     summary: Ban an account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to ban
 *     responses:
 *       200:
 *         description: Successfully banned user
 *       500:
 *         description: Failed to ban
 *       400:
 *         description: Already banned
 *       403:
 *         description: cannot ban this user
 */

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
    
  // Ban + invalidate all tokens (force logout)
    await User.findByIdAndUpdate(userId, {
      bannedAt: new Date(),
      tokens: [] // <- removes all active JWTs
     });

    res.status(200).send({ message: `${userToBan.role} Banned successfully` });
  } catch (err) {
    res.status(500).send({ error: 'Failed to Ban' });
  }
});


/**
 * @swagger
 * /unbanAccount/{id}:
 *   post:
 *     summary: Unban an account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to unban
 *     responses:
 *       200:
 *         description: Successfully unbanned user
 *       500:
 *         description: Failed to unban
 *       400:
 *         description: User is not banned
 *       403:
 *         description: cannot unban this user
 */

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


/**
 * @swagger
 * /admin/change-user-role/{id}:
 *   patch:
 *     summary: Change the user role (without having role request)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose role is being updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roles
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Marketer, User]
 *                 example: ["User"]
 *     responses:
 *       200:
 *         description: Successfully changed
 *       400:
 *         description: invalid role
 *       403:
 *         description: user role changed
 */

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

/**
 * @swagger
 * /superadmin/change-user-role/{id}:
 *   patch:
 *     summary: Change the user role (without having role request)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose role is being updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roles
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Marketer, User, Admin]
 *                 example: ["Admin"]
 *     responses:
 *       200:
 *         description: Successfully changed
 *       400:
 *         description: invalid role
 *       403:
 *         description: user role changed
 */

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

module.exports = router;