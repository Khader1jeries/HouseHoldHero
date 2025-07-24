const admin = require("firebase-admin");
const db = admin.firestore();
async function updateStatus(taskData) {
  try {
    const { id, subtasks } = taskData;

    // Check if all subtasks are completed (status === true)
    const allCompleted = Object.values(subtasks || {}).every(
      (subtask) => subtask.status === true
    );

    // Update the task status based on subtasks
    const updatedStatus = allCompleted;
    console.log(updatedStatus);
    // Update Firestore task document (if needed)
    await db.collection("tasks").doc(id).update({
      status: updatedStatus,
    });

    console.log(`Task ${id} status updated to ${updatedStatus}`);
  } catch (error) {
    console.error("Failed to update task status:", error);
  }
}
async function pointsCalculation(memberData) {}

module.exports = { pointsCalculation, updateStatus };
