const express = require('express');
const User = require('../models/userSchema');
const RoleRequest = require('../models/roleRequestSchema');
const auth = require('../authorization/authorization')

const router = express.Router();

router.get('/users/me' , auth , async (req , res) => {
    res.send(req.user);
});

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

router.get('/my-tourReservations', auth , async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('tourReservations.tourId');
    res.send(user.tourReservations);
});

router.get('/my-hotelReservations', auth , async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('hotelReservations.hotelId');
    res.send(user.hotelReservations);
});

module.exports = router;