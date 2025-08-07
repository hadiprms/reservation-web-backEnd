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
//if have that role reject
router.patch('/admin/approve-role-request/:id', auth, checkRole([roles.value.Admin, roles.value.SuperAdmin]), async (req, res) => {
  const roleRequestId = req.params.id;

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

    // Update user's role and reset roleRequest
    if (!user.role.includes(roleToAssign)) {
        user.role.push(roleToAssign);
        roleRequestDoc.status = 'Approved';
        res.send({ message: `User's role updated to ${roleToAssign} based on role request.` });
    }else{
        roleRequestDoc.status = 'Rejected';
        res.send({massage: `User role request Rejected because already have that role`})
    }
    user.roleRequest = null;
    await user.save();

    const adminId = req.user._id;
    roleRequestDoc.processedAt = new Date();
    roleRequestDoc.processedBy = adminId;
    await roleRequestDoc.save();
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Failed to process role request' });
  }
});

module.exports = router;