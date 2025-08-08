const express = require('express')
const auth = require('../authorization/authorization');
const User = require('../models/userSchema');
const { checkRole } = require('../authorization/checkRole');
const roles = require('../models/roles');
const RoleRequest = require('../models/roleRequestSchema');

const router = express.Router();

router.get('/role-requests', async (req, res) => {
    try {
        const reqs = await RoleRequest.find({});
        res.send(reqs);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch reqs.' });
    }
});

router.patch('/admin/approve-role-request/:id', auth, checkRole([roles.value.Admin, roles.value.SuperAdmin]), async (req, res) => {
  const roleRequestId = req.params.id;
  const { status } = req.body;

  if (!status || !['Approved', 'Rejected'].includes(status)) {
    return res.status(400).send({ error: 'Invalid status. Must be "Approved" or "Rejected".' });
  }

  try {
    // Find the RoleRequest document by its ID
    const roleRequestDoc = await RoleRequest.findById(roleRequestId);

    if (!roleRequestDoc || roleRequestDoc.status !== 'Pending') {
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
    //be processedBy inja bade in code dastresi darim

    const adminInUser =await User.findById(admin)
    if(!adminInUser.role.includes('SuperAdmin') && roleToAssign ==='Admin'){
      return res.status(400).send({massage: 'you must be SuperAdmin for accepting this request'})
    }
    // Update user's role and reset roleRequest
    if(status === 'Approved'){
      if (!user.role.includes(roleToAssign)) {
          user.role.push(roleToAssign);
          roleRequestDoc.status = 'Approved';
          res.send({ message: `User's role updated to ${roleToAssign} based on role request.` });
      }else{
          roleRequestDoc.status = 'Rejected';
          res.send({massage: `User role request Rejected because already have that role`})
      }
    }
    if(status ==='Rejected'){
      res.send({ message: `Role request rejected.` });
    }
    
    // delete roleRequest value from userSchema who approved or rejected
    user.roleRequest = user.roleRequest.filter(role => role !== roleRequestDoc.roleRequest);
    await user.save(); // mitan dakhel if kard --> user ke req dade ro save mikne




    await roleRequestDoc.save();
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Failed to process role request' });
  }
});

module.exports = router;