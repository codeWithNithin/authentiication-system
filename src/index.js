const express = require('express');

require('dotenv').config();
const { port } = require('./config/server.config');
const apiRouter = require('./routes');
const connectDB = require('./config/db.config');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// /api
app.use('/api', apiRouter)


const PORT = port;

app.listen(PORT, () => {
  console.log(`server listening to port: ${PORT}`)
  connectDB();
})