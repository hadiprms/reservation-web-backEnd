require('dotenv').config({ path: __dirname + '/./.env' });
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const port = process.env.PORT;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Reservation API Swagger",
      version: "1.0.0",
      description: "API documentation for reservation",
    },
    servers: [
      {
        url: `http://localhost:${port}` //can add other url's for different api's in other url's
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "Bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routers/*.js"], // Path to your route files (* => selected all files)
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
