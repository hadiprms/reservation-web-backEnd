const express = require('express');
const User = require('../models/userSchema');
const RoleRequest = require('../models/roleRequestSchema');
const auth = require('../authorization/authorization')

const router = express.Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get's user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile found
 *       500:
 *         description: Server error
 */

router.get('/users/me' , auth , async (req , res) => {
    res.send(req.user);
});


/**
 * @swagger
 * /my-tourReservations:
 *   get:
 *     summary: Get's all tour reservation's
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All reservation's found
 *       500:
 *         description: Server error
 */

router.get('/my-tourReservations', auth , async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('tourReservations.tourId');
    res.send(user.tourReservations);
});


/**
 * @swagger
 * /my-hotelReservations:
 *   get:
 *     summary: Get's all hotel reservation's
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All reservation's found
 *       500:
 *         description: Server error
 */

router.get('/my-hotelReservations', auth , async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('hotelReservations.hotelId');
    res.send(user.hotelReservations);
});


/**
 * @swagger
 * /edit/me/{id}:
 *   patch:
 *     summary: Edit user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Sara
 *               lastName:
 *                 type: string
 *                 example: Riya
 *               password:
 *                 type: string
 *                 example: 12345678
 *               roleRequest:
 *                 type: string
 *                 example: Marketer
 *     responses:
 *       200:
 *         description: Successfully changed
 *       400:
 *         description: invalid update
 */

router.patch('/edit/me/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'password', 'roleRequest'];

  // Remove 'roleRequest' from updates to handle separately
  const filteredUpdates = updates.filter(update => update !== 'roleRequest');

  const isValid = updates.every(update => allowedUpdates.includes(update));

  if (!isValid) {
    return res.status(400).send({ error: 'Invalid update' });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send();
    }

    //this Function is for passing roleRequest to new table
    // Check if roleRequest is being updated
    if (updates.includes('roleRequest') && req.body.roleRequest !== undefined) {
      // Append the new roleRequest to the existing array
      user.roleRequest.push(req.body.roleRequest);

      // Save the new RoleRequest document
      const newRoleReq = new RoleRequest({
        userId: user._id,
        roleRequest: req.body.roleRequest,
      });
      await newRoleReq.save();
    }

    // Check for no change in other fields
    for (let update of filteredUpdates) {
      if (req.body[update] === user[update]) {
        return res.status(400).send({ error: `No change detected in ${update}` });
      }
    }

    // Apply updates for other fields
    filteredUpdates.forEach(update => {
      user[update] = req.body[update];
    });

    await user.save();

    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;