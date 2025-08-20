const express = require('express');
const User = require('../models/userSchema');
const auth = require('../authorization/authorization');
const RoleRequest = require('../models/roleRequestSchema');

const router = express.Router();

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authorization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Email already in use
 */

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
    res.status(400).send({ error: error.message });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [Authorization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid credentials
 */

router.post('/login' , async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email , req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    }catch(e){
        res.status(400).send({ error: e.message })
    }
})

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout from current session
 *     tags: [Authorization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       500:
 *         description: Server error
 */


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
}) //log out and log out all route does not working well

/**
 * @swagger
 * /logoutAll:
 *   post:
 *     summary: Logout from all sessions
 *     tags: [Authorization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out from all sessions
 *       500:
 *         description: Server error
 */


router.post('/logoutAll' , auth , async (req,res) =>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){

    }
})

/**
 * @swagger
 * /deleteAccount/{id}:
 *   delete:
 *     summary: Soft delete a user account
 *     tags: [Authorization]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       500:
 *         description: Failed to delete user
 */


router.delete('/deleteAccount/:id', auth , async (req, res) => {
  const userId = req.params.id;

    // Check if the token belongs to the user with this id
  if (req.user._id.toString() !== userId) {
    return res.status(403).send({ error: 'Token is not for this user id' });
  }
  
  try {
        const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (user.deletedAt !== null) {
      return res.status(400).send({ error: 'User account already deleted' });
    }

    await User.findByIdAndUpdate(userId, { deletedAt: new Date() });
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).send({ error: 'Failed to delete user' });
  }
});

module.exports = router;