const express = require('express');
require('./db/mongoose'); // DB connection

const userRouter = require('./routers/user');
const tourRouter = require('./routers/tour');
const hotelRouter = require('./routers/hotel');
const authorizationRouter = require('./routers/authorization');
const adminRouter = require('./routers/admin');
const roleRequestRouter = require('./routers/roleRequest');

const app = express();
app.use(express.json());

// Routers
app.use(userRouter);
app.use(tourRouter);
app.use(hotelRouter);
app.use(authorizationRouter);
app.use(adminRouter);
app.use(roleRequestRouter);

module.exports = app;
