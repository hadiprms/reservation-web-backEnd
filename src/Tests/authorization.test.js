require('dotenv').config({ path: __dirname + '/../test.env' });
const request = require('supertest')
const app = require('../app')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../models/userSchema')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    email: "test456@gmail.com",
    lastName: "sflst",
    firstName: "ffirst",
    password: "ddd32sssss",
    role: "Marketer",
    tokens:[{
        token: jwt.sign({ _id: userOneId }, process.env.JWTSecretCode)
    }]
}
console.log(userOne.tokens)
beforeEach(async()=>{
    await User.deleteMany()
    await new User(userOne).save()
})

test('Should sign up new user', async () => {
    await request(app)
        .post('/signup')
        .send({
            email: "test46@gmail.com",
            lastName: "sflst",
            firstName: "ffirst",
            password: "ddd32sssss",
            role: "Marketer"
        })
        .expect(201)
})

test('should login exisiting user', async () => {
    await request(app)
        .post('/login')
        .send({
            email:userOne.email,
            password:userOne.password
        })
        .expect(200)
})

test('should login none-exisiting user', async () => {
    await request(app)
        .post('/login')
        .send({
            email:userOne.email,
            password:'wrongPassword'
        })
        .expect(400)
})