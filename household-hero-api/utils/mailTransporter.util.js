// emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "khader.jeryes@gmail.com", // e.g., 'your_email@gmail.com'
<<<<<<< HEAD
    pass: "jbhdbxzcjnrtrijf", // use Gmail App Password
=======
    pass: "fxmwmjfozudmtdjt", // use Gmail App Password
>>>>>>> 25404cf2de5ec447f0f0129fc36c328f7eaf52e6
  },
});

module.exports = transporter;
