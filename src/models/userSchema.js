const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const roles = require('./roles')
//seperate role and req's
//create and soft delete request and by who in wich time
const UserSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: roles.enum,
        default: roles.value.User
        //should be array to can have more than one role (default)
    },
    roleRequest: {
        type: String,
        default: null
        //seperate table should keep that 
    },
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
    tourReservations: [{
        tourId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tour',
            required: true
        },
        reservationDate: {
            type: Date,
            default: Date.now
        }
    }],
    hotelReservations: [{
        hotelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hotel',
            required: true
        },
        reservationDate: {
            type: Date,
            default: Date.now
        }
    }],
    deletedAt:{
        type: Date,
        default: null
    },
    bannedAt:{
        type: Date,
        default: null
    },
    tokens:[{
        token:{
        type: String,
        required: true
        }
    }]
});

UserSchema.pre('save', async function(next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

UserSchema.statics.findByCredentials = async(email , password)=>{
    const user = await User.findOne({ email })
    if(!user){
        throw new Error('!user')
    }

    const isMatch=await bcrypt.compare(password , user.password)
    if(!isMatch){
        throw new Error('!isMatch')
    }
    return user
}

UserSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id:user._id.toString() }, 'this Is Secret Code')

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email, deletedAt: null });
  if (!user) {
    throw new Error('User not found');
  }
  if (user.bannedAt) {
    throw new Error('User is banned');
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  return user;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;