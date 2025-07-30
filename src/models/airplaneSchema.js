const mongoose = require('mongoose')

const AirplaneSchema = new mongoose.Schema({
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
    ID:{
        type: Number,
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

const Airplane = mongoose.model('Airplane' , AirplaneSchema)

module.exports = Airplane