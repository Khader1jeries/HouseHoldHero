function validateCreateMember(data, adminEmail) {
  const {
    email,
    DOB,
    countryCode,
    createdAt,
    firstName,
    lastName,
    password,
    phoneNumber,
  } = data;

  const nameRegex = /^[A-Za-z]+$/;
  const phoneRegex = /^\d+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  // Admin email check
  if (!adminEmail || !adminEmail.includes("@")) {
    return { valid: false, message: "adminEmail is required" };
  }

  // Email check
  if (!email || !email.includes("@")) {
    return { valid: false, message: "Valid member email is required" };
  }

  // First name
  if (!firstName || !nameRegex.test(firstName)) {
    return { valid: false, message: "First name must contain only letters" };
  }

  // Last name
  if (!lastName || !nameRegex.test(lastName)) {
    return { valid: false, message: "Last name must contain only letters" };
  }

  // Phone number
  if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
    return { valid: false, message: "Phone number must contain only digits" };
  }

  // Country code
  if (!countryCode || countryCode.length < 1) {
    return { valid: false, message: "Country code is required" };
  }

  // Date of Birth
  if (!DOB || isNaN(Date.parse(DOB))) {
    return { valid: false, message: "Valid date of birth is required" };
  }

  // CreatedAt
  if (!createdAt || isNaN(Date.parse(createdAt))) {
    return { valid: false, message: "Valid creation date is required" };
  }

  // Password
  if (!password || !passwordRegex.test(password)) {
    return {
      valid: false,
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol",
    };
  }

  return { valid: true };
}

module.exports = { validateCreateMember };
