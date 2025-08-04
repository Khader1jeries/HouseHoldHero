// emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "khader.jeryes@gmail.com", // e.g., 'your_email@gmail.com'
    pass: "miaupwzatqppzsom", // use Gmail App Password
  },
});

module.exports = transporter;
