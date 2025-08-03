const express = require('express');
const User = require('../models/userSchema');
const auth = require('../authorization/authorization');
const checkAdmin = require('../authorization/checkRole');


const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email, deletedAt: null });
    if (existingUser) {
      return res.status(400).send({ error: 'Email is already in use' });
    }

    const user = new User(req.body);
    const token = await user.generateAuthToken();
    await user.save();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/login' , async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email , req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    }catch(e){
        res.status(400).send({ error: e.message })
    }
})

router.post('/logout' , auth , async (req,res) =>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !==req.token
        })
        await req.user.save()
        res.send()
    }
    catch(e){
        res.status(500).send()
    }
})

router.post('/logoutAll' , auth , async (req,res) =>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){

    }
})

router.delete('/deleteAccount/:id', auth , async (req, res) => {
  const userId = req.params.id;
  //not with id
  try {
    await User.findByIdAndUpdate(userId, { deletedAt: new Date() });
    res.status(200).send({ message: 'User soft deleted successfully' });
  } catch (err) {
    res.status(500).send({ error: 'Failed to delete user' });
  }
});

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

module.exports = router;