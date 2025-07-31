const mongoose = require('mongoose');

const TourSchema = new mongoose.Schema({
    companyName:{
        type: String,
        required: true
    },
    origin:{
        type: String,
        required: true
    },
    destination:{
        type: String,
        required: true
    },
    timeToGo:{
        type: Date,
        required: true
    },
    timeToBack:{
        type: Date,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    capacity:{
        type: Number,
        required: true
    }
})

const Tour = mongoose.model('Tour',TourSchema)

module.exports = Tour;