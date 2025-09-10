const mongoose = require('mongoose')

const HotelSchema = mongoose.Schema({
    hotelName:{
        type: String,
        required: true
    },
    adress:{
        type: String,
        required: true
    },
    pointOfUsers:{
        type: Number,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
        //for each day of staying (we should have do (exitTime-bookTime=price * x) )
    }
})

const Hotel = mongoose.model('Hotel' , HotelSchema)

module.exports = Hotel;