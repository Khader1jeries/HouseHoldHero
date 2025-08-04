const transporter = require("../utils/mailTransporter.util");
function generateVerificationCode(length = 4) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
async function sendVerificationEmail(email) {
  const code = generateVerificationCode();

  await transporter.sendMail({
    from: "khader.jeryes@gmail.com",
    to: email,
    subject: "Reset verification",
    text: `The verification code is: ${code}`,
  });

  return code;
}
module.exports = { sendVerificationEmail };
