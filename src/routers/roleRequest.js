const express = require('express')
const auth = require('../authorization/authorization');
const User = require('../models/userSchema');
const { checkRole } = require('../authorization/checkRole');
const roles = require('../models/roles');
const roleStatus = require('../models/roleRequestStatus')
const RoleRequest = require('../models/roleRequestSchema');

const router = express.Router();

/**
 * @swagger
 * /role-requests:
 *   get:
 *     summary: Get's all role request's
 *     tags: [Role request]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All role request's found
 *       500:
 *         description: Server error
 */

router.get('/role-requests', async (req, res) => {
    try {
        const reqs = await RoleRequest.find({});
        res.send(reqs);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch reqs.' });
    }
});


/**
 * @swagger
 * /admin/approve-role-request/{id}:
 *   patch:
 *     summary: Approve role request
 *     tags: [Role request]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose requested role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: Approved
 *     responses:
 *       200:
 *         description: Successfully updated status
 *       400:
 *         description: invalid status
 *       500:
 *         description: Failed to process role request
 */

router.patch('/admin/approve-role-request/:id', auth, checkRole([roles.value.Admin, roles.value.SuperAdmin]), async (req, res) => {
  const roleRequestId = req.params.id;
  const { status } = req.body;

  if (!status || ![roleStatus.value.Approved, roleStatus.value.Rejected].includes(status)) {
    return res.status(400).send({ error: 'Invalid status. Must be "Approved" or "Rejected".' });
  }

  try {
    // Find the RoleRequest document by its ID
    const roleRequestDoc = await RoleRequest.findById(roleRequestId);

    if (!roleRequestDoc || roleRequestDoc.status !== roleStatus.value.Pending) {
      return res.status(404).send({ error: 'Role request not found or already processed' });
    }

    const userId = roleRequestDoc.userId;
    const roleToAssign = roleRequestDoc.roleRequest;
    // Find the user using userId
    const user = await User.findById(userId);

    if (!user || user.deletedAt) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Set status based on input
    roleRequestDoc.status = status;
    const adminId = req.user._id;
    roleRequestDoc.processedAt = new Date();
    roleRequestDoc.processedBy = adminId;
    
    const admin = roleRequestDoc.processedBy

    const adminInUser =await User.findById(admin)
    if(!adminInUser.role.includes('SuperAdmin') && roleToAssign ==='Admin'){
      return res.status(400).send({massage: 'you must be SuperAdmin for accepting this request'})
    }
    // Update user's role and reset roleRequest
    if(status === roleStatus.value.Approved){
      if (!user.role.includes(roleToAssign)) {
          user.role.push(roleToAssign);
          roleRequestDoc.status = roleStatus.value.Approved;
          res.send({ message: `User's role updated to ${roleToAssign} based on role request.` });
      }else{
          roleRequestDoc.status = roleStatus.value.Rejected;
          res.send({massage: `User role request Rejected because already have that role`})
      }
    }
    if(status ===roleStatus.value.Rejected){
      res.send({ message: `Role request rejected.` });
    }
    
    // delete roleRequest value from userSchema who approved or rejected
    user.roleRequest = user.roleRequest.filter(role => role !== roleRequestDoc.roleRequest);
    await user.save();




    await roleRequestDoc.save();
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Failed to process role request' });
  }
});

module.exports = router;