const { db, FieldValue } = require("../config/firebase");
async function addTaskToMember(memberEmail, taskId) {
  if (!memberEmail || !taskId) {
    throw new Error("Both memberEmail and taskId are required.");
  }

  const memberRef = db.collection("members").doc(memberEmail);
  const memberDoc = await memberRef.get();

  if (!memberDoc.exists) {
    throw new Error("Member not found");
  }

  await memberRef.update({
    tasks: FieldValue.arrayUnion(taskId),
  });

  return true;
}
async function activeTasks(memberId) {
  try {
    const memberRef = db.collection("members").doc(memberId);
    const memberDoc = await memberRef.get();

    if (!memberDoc.exists) {
      throw new Error("Member not found");
    }

    const memberData = memberDoc.data();
    const taskIds = memberData.tasks || [];
    let activeTaskCount = 0;
    for (const taskId of taskIds) {
      const taskRef = db.collection("tasks").doc(taskId);
      const taskDoc = await taskRef.get();

      if (taskDoc.exists) {
        const taskData = taskDoc.data();

        // Convert start and due dates from string to Date objects

        const due = new Date(taskData.dueDate);
        const now = new Date();

        // Check that the dates are valid before comparing
        if (!isNaN(due)) {
          const isActive = due >= now;

          if (isActive) {
            activeTaskCount++;
          }
        } else {
          console.warn(`Invalid date(s) in task ${taskId}`);
        }
      }
    }

    // Update the member's activeTasks field
    await memberRef.update({ activeTasks: activeTaskCount });
    await memberRef.update({ totalTasks: taskIds.length });
    return { success: true, activeTasks: activeTaskCount };
  } catch (error) {
    console.error("Failed to update activeTasks:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  activeTasks,

  addTaskToMember,
};
