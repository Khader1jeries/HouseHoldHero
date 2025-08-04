function validateRegister(data) {
  const {
    email,
    firstName,
    lastName,
    phoneNumber,
    countryCode,
    createdAt,
    password,
    DOB,
  } = data;
  const nameRegex = /^[A-Za-z]+$/;
  const phoneRegex = /^\d+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!email || !email.includes("@")) {
    return { valid: false, message: "Valid email is required " };
  }

  if (!firstName || !nameRegex.test(firstName)) {
    return { valid: false, message: "First name must contain only letters" };
  }

  if (!lastName || !nameRegex.test(lastName)) {
    return { valid: false, message: "Last name must contain only letters" };
  }

  if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
    return { valid: false, message: "Phone number must contain only digits" };
  }

  if (!countryCode || countryCode.length < 1) {
    return { valid: false, message: "Country code is required" };
  }

  // Date of Birth
  if (!DOB || isNaN(Date.parse(DOB))) {
    return { valid: false, message: "Valid date of birth is required" };
  }

  if (!createdAt || isNaN(Date.parse(createdAt))) {
    return { valid: false, message: "Valid creation date is required" };
  }

  if (!password || !passwordRegex.test(password)) {
    return {
      valid: false,
      message:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol",
    };
  }
  return { valid: true };
}
function validateResetPassword(data) {
  const { email, password } = data;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!email) {
    return { valid: false, message: "User not found" };
  }
  if (!password || !passwordRegex.test(password)) {
    return {
      valid: false,
      message:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol",
    };
  }
  return { valid: true };
}
module.exports = { validateRegister, validateResetPassword };
