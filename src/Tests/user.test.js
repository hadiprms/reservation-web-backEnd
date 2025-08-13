const request = require('supertest')
const app = require('../app')
const User = require('../models/userSchema')
const Test = require('supertest/lib/test')

const userOne = {
    name:'Hadi',
    email:'test@gmail.com',
    password:'testpass'
}

test('Should sign up new user' , async() => {
    await request(app).post('/signup').send({
    "email": "test46@gmail.com",
    "lastName": "sflst",
    "firstName":"ffirst",
    "password":"ddd32sssss",
    "role":"Marketer"
    })
})