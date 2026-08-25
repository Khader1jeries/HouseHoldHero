const { db, FieldValue } = require("../config/firebase");
const { hashPassword } = require("../utils/hash.util");
const { validateCreateMember } = require("../validations/members.validation");
async function createMember(memberData, adminEmail) {
  // Validate required fields
  const validation = validateCreateMember(memberData, adminEmail);
  if (!validation.valid) {
    throw { code: 400, message: validation.message };
  }
  // Ensure fullName is set
  if (!memberData.fullName && (memberData.firstName || memberData.lastName)) {
    memberData.fullName = `${memberData.firstName || ""} ${
      memberData.lastName || ""
    }`.trim();
  }
  let password = memberData.password;
  memberData.password = hashPassword(password);
  // Default values
  memberData.score = 0;
  memberData.activeTasks = 0;
  memberData.completionRate = 0;
  memberData.completedTasks = 0;
  memberData.totalTasks = 0;
  memberData.adminEmail = adminEmail;
  memberData.tasks = [];
  const email = memberData.email;
  delete memberData.email;
  delete memberData.confirmPassword;
  const docRef = db.collection("members").doc(email);
  await docRef.set(memberData);

  await db
    .collection("users")
    .doc(adminEmail)
    .update({
      members: FieldValue.arrayUnion(docRef.id),
    });

  return {
    id: docRef.id,
    ...memberData,
  };
}

module.exports = {
  createMember,
};
