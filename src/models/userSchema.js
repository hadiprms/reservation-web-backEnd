const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        trim: true
    },
    lastName:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error ('Email is not valid')
            }
        }
    },
    password:{
        type: String,
        required: true
        //set min and max length
    },
    reservations:[{
        //must fill later
    }],
    tokens:[{
        token:{
        type: String,
        required: true
        }
    }]
});

UserSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id:user._id.toString() }, 'this Is Secret Code')

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

const User = mongoose.model('User', UserSchema);

module.exports = User;