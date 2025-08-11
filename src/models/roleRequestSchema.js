const mongoose = require('mongoose');
const roleStatus = require('../models/roleRequestStatus')

const RoleRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roleRequest: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: roleStatus.enum,
        default: roleStatus.value.Pending
    },
    processedAt: {
        type: Date,
        default: null
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const RoleRequest = mongoose.model('RoleRequest', RoleRequestSchema);

module.exports = RoleRequest;