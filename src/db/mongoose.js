const mongoose=require('mongoose')
require('dotenv').config({ path: __dirname + '/../.env' });

const mongodbDataBase = process.env.mongodbDataBase
mongoose.connect(mongodbDataBase).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});