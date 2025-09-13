const admin = require("firebase-admin");
const db = admin.firestore();
async function getMembers(adminEmail) {
  try {
    const membersRef = db.collection("members");
    const snapshot = await membersRef
      .where("adminEmail", "==", adminEmail)
      .get();

    if (snapshot.empty) {
      return []; // No members found
    }

    const members = [];
    snapshot.forEach((doc) => {
      const memberData = doc.data();
      members.push({
        ...memberData,
        email: doc.id, // Add doc ID as 'email' field
      });
    });

    return members;
  } catch (error) {
    console.error("Error fetching members:", error);
    throw new Error("Failed to fetch members");
  }
}
async function getTasks(adminEmail) {
  try {
    const tasksRef = db.collection("tasks");
    const snapshot = await tasksRef.where("adminEmail", "==", adminEmail).get();

    if (snapshot.empty) {
      return []; // No tasks found
    }

    const tasks = [];
    snapshot.forEach((doc) => {
      const taskData = doc.data();
      tasks.push({
        ...taskData,
        id: doc.id, // Add doc ID as 'id' field
      });
    });

    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
}
async function getOnTimeCompletion(adminEmail) {
  try {
    const tasks = await getTasks(adminEmail); // get all tasks for this admin
    if (!tasks.length) {
      return 0;
    }
    const totalTasks = tasks.length;
    if (totalTasks === 0) return 0;
    let completedCounter = 0;
    for (const task of tasks) {
      if (task.status) {
        completedCounter++;
      }
    }
    const result = (completedCounter / totalTasks) * 100;
    return +result.toFixed(2);
  } catch (error) {
    console.error("Error in onTimeCompletion:", error);
    throw error;
  }
}
async function getTaskDistribution(adminEmail) {
  try {
    const tasks = await getTasks(adminEmail); // get all tasks for this admin
    if (!tasks || tasks.length === 0) return 0;

    const total = tasks.length;

    // Build distribution
    const distribution = {};
    for (const task of tasks) {
      if (!task.assignedTo) continue; // skip tasks without assigned user
      const key = task.assignedTo;
      distribution[key] = (distribution[key] || 0) + 1;
    }

    const categories = Object.keys(distribution);
    if (categories.length === 0) return 0; // avoid divide by 0
    if (categories.length === 1) return 100;
    const percentages = categories.map(
      (key) => (distribution[key] / total) * 100
    );

    const avg = percentages.reduce((sum, p) => sum + p, 0) / categories.length;
    const variance =
      percentages.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) /
      categories.length;

    const stdDev = Math.sqrt(variance);

    const maxPossibleStdDev = Math.sqrt(
      (100 ** 2 * (categories.length - 1)) / categories.length
    );

    const balanceScore = 100 - (stdDev / maxPossibleStdDev) * 100;

    return +balanceScore.toFixed(2); // Rounded to 2 decimal places
  } catch (error) {
    console.error("Error in TaskDistribution:", error);
    throw error;
  }
}
async function getPointsByMember(adminEmail) {
  try {
    const members = await getMembers(adminEmail); // get all members for this admin
    if (!members.length) {
      return {};
    }

    const pointsMap = {};

    for (const member of members) {
      pointsMap[member.fullName] = member.score || 0; // default to 0 if score is undefined
    }

    return pointsMap;
  } catch (error) {
    console.error("Error in PointsByMember:", error);
    throw error;
  }
}
async function getTasksByStatus(adminEmail) {
  try {
    const tasks = await getTasks(adminEmail);
    if (!tasks.length) {
      return {
        completed: 0,
        inProgress: 0,
        overDue: 0,
        upcoming: 0,
      };
    }

    const now = new Date();

    const statusCount = {
      completed: 0,
      inProgress: 0,
      overDue: 0,
      upcoming: 0,
    };

    for (const task of tasks) {
      if (task.status === true) {
        statusCount.completed++;
      } else {
        const dueDate = new Date(task.dueDate);
        const startDate = new Date(task.startDate);

        if (dueDate < now) {
          statusCount.overDue++;
        } else if (startDate > now) {
          statusCount.upcoming++;
        } else {
          statusCount.inProgress++;
        }
      }
    }

    return statusCount;
  } catch (error) {
    console.error("Error in getTasksByStatus:", error);
    throw error;
  }
}
async function getPointsEarnedOverTime(adminEmail) {
  try {
    const tasks = await getTasks(adminEmail);
    if (!tasks.length) {
      return {};
    }

    const now = new Date();
    const result = {};

    // Generate keys for this month and previous 5 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      result[key] = 0;
    }

    // Loop over tasks and accumulate scoreGained
    for (const task of tasks) {
      const taskDate = new Date(task.startDate);
      const monthKey = `${taskDate.getFullYear()}-${(taskDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      if (result.hasOwnProperty(monthKey)) {
        result[monthKey] += task.scoreGained;
      }
    }

    return result;
  } catch (error) {
    console.error("Error in getPointsEarnedOverTime:", error);
    throw error;
  }
}
async function getCreatedOverTime(adminEmail) {
  try {
    const tasks = await getTasks(adminEmail);
    if (!tasks.length) {
      return {};
    }

    const now = new Date();
    const result = {};

    // Generate keys for this month and the previous 5 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      result[key] = 0;
    }

    // Count how many tasks were created in each of the 6 months
    for (const task of tasks) {
      const createdDate = new Date(task.createdAt);
      const monthKey = `${createdDate.getFullYear()}-${(
        createdDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`;

      if (result.hasOwnProperty(monthKey)) {
        result[monthKey]++;
      }
    }

    return result;
  } catch (error) {
    console.error("Error in getCreatedOverTime:", error);
    throw error;
  }
}

async function getMemberPerformance(adminEmail) {
  try {
    const members = await getMembers(adminEmail);
    if (!members.length) {
      return [];
    }

    return members.map((member) => ({
      fullName: member.fullName,
      completedTasks: member.completedTasks,
      score: member.score,
      completionRate: member.completionRate,
    }));
  } catch (error) {
    console.error("Error in getMemberPerformance:", error);
    throw error;
  }
}
module.exports = {
  getOnTimeCompletion,
  getTaskDistribution,
  getPointsByMember,
  getTasksByStatus,
  getPointsEarnedOverTime,
  getCreatedOverTime,
  getMemberPerformance,
  getTasks,
  getMembers,
};
