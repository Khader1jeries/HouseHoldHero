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
module.exports = { generatePDFReport };
