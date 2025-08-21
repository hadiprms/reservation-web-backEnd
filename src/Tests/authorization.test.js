require('dotenv').config({ path: __dirname + '/../test.env' });
const request = require('supertest')
const app = require('../app')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../models/userSchema')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    email: "test456@gmail.com",
    lastName: "sflst",
    firstName: "ffirst",
    password: "ddd32sssss",
    role: "Marketer",
    tokens:[{
        token: jwt.sign({ _id: userOneId }, process.env.JWTTestSecretCode)
    }]
}

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

test('should not login none-exisiting user', async () => {
    await request(app)
        .post('/login')
        .send({
            email:userOne.email,
            password:'wrongPassword'
        })
        .expect(400)
})

test('should not logout unauthenticated user', async () => {
    await request(app)
        .post('/logout')
        .send()
        .expect(401)
})


test('Should logoutAll and clear all tokens', async () => {
  await request(app)
    .post('/logoutAll')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.tokens.length).toBe(0);
});

test('Should soft delete account', async () => {
  await request(app)
    .delete(`/deleteAccount/${userOneId}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.deletedAt).not.toBeNull();
});