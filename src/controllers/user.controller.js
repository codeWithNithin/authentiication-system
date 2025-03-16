const { User } = require("../models");
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const sendEmail = require("../utils/sendmail");

async function registerUser(req, res, next) {
  // get incming req
  const { name, email, password } = req.body;

  // check if the given requset is valid
  if (!name || !email || !password) {
    res.status(400).json({
      status: false,
      message: 'Please provide all the details'
    })
  }

  try {

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists'
      })
    }

    const user = await User.create({ name, email, password })

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'User not registered'
      })
    }

    const token = crypto.randomBytes(32).toString('hex')
    console.log('token', token)

    user.verificationToken = token;
    await user.save();

    sendEmail(user.email, "Verify your email", `Please click on the following link: ${process.env.BASE_URL}/api/v1/users/verify/${token}`)

    console.log(user)


    res.status(200).json({
      success: true,
      message: 'User registered successfully',
      data: user
    })

  } catch (err) {

  }


  // res.status(501).json({ success: false, message: 'ROUTE NOT DEFINED at ctrller!!!' })
}

async function verifyEmail(req, res, next) {
  const { token } = req.params;
  if (!token) {
    res.status(400).json({
      success: false,
      message: 'Invalid token'
    })
  }

  try {
    const existingUser = await User.findOne({ verificationToken: token })

    if (!existingUser) {
      res.status(400).json({
        success: false,
        message: 'Invalid token'
      })
    }

    existingUser.isVerified = true;
    existingUser.verificationToken = null;
    await existingUser.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    })

  } catch (err) {

  }

}

async function loginUser(req, res, next) {
  // 1. get incoming req
  const { email, password } = req.body;

  // 2. Validate incoming req
  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Please provide all the details'
    })
  }

  try {
    // 3. Check if user exists
    const existingUser = await User.findOne({ email })
    if (!existingUser) {
      res.status(400).json({
        success: false,
        message: 'User not registered!!!'
      })
    }

    if (!existingUser.isVerified) {
      res.status(400).json({
        success: false,
        message: 'Please verify your email'
      })
    }

    const isPasswordMatching = await bcrypt.compare(password, existingUser.password)

    if (!isPasswordMatching) {
      res.status(400).json({
        success: false,
        message: 'Incorrect password'
      })
    }

    // generate jwt token and send it in cookie

    const payload = {
      id: existingUser._id,
      name: existingUser.name,
      role: existingUser.role
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' })

    res.cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    })

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: existingUser
    })

  } catch (err) {

  }
}

async function getLoggedInUser(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'User does not exist!!!'
      })
    }

    res.status(200).json({
      success: true,
      message: 'current user details fetched sucessfully',
      data: user
    })
  } catch (err) {

  }

}

async function logout(req, res, next) {
  try {
    res.cookie('token', null, {
      expires: new Date(0),
      httpOnly: true
    })

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    })
  } catch (err) {

  }
}

async function forgotPassword(req, res, next) {
  // 1. get email from incoming req
  const { email } = req.body
  // 2. check if the user with that mail exists
  if (!email) {
    res.status(400).json({
      success: false,
      message: 'Please provide valid email'
    })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'User does not exist'
      })
    }
    // 3. generate reset token
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex')
    // 4. set resset pwd expires
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000 // 10 mins
    // 5. save user
    await user.save()
    // 6. send email
    sendEmail(email, 'reset password', `Please click on the following link: ${process.env.BASE_URL}/api/v1/users/reset-password/${user.resetPasswordToken}`)

    res.status(200).json({ success: true, message: 'Reset password link sent to your email' })
  } catch (err) {
    res.status(400).json({ success: false, message: 'Something went wrong' })
  }
}

async function resetPassword(req, res, next) {
  // 1. get token from incoming req
  const { token } = req.params
  const { password, confirmPassword } = req.body

  // 2. check if token is valid
  if (!token) {
    res.status(400).json({
      success: false,
      message: 'Please provide valid token'
    })
  }

  if (!password || !confirmPassword) {
    res.status(400).json({
      success: false,
      message: 'Please provide password and confirm password'

    })
  }

  if (password !== confirmPassword) {
    res.status(400).json({
      success: false,
      message: 'Password and confirm password does not match'
    })
  }

  try {
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Token is invalid or expired'
      })
    }

    user.password = password
    user.resetPasswordToken = ''
    user.resetPasswordExpires = ''
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    })

  } catch (err) {

  }
}


module.exports = { registerUser, verifyEmail, loginUser, getLoggedInUser, logout, forgotPassword, resetPassword }