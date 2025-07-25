const admin = require("firebase-admin");
const db = admin.firestore();

async function getMonthlyLeaderboard(adminEmail) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0 = Jan, 11 = Dec
  const currentYear = currentDate.getFullYear();

  const leaderboard = {};

  try {
    const tasksSnapshot = await db
      .collection("tasks")
      .where("adminEmail", "==", adminEmail)
      .get();
    const membersSnapshot = await db
      .collection("members")
      .where("adminEmail", "==", adminEmail)
      .get();
    // Step 2: Initialize leaderboard for all members
    membersSnapshot.forEach((doc) => {
      const memberId = doc.id;
      const memberData = doc.data();

      leaderboard[memberId] = {
        email: memberId,
        fullName: memberData.fullName || "",
        score: 0,
        totalTasks: 0,
        completed: 0,
        uncompleted: 0,
      };
    });
    for (const doc of tasksSnapshot.docs) {
      const task = doc.data();
      const taskDate = new Date(
        task.dueDate.toDate ? task.dueDate.toDate() : task.dueDate
      );
      const taskStatus = task.status;
      const member = task.assignedTo;

      if (!leaderboard[member]) continue;

      if (
        taskDate.getMonth() === currentMonth &&
        taskDate.getFullYear() === currentYear &&
        taskDate < currentDate
      ) {
        console.log(taskDate); // ✅ This will now work

        leaderboard[member].score += task.scoreGained || 0;
        leaderboard[member].totalTasks += 1;

        if (taskStatus === true) {
          leaderboard[member].completed += 1;
        } else {
          leaderboard[member].uncompleted += 1;
        }
      }
    }

    console.log("Filtered leaderboard data:", leaderboard);
    for (const memberId in leaderboard) {
      if (!memberId || memberId.trim() === "") continue; // ✅ Skip invalid keys

      const memberData = leaderboard[memberId];
      memberData.completionRate =
        memberData.totalTasks > 0
          ? memberData.completed / memberData.totalTasks
          : 0;

      try {
        const memberDocSnap = await db
          .collection("members")
          .doc(memberId)
          .get();
        if (memberDocSnap.exists) {
          const memberDoc = memberDocSnap.data();
          memberData.fullName = memberDoc.fullName || "";
        }
      } catch (err) {
        console.warn(`Failed to fetch member ${memberId}:`, err.message);
      }
      memberData.email = memberId;
      delete memberData.completed;
      delete memberData.uncompleted;
    }
    console.log("Filtered leaderboard data:", leaderboard);
    return leaderboard;
  } catch (error) {
    console.error("Error building leaderboard:", error);
    throw error;
  }
}

module.exports = { getMonthlyLeaderboard };
