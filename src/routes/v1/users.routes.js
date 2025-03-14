const express = require('express');
const { userController } = require('../../controllers');
const userRouter = express.Router();

// /api/v1/users/register
userRouter.use('/register', userController.registerUser)

module.exports = userRouter