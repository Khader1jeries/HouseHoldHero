const admin = require("firebase-admin");
const db = admin.firestore();
async function calculateScore(assignedTo, taskId) {
  try {
    // Get the specific task under vote
    const taskDoc = await db.collection("tasksUnderVote").doc(taskId).get();

    if (!taskDoc.exists) {
      console.error(`Task under vote not found for ID: ${taskId}`);
      return 0;
    }

    const taskData = taskDoc.data();

    // Get approval and rejection votes for this specific task
    const approvalVotes =
      taskData.yes && Array.isArray(taskData.yes) ? taskData.yes.length : 0;
    const rejectionVotes =
      taskData.no && Array.isArray(taskData.no) ? taskData.no.length : 0;

    // Get member data by assignedTo (member ID)
    const memberDoc = await db.collection("members").doc(assignedTo).get();

    if (!memberDoc.exists) {
      console.error(`Member not found for ID: ${assignedTo}`);
      return 0;
    }

    const memberData = memberDoc.data();

    // Extract member data with defaults
    const userOverallScore = memberData.score || 0;
    const userActiveTasks = memberData.activeTasks || 0;

    // Apply the formula: Score = ((approval_votes * 2) - (rejection_votes)) + ((user_overall_score * 0.5) - (user_active_tasks * 3))
    let score = approvalVotes * 2 - rejectionVotes;
    score += userOverallScore * 0.5 - userActiveTasks * 3;
    score = Math.abs(score);
    return Math.round(score); // Round to nearest integer
  } catch (error) {
    console.error("Error calculating score:", error);
    return 0;
  }
}
async function calculateWithHungarianAlgorithm(adminEmail, taskId) {
  try {
    console.log(
      "Starting Hungarian Algorithm calculation for admin:",
      adminEmail,
      "and taskId:",
      taskId
    );

    // Get all members for this admin
    const membersSnapshot = await db
      .collection("members")
      .where("adminEmail", "==", adminEmail)
      .get();

    if (membersSnapshot.empty) {
      throw new Error("No members found for this admin");
    }

    // Get all tasks under vote for this admin
    const tasksSnapshot = await db
      .collection("tasksUnderVote")
      .where("adminEmail", "==", adminEmail)
      .get();

    if (tasksSnapshot.empty) {
      throw new Error("No tasks under vote found for this admin");
    }

    // Extract member and task data
    const members = [];
    membersSnapshot.forEach((doc) => {
      members.push({
        id: doc.id,
        data: doc.data(),
      });
    });

    const tasks = [];
    let taskColumnIndex = -1;
    let taskIndex = 0;

    tasksSnapshot.forEach((doc) => {
      const taskData = {
        id: doc.id,
        data: doc.data(),
      };
      tasks.push(taskData);

      console.log(`Task ${taskIndex}: ID = ${doc.id}, Target ID = ${taskId}`);

      if (doc.id === taskId) {
        taskColumnIndex = taskIndex;
        console.log(`Found target task at index ${taskIndex}`);
      }
      taskIndex++;
    });

    console.log(
      `Task column index: ${taskColumnIndex}, Total tasks: ${tasks.length}`
    );

    if (taskColumnIndex === -1) {
      console.error("Task not found in tasks array:", {
        targetTaskId: taskId,
        availableTasks: tasks.map((t) => t.id),
      });
      throw new Error(`Task with ID ${taskId} not found in tasks under vote`);
    }

    console.log(
      `Found ${members.length} members and ${tasks.length} tasks. Target task at column ${taskColumnIndex}`
    );

    // Determine the size for n x n matrix
    const n = Math.max(members.length, tasks.length);
    console.log(`Creating ${n}x${n} matrix`);

    // Create n x n matrix
    const matrix = [];

    for (let i = 0; i < n; i++) {
      matrix[i] = [];
      for (let j = 0; j < n; j++) {
        if (i < members.length && j < tasks.length) {
          // Real member and real task - calculate actual score
          try {
            const memberId = members[i].id;
            const memberOverallScore = members[i].data.score || 0;
            const taskIdForCalc = tasks[j].id;
            const score = await calculateScore(memberId, taskIdForCalc);
            matrix[i][j] = score + memberOverallScore;
            console.log(
              `Score for member ${i} (${memberId}) and task ${j} (${taskIdForCalc}): ${matrix[i][j]}`
            );
          } catch (error) {
            console.error(
              `Error calculating score for member ${members[i].id} and task ${tasks[j].id}:`,
              error
            );
            matrix[i][j] = 0; // Default to 0 if calculation fails
          }
        } else {
          // Fake row or column - fill with 0
          matrix[i][j] = 0;
        }
      }
    }

    // Create reversed matrix using the formula: (max + min) - matrix[i][j]
    const reversedMatrix = [];

    for (let i = 0; i < n; i++) {
      // Find max and min for current row (only for real members)
      const rowMax = Math.max(...matrix[i]);
      const rowMin = Math.min(...matrix[i]);

      reversedMatrix[i] = [];
      for (let j = 0; j < n; j++) {
        reversedMatrix[i][j] = rowMax + rowMin - matrix[i][j];
      }
    }

    console.log("Generated reversed matrix:");
    reversedMatrix.forEach((row, i) => {
      console.log(`Reversed Row ${i}:`, row);
    });

    // Find global max from reversedMatrix for proper conversion
    let globalMax = 0;
    for (let i = 0; i < members.length; i++) {
      for (let j = 0; j < tasks.length; j++) {
        if (reversedMatrix[i][j] > globalMax) {
          globalMax = reversedMatrix[i][j];
        }
      }
    }

    // Create Hungarian matrix by converting maximization to minimization
    const hungarianMatrix = [];
    for (let i = 0; i < n; i++) {
      hungarianMatrix[i] = [];
      for (let j = 0; j < n; j++) {
        if (i >= members.length || j >= tasks.length) {
          hungarianMatrix[i][j] = globalMax; // High cost for fake cells
        } else {
          hungarianMatrix[i][j] = globalMax - reversedMatrix[i][j]; // Convert to minimization
        }
      }
    }

    // Step 1: Row reduction
    for (let i = 0; i < n; i++) {
      const rowMin = Math.min(...hungarianMatrix[i]);
      for (let j = 0; j < n; j++) {
        hungarianMatrix[i][j] -= rowMin;
      }
    }

    // Step 2: Column reduction
    for (let j = 0; j < n; j++) {
      const colMin = Math.min(...hungarianMatrix.map((row) => row[j]));
      for (let i = 0; i < n; i++) {
        hungarianMatrix[i][j] -= colMin;
      }
    }

    console.log("Matrix after row and column reduction:");
    hungarianMatrix.forEach((row, i) => {
      console.log(`Row ${i}:`, row);
    });

    // Step 3: Find optimal assignment using simplified approach
    // For this implementation, we'll use a greedy approach to find assignment
    const assignment = hungarianOptimalAssignment(hungarianMatrix, n);

    console.log("Optimal assignment:", assignment);
    console.log("Target task column index:", taskColumnIndex);
    console.log("Available members count:", members.length);

    // Special case: if we only have one task, the target task must be at column 0
    if (tasks.length === 1 && taskColumnIndex === -1) {
      console.log(
        "Only one task found, assuming it's the target task at column 0"
      );
      taskColumnIndex = 0;
    }

    // Find which member is assigned to our target task
    const assignedMemberIndex = assignment[taskColumnIndex];

    console.log("Assigned member index for target task:", assignedMemberIndex);

    if (
      assignedMemberIndex === undefined ||
      assignedMemberIndex === -1 ||
      assignedMemberIndex >= members.length
    ) {
      console.error("Invalid assignment:", {
        assignedMemberIndex,
        membersLength: members.length,
        taskColumnIndex,
        assignment,
      });
      throw new Error(
        "No valid member assignment found for the specified task"
      );
    }

    // Verify the member exists
    if (!members[assignedMemberIndex] || !members[assignedMemberIndex].data) {
      console.error("Member data not found:", {
        assignedMemberIndex,
        member: members[assignedMemberIndex],
        allMembers: members.map((m) => ({ id: m.id, hasData: !!m.data })),
      });
      throw new Error("Member data is missing or corrupted");
    }

    const bestMemberEmail = members[assignedMemberIndex].id;

    if (!bestMemberEmail) {
      throw new Error("Member email is missing");
    }

    console.log(
      `Best member for task ${taskId}: ${bestMemberEmail} (member index: ${assignedMemberIndex})`
    );
    return bestMemberEmail;
  } catch (error) {
    console.error("Error in Hungarian algorithm calculation:", error);
    throw error;
  }
}

// Helper function to find optimal assignment
function hungarianOptimalAssignment(matrix, n) {
  console.log("Starting optimal assignment calculation for matrix size:", n);

  // This is a simplified version of the Hungarian algorithm
  const assignment = new Array(n).fill(-1); // assignment[col] = row
  const usedRows = new Array(n).fill(false);

  // First pass: try to assign zeros
  for (let col = 0; col < n; col++) {
    for (let row = 0; row < n; row++) {
      if (!usedRows[row] && matrix[row][col] === 0) {
        assignment[col] = row;
        usedRows[row] = true;
        console.log(`Assigned row ${row} to column ${col} (zero found)`);
        break;
      }
    }
  }

  // Second pass: assign remaining columns to unused rows with minimum values
  for (let col = 0; col < n; col++) {
    if (assignment[col] === -1) {
      let bestRow = -1;
      let bestValue = Infinity;

      for (let row = 0; row < n; row++) {
        if (!usedRows[row] && matrix[row][col] < bestValue) {
          bestValue = matrix[row][col];
          bestRow = row;
        }
      }

      if (bestRow !== -1) {
        assignment[col] = bestRow;
        usedRows[bestRow] = true;
        console.log(
          `Assigned row ${bestRow} to column ${col} (minimum value: ${bestValue})`
        );
      }
    }
  }

  // Final pass: assign any remaining unassigned columns to any available rows
  for (let col = 0; col < n; col++) {
    if (assignment[col] === -1) {
      for (let row = 0; row < n; row++) {
        if (!usedRows[row]) {
          assignment[col] = row;
          usedRows[row] = true;
          console.log(
            `Assigned row ${row} to column ${col} (fallback assignment)`
          );
          break;
        }
      }
    }
  }

  console.log("Final assignment array:", assignment);
  return assignment;
}

module.exports = { calculateScore, calculateWithHungarianAlgorithm };
