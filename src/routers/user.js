const express = require('express');
const fs = require('fs');
const path = require('path');
const upload = require('../multer/uploadMiddleware');
const User = require('../models/userSchema');
const RoleRequest = require('../models/roleRequestSchema');
const auth = require('../authorization/authorization');

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
 *         multipart/form-data:
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
 *               profilePic:
 *                 type: string
 *                 format: binary
 *                 description: Upload a profile picture (jpeg, jpg, png)
 *     responses:
 *       200:
 *         description: Successfully updated user profile
 *       400:
 *         description: Invalid update or bad request
 *       403:
 *         description: Unauthorized to edit this user
 *       404:
 *         description: User not found
 */

router.patch('/edit/me/:id', auth, upload.single('profilePic'), async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'password', 'roleRequest'];

  // Remove 'roleRequest' from updates to handle separately
  const filteredUpdates = updates.filter(update => update !== 'roleRequest');

  const isValid = updates.every(update => allowedUpdates.includes(update));
  if (!isValid) {
    return res.status(400).send({ error: 'Invalid update' });
  }

  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).send({ error: 'You are not authorized to edit this user' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Handle uploaded profile picture
    if (req.file) {
      // If user already has a profile picture, delete the old one
      if (user.profilePic) {
        try {
          // Extract the filename from the full URL (e.g. http://localhost:5000/uploads/users/oldname.jpg)
          const oldFilename = path.basename(user.profilePic);
          const oldFilePath = path.join(__dirname, '../uploads/users', oldFilename);

          // Delete only if file exists
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (err) {
          console.error('Failed to delete old profile picture:', err.message);
        }
      }

      // Save new image path
      user.profilePic = `${baseUrl}/uploads/users/${req.file.filename}`;
    }

    // Handle roleRequest separately
    if (updates.includes('roleRequest') && req.body.roleRequest !== undefined) {
      const requestedRole = req.body.roleRequest;

      // Check if user already requested this role
      if (user.roleRequest.includes(requestedRole)) {
        return res.status(400).send({
          message: `You already requested for the role ${requestedRole}. The Admin team is analyzing your request.`,
        });
      }

      // Append the new roleRequest
      user.roleRequest.push(requestedRole);

      // Save into RoleRequest collection
      const newRoleReq = new RoleRequest({
        userId: user._id,
        roleRequest: requestedRole,
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
    res.status(400).send({ error: e.message });
  }
});

module.exports = router;