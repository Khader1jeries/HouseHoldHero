const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const db = admin.firestore();
const {
  getOnTimeCompletion,
  getTaskDistribution,
  getPointsByMember,
  getTasksByStatus,
  getPointsEarnedOverTime,
  getCreatedOverTime,
  getMemberPerformance,
  getMembers, // ← ADD THIS LINE
  getTasks, // ← ADD THIS LINE
} = require("../controllers/analyticsController");

// GET /analytics/on-time-completion/:adminEmail
router.get("/on-time-completion/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getOnTimeCompletion(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get on-time completion" });
  }
});

// GET /analytics/task-distribution/:adminEmail
router.get("/task-distribution/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getTaskDistribution(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get task distribution" });
  }
});

// GET /analytics/points-by-member/:adminEmail
router.get("/points-by-member/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getPointsByMember(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get points by member" });
  }
});

// GET /analytics/tasks-by-status/:adminEmail
router.get("/tasks-by-status/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getTasksByStatus(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get tasks by status" });
  }
});

// GET /analytics/points-earned-over-time/:adminEmail
router.get("/points-earned-over-time/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getPointsEarnedOverTime(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get points earned over time" });
  }
});

// GET /analytics/created-over-time/:adminEmail
router.get("/created-over-time/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getCreatedOverTime(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get created over time" });
  }
});

// GET /analytics/member-performance/:adminEmail
router.get("/member-performance/:adminEmail", async (req, res) => {
  try {
    const { adminEmail } = req.params;
    const result = await getMemberPerformance(adminEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to get member performance" });
  }
});
const PDFDocument = require("pdfkit");
const Chart = require("chart.js/auto");
const { createCanvas } = require("canvas");

// Helper function to generate chart as image buffer
async function generateChartImage(chartConfig, width = 600, height = 400) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Create chart instance
  const chart = new Chart(ctx, chartConfig);

  // Return canvas as buffer
  return canvas.toBuffer("image/png");
}

// Helper function to create chart configurations
function createChartConfigs(data) {
  const charts = [];

  // 1. Task Status Distribution Chart
  if (data.tasksByStatus) {
    charts.push({
      title: "Tasks by Status",
      config: {
        type: "doughnut",
        data: {
          labels: Object.keys(data.tasksByStatus),
          datasets: [
            {
              data: Object.values(data.tasksByStatus),
              backgroundColor: [
                "#4CAF50", // completed
                "#2196F3", // in_progress
                "#FF9800", // pending
                "#F44336", // overdue
              ],
            },
          ],
        },
        options: {
          responsive: false,
          plugins: {
            legend: {
              position: "right",
            },
          },
        },
      },
    });
  }

  // 2. Points by Member Chart
  if (data.pointsByMember && data.pointsByMember.length > 0) {
    charts.push({
      title: "Points by Team Member",
      config: {
        type: "bar",
        data: {
          labels: data.pointsByMember.map((m) => m.name || m.email),
          datasets: [
            {
              label: "Points Earned",
              data: data.pointsByMember.map((m) => m.total_points || 0),
              backgroundColor: "#2196F3",
            },
          ],
        },
        options: {
          responsive: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      },
    });
  }

  // 3. Points Over Time Chart
  if (data.pointsOverTime && data.pointsOverTime.length > 0) {
    charts.push({
      title: "Points Earned Over Time",
      config: {
        type: "line",
        data: {
          labels: data.pointsOverTime.map((d) => d.date),
          datasets: [
            {
              label: "Total Points",
              data: data.pointsOverTime.map((d) => d.total_points),
              borderColor: "#4CAF50",
              tension: 0.1,
              fill: false,
            },
          ],
        },
        options: {
          responsive: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      },
    });
  }

  // 4. Tasks Created Over Time
  if (data.createdOverTime && data.createdOverTime.length > 0) {
    charts.push({
      title: "Tasks Created Over Time",
      config: {
        type: "line",
        data: {
          labels: data.createdOverTime.map((d) => d.date),
          datasets: [
            {
              label: "Tasks Created",
              data: data.createdOverTime.map((d) => d.count),
              borderColor: "#FF9800",
              backgroundColor: "rgba(255, 152, 0, 0.1)",
              tension: 0.1,
              fill: true,
            },
          ],
        },
        options: {
          responsive: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      },
    });
  }

  return charts;
}

// Main PDF generation function
async function generatePDFReport(data) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      // Collect the PDF data
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Add header
      doc
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("Team Performance Report", { align: "center" });

      doc
        .fontSize(12)
        .font("Helvetica")
        .text(`Generated on: ${new Date().toLocaleDateString()}`, {
          align: "center",
        });

      doc.moveDown(2);

      // Add summary section
      doc.fontSize(18).font("Helvetica-Bold").text("Summary");

      doc
        .fontSize(12)
        .font("Helvetica")
        .text(`Total Team Members: ${data.membersCount || 0}`)
        .text(`Total Tasks: ${data.tasksCount || 0}`);

      doc.moveDown();

      // Add task distribution if available
      if (data.taskDistribution && data.taskDistribution.length > 0) {
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Task Distribution by Member");

        doc.fontSize(10).font("Helvetica");

        data.taskDistribution.forEach((member) => {
          doc.text(
            `• ${member.name || member.email}: ${member.task_count} tasks`
          );
        });

        doc.moveDown();
      }

      // Generate and add charts
      const chartConfigs = createChartConfigs(data);

      for (const chartInfo of chartConfigs) {
        // Check if we need a new page
        if (doc.y > 500) {
          doc.addPage();
        }

        doc.fontSize(14).font("Helvetica-Bold").text(chartInfo.title);

        doc.moveDown(0.5);

        try {
          const chartBuffer = await generateChartImage(
            chartInfo.config,
            500,
            300
          );
          doc.image(chartBuffer, {
            fit: [500, 300],
            align: "center",
          });
        } catch (chartError) {
          console.error(
            `Error generating chart ${chartInfo.title}:`,
            chartError
          );
          doc.text("Chart could not be generated", { align: "center" });
        }

        doc.moveDown();
      }

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Updated route handler
router.get("/reports/:adminEmail", async (req, res) => {
  const { adminEmail } = req.params;

  try {
    // Fetch all data in parallel (your existing code)
    const [
      members,
      tasks,
      onTimeCompletion,
      taskDistribution,
      pointsByMember,
      tasksByStatus,
      pointsOverTime,
      createdOverTime,
      memberPerformance,
    ] = await Promise.all([
      getMembers(adminEmail),
      getTasks(adminEmail),
      getOnTimeCompletion(adminEmail),
      getTaskDistribution(adminEmail),
      getPointsByMember(adminEmail),
      getTasksByStatus(adminEmail),
      getPointsEarnedOverTime(adminEmail),
      getCreatedOverTime(adminEmail),
      getMemberPerformance(adminEmail),
    ]);

    // Prepare data for PDF generation
    const reportData = {
      adminEmail,
      onTimeCompletion,
      taskDistribution,
      pointsByMember,
      tasksByStatus,
      pointsOverTime,
      createdOverTime,
      memberPerformance,
      membersCount: members.length,
      tasksCount: tasks.length,
    };

    // Generate PDF
    const pdfBuffer = await generatePDFReport(reportData);

    // Set response headers for PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="team-report-${Date.now()}.pdf"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating report:", err.stack || err);
    res.status(500).json({ error: err.message || "Failed to generate report" });
  }
});

module.exports = router;
