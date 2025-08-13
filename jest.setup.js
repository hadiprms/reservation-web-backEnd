const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
    path: path.resolve(
        __dirname,
        process.env.NODE_ENV === 'test' ? 'test.env' : '.env'
    )
});
