require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const jwt = require('jsonwebtoken');
require('./db/mongoose');
const userRouter = require('./routers/user');
const tourRouter = require('./routers/tour');
const hotelRouter = require('./routers/hotel');
const authorizationRouter = require('./routers/authorization');
const adminRouter = require('./routers/admin');
const roleRequestRouter = require('./routers/roleRequest');

const app = express();
const port = process.env.PORT;
const JWTSecretCode = process.env.JWTSecretCode
app.use(express.json());
app.use(userRouter);
app.use(tourRouter);
app.use(hotelRouter);
app.use(authorizationRouter);
app.use(adminRouter);
app.use(roleRequestRouter);

app.listen(port, () => {
    console.log('Listening on port', port);
});

const jwtFunction = async () => {
    const token = jwt.sign({ _id: '' }, JWTSecretCode, { expiresIn: '2 weeks' });
    const data = jwt.verify(token, JWTSecretCode);
};
jwtFunction();
