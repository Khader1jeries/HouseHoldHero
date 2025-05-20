// test-member.js - Test script for member creation
const axios = require("axios");

// Replace with your actual family ID
const familyId = "your-family-id";

// Test data
const memberData = {
  familyId: familyId,
  firstName: "Test",
  lastName: "User",
  fullName: "Test User", // Explicitly include fullName
  email: "test@example.com",
  phone: "+972 55-555-5555",
  password: "password123",
  role: "member",
  profileImage: "assets/profile_pic.png",
  age: 30,
};

// Make the API call
async function testCreateMember() {
  try {
    console.log("Sending member data:", memberData);

    const response = await axios.post(
      "http://localhost:3000/api/members",
      memberData
    );

    console.log("Response status:", response.status);
    console.log("Response data:", response.data);
  } catch (error) {
    console.error("Error creating member:");
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
    }
  }
}

// Run the test
testCreateMember();
