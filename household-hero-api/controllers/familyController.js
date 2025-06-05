const admin = require("firebase-admin");
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;
createFamilyForUser
async function createFamilyForUser(name, email) {
  const newFamily = {
    name,
    admin: email,
    members: [email],
    createdAt: new Date().toISOString(),
  };

  const familyRef = await db.collection("families").add(newFamily);

  await db
    .collection("users")
    .doc(email)
    .update({ familyId: FieldValue.arrayUnion(familyRef.id) });

  return familyRef.id;
}

module.exports = {
  createFamilyForUser,
};
