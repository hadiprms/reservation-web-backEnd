const mongoose = require('mongoose')

function arrayLimit(val) {
  return val.length <= 5;
}

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
    },
    images: {
        type: [String], // array of image URLs
        validate: [arrayLimit, '{PATH} exceeds the limit of 5 images']
    }
})

const Hotel = mongoose.model('Hotel' , HotelSchema)

module.exports = Hotel;