const request = require('supertest')
const app = require('../app')
const User = require('../models/userSchema')

const userOne = {
    email: "test456@gmail.com",
    lastName: "sflst",
    firstName: "ffirst",
    password: "ddd32sssss",
    role: "Marketer"
}

beforeEach(async()=>{
    await User.deleteMany()
    await new User(userOne).save()
})

test('Should sign up new user', async () => {
    await request(app)
        .post('/signup')
        .send(userOne)
})

test('should login exisiting user', async () => {
    await request(app)
        .post('/login')
        .send({
            email:userOne.email,
            password:userOne.password
        })
})