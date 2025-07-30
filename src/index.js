const express = require('express');
const jwt=require('jsonwebtoken')
require('./db/mongoose');
const userRouter = require('./routers/user');

const app = express();
const port = 3000;

app.use(express.json());
app.use(userRouter);

app.listen(port, () => {
    console.log('Listening on port', port);
});

const jwtFunction = async => {
    const token = jwt.sign({_id:''}, 'this Is Secret Code' , {expiresIn: '2 weeks'})
    const data = jwt.verify(token, 'this Is Secret Code')
}
jwtFunction()