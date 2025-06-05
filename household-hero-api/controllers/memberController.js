// controllers/memberController.js
const admin = require("firebase-admin");
const db = admin.firestore();

async function createMember(memberData,adminEmail) {
  // Validate required fields
  if (
    (!memberData.fullName && !(memberData.firstName || memberData.lastName)) ||
    !memberData.email
  ) {
    throw { code: 400, message: "Name and email are required" };
  }

  if (!adminEmail) {
    throw { code: 400, message: "adminEmail is required" };
  }

  // Ensure fullName is set
  if (!memberData.fullName && (memberData.firstName || memberData.lastName)) {
    memberData.fullName = `${memberData.firstName || ""} ${memberData.lastName || ""}`.trim();
  }

  // Default values
  memberData.score = 0;
  memberData.activeTasks = 0;
  memberData.completionRate = 0;
  memberData.completedTasks = 0;
  memberData.totalTasks = 0;
  memberData.adminEmail = adminEmail;
  const email = memberData.email;
  delete memberData.email;

  const docRef = db.collection("members").doc(email);
  await docRef.set(memberData);

  await db.collection("users").doc(adminEmail).update({
    members: admin.firestore.FieldValue.arrayUnion(docRef.id),
  });

  return {
    id: docRef.id,
    ...memberData,
  };
}

module.exports = {
  createMember,
};
