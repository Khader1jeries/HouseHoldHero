// create-family-manual.js
// Run this script with: node create-family-manual.js

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Get Firestore database instance
const db = admin.firestore();

async function createTestFamily() {
  try {
    console.log("Starting manual family creation script...");

    // Check if families collection exists
    const collections = await db.listCollections();
    const collectionNames = collections.map((col) => col.id);
    console.log("Existing collections:", collectionNames);

    // Get all users
    const usersSnapshot = await db.collection("users").get();

    if (usersSnapshot.empty) {
      console.log(
        "No users found in the database. Please register a user first."
      );
      process.exit(1);
    }

    // Get the first user as admin
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    console.log("Selected user for family admin:", {
      id: userId,
      email: userData.email,
      name: userData.fullName || `${userData.firstName} ${userData.lastName}`,
    });

    // Create family name
    const familyName = userData.lastName
      ? `${userData.lastName} Family`
      : "Test Family";

    // Create the family document
    const familyData = {
      name: familyName,
      admin: userId,
      members: [userId],
      createdAt: new Date(), // Using standard JavaScript Date
    };

    console.log("Creating family with data:", familyData);

    // Add the family to Firestore
    const familyRef = await db.collection("families").add(familyData);
    console.log("Family created successfully with ID:", familyRef.id);

    // Update the user with family info
    await db.collection("users").doc(userId).update({
      familyId: familyRef.id,
      role: "admin",
    });

    console.log("User updated with family information");
    console.log("Family creation completed successfully!");
  } catch (error) {
    console.error("Error creating family:", error);
  } finally {
    process.exit(0);
  }
}

createTestFamily();
