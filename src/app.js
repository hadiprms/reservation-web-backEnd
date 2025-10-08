const express = require('express');
const path = require('path');
require('./db/mongoose'); // DB connection
const cors = require('cors');

const userRouter = require('./routers/user');
const tourRouter = require('./routers/tour');
const hotelRouter = require('./routers/hotel');
const authorizationRouter = require('./routers/authorization');
const adminRouter = require('./routers/admin');
const roleRequestRouter = require('./routers/roleRequest');
const { swaggerUi, swaggerSpec } = require('../swagger');

const app = express();

// Enable CORS for frontend origin
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routers
app.use(userRouter);
app.use(tourRouter);
app.use(hotelRouter);
app.use(authorizationRouter);
app.use(adminRouter);
app.use(roleRequestRouter);

// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;
