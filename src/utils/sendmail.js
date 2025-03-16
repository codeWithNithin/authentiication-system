const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.MAILTRAP_SENDEREMAIL || 'Nithin Kumar' + '<' + process.env.MAILTRAP_USERNAME + '>',// sender address
    to, // list of receivers
    subject: subject || "Verify your email", // Subject line
    text: text || `Please click on the following link: ${process.env.BASE_URL}/api/v1/users/verify/${token}` // plain text body
  }
  transporter.sendMail(mailOptions);
}

module.exports = sendEmail