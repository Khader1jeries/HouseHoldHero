const { db, FieldValue } = require("../config/firebase");
async function expired(taskUnderVote) {
  try {
    const now = new Date();
    const dueDate = new Date(taskUnderVote.dueDate);

    if (dueDate < now) {
      taskUnderVote.expired = true;
    } else {
      taskUnderVote.expired = false; // optional: keep it consistent
    }

    return taskUnderVote; // optional, in case you want to use it afterward
  } catch (error) {
    console.error("Error checking expiration:", error);
  }
}
async function addToAdmin(taskUnderVote, taskId) {
  try {
    const adminEmail = taskUnderVote.adminEmail;

    if (!adminEmail || !taskId) {
      throw new Error("Missing adminEmail or taskId");
    }

    const userRef = db.collection("users").doc(adminEmail);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.error(`User with email ${adminEmail} not found`);
      return {
        success: false,
        message: `Admin user ${adminEmail} does not exist`,
      };
    }

    await userRef.update({
      tasksUnderVote: FieldValue.arrayUnion(taskId),
    });

    return { success: true, message: "Task added to admin's tasksUnderVote" };
  } catch (error) {
    console.error("Error adding task to admin:", error);
    return { success: false, message: "Failed to add task to admin" };
  }
}

module.exports = { expired, addToAdmin };
