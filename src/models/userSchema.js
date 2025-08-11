const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const roles = require('./roles')

const UserSchema = new mongoose.Schema({
    role: {
        type: [String],
        enum: roles.enum,
        default: [roles.value.User],
        validate: {
            validator: function(value) {
                // Ensure every role in array is within roles.enum
                return value.every(v => roles.enum.includes(v));
            },
            message: props => `${props.value} contains invalid role(s)`
        }
    },
    roleRequest: {
        type: [String],
        default: [null]

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

UserSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        if (user.password.length < 8 || user.password.length > 16) {
            return next(new Error('Password must be between 8 and 16 characters.'));
        }
        user.password = await bcrypt.hash(user.password, 8);
    }
    return next(); // only run if no error
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