// emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,            
  secure: false,         
  auth: {
    user: "khader.jeryes@gmail.com",
    pass: "fbjmgtoxqgrfesez", 
  },
  requireTLS: true,       
  tls: { servername: "smtp.gmail.com", minVersion: "TLSv1.2" },
  connectionTimeout: 15000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
});

module.exports = transporter;
