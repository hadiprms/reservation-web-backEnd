const express = require('express');
const User = require('../models/userSchema');
const auth = require('../authorization/authorization');
const RoleRequest = require('../models/roleRequestSchema');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email, deletedAt: null });
    if (existingUser) {
      return res.status(400).send({ error: 'Email is already in use' });
    }

    const { roleRequest, ...userData } = req.body; // extract roleRequest

    const user = new User({
      ...userData,
      roleRequest: roleRequest || null, // store request if any
    });

    const token = await user.generateAuthToken();

    await user.save();

    // If roleRequest is filled, create a RoleRequest document
    if (roleRequest) {
      const roleReqDoc = new RoleRequest({
        userId: user._id,
        roleRequest,
      });
      await roleReqDoc.save();
    }

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
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).send({ error: 'Failed to delete user' });
  }
});

module.exports = router;