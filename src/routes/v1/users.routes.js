const express = require('express');
const { userController } = require('../../controllers');
const isAuthenticated = require('../../middlewares/auth.middleware');
const userRouter = express.Router();

// /api/v1/users/register
userRouter.post('/register', userController.registerUser)

userRouter.get('/verify/:token', userController.verifyEmail)

userRouter.post('/login', userController.loginUser)

userRouter.get('/me', isAuthenticated, userController.getLoggedInUser)

userRouter.get('/logout', isAuthenticated, userController.logout)

userRouter.post('/forgot-password', userController.forgotPassword)

userRouter.post('/reset-password/:token', userController.resetPassword)


module.exports = userRouter