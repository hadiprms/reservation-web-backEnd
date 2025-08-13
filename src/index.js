require('dotenv').config({ path: __dirname + '/../.env' });
const app = require('./app');

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
