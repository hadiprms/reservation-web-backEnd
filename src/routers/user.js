const express = require('express');
const User = require('../models/userSchema');
const auth = require('../authorization/authorization')

const router = express.Router();

router.get('/users/me' , auth , async (req , res) => {
    res.send(req.user);
});

router.patch('/edit/me/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['firstName', 'lastName' , 'password']
  const isValid = updates.every(update => allowedUpdates.includes(update))

  if (!isValid) {
    return res.status(400).send({ error: 'Invalid update' })
  }

  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).send()
    }

    for (let update of updates) {
      if (req.body[update] === user[update]) {
        return res.status(400).send({ error: `No change detected in ${update}` });
      }
    }

    updates.forEach(update => {
      user[update] = req.body[update]
    })


    await user.save()

    res.send(user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.get('/my-tourReservations', auth , async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('tourReservations.tourId');
    res.send(user.tourReservations);
});

module.exports = router;