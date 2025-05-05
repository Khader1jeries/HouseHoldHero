// seed.js - Populate Firebase with initial data
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Add family members
    const membersCollection = db.collection("members");

    const members = [
      {
        name: "John Doe",
        email: "john@example.com",
        phone: "+972 55-555-5555",
        age: 23,
        role: "Family Member",
        profileImage: "assets/profile_pic.png",
        activeTasks: 3,
        score: 1500,
        completionRate: 85,
        joinDate: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 15)),
        lastActive: admin.firestore.Timestamp.fromDate(new Date()),
      },
      {
        name: "Kavin Smith",
        email: "kavin@example.com",
        phone: "+972 55-444-4444",
        age: 21,
        role: "Family Member",
        profileImage: "assets/profile_pic.png",
        activeTasks: 5,
        score: 2000,
        completionRate: 95,
        joinDate: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 10)),
        lastActive: admin.firestore.Timestamp.fromDate(new Date()),
      },
      {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "+972 55-333-3333",
        age: 27,
        role: "Family Member",
        profileImage: "assets/profile_pic.png",
        activeTasks: 2,
        score: 1800,
        completionRate: 90,
        joinDate: admin.firestore.Timestamp.fromDate(new Date(2024, 0, 5)),
        lastActive: admin.firestore.Timestamp.fromDate(new Date()),
      },
    ];

    // Add members one by one and store their IDs
    const memberIds = {};

    for (const member of members) {
      const docRef = await membersCollection.add(member);
      console.log(`Added member: ${member.name} with ID: ${docRef.id}`);
      memberIds[member.name] = docRef.id;
    }

    // Add tasks
    const tasksCollection = db.collection("tasks");

    const tasks = [
      {
        title: "Clean Bathroom",
        description:
          "Clean the entire bathroom, including shower, toilet, and sink. Make sure to use appropriate cleaning products for each surface.",
        assignedTo: memberIds["John Doe"],
        assigneeImage: "assets/profile_pic.png",
        dueDate: admin.firestore.Timestamp.fromDate(new Date(2025, 4, 30)),
        status: "pending",
        points: 50,
        priority: "medium",
        category: "Cleaning",
        createdBy: "Admin",
        createdDate: admin.firestore.Timestamp.fromDate(new Date(2025, 4, 25)),
        subTasks: [
          { id: "1-1", title: "Clean shower", completed: true },
          { id: "1-2", title: "Clean toilet", completed: false },
          { id: "1-3", title: "Clean sink", completed: false },
          { id: "1-4", title: "Mop floor", completed: true },
        ],
        comments: [
          {
            author: "Admin",
            authorImage: "assets/profile_pic.png",
            content: "Please use the new cleaning products under the sink.",
            timestamp: admin.firestore.Timestamp.fromDate(
              new Date(2025, 4, 26, 9, 30)
            ),
          },
          {
            author: "John",
            authorImage: "assets/profile_pic.png",
            content: "I will complete this task tonight.",
            timestamp: admin.firestore.Timestamp.fromDate(
              new Date(2025, 4, 27, 14, 15)
            ),
          },
        ],
      },
      {
        title: "Wash the Car",
        description:
          "Wash the family car, including interior vacuuming. Use the car wash kit in the garage.",
        assignedTo: memberIds["Sarah Johnson"],
        assigneeImage: "assets/profile_pic.png",
        dueDate: admin.firestore.Timestamp.fromDate(new Date(2025, 4, 29)),
        status: "pending",
        points: 75,
        priority: "high",
        category: "Outdoors",
        createdBy: "Admin",
        createdDate: admin.firestore.Timestamp.fromDate(new Date(2025, 4, 24)),
        subTasks: [
          { id: "2-1", title: "Wash exterior", completed: false },
          { id: "2-2", title: "Clean windows", completed: false },
          { id: "2-3", title: "Vacuum interior", completed: false },
        ],
        comments: [],
      },
      {
        title: "Take out Trash",
        description: "Take all trash bags to the dumpster",
        assignedTo: memberIds["Kavin Smith"],
        assigneeImage: "assets/profile_pic.png",
        dueDate: admin.firestore.Timestamp.fromDate(new Date(2025, 4, 28)),
        status: "completed",
        points: 20,
        completionDate: admin.firestore.Timestamp.fromDate(
          new Date(2025, 4, 27)
        ),
        priority: "low",
        category: "General",
        createdBy: "Admin",
        createdDate: admin.firestore.Timestamp.fromDate(new Date(2025, 4, 25)),
        comments: [],
      },
      {
        title: "Do Laundry",
        description:
          "Wash, dry, and fold all household laundry. Remember to separate colors from whites.",
        assignedTo: memberIds["John Doe"],
        assigneeImage: "assets/profile_pic.png",
        startDate: admin.firestore.Timestamp.fromDate(new Date(2025, 5, 5)),
        dueDate: admin.firestore.Timestamp.fromDate(new Date(2025, 5, 10)),
        status: "upcoming",
        points: 60,
        priority: "medium",
        category: "Cleaning",
        createdBy: "Admin",
        createdDate: admin.firestore.Timestamp.fromDate(new Date(2025, 4, 20)),
        subTasks: [
          { id: "4-1", title: "Sort clothes", completed: false },
          { id: "4-2", title: "Wash clothes", completed: false },
          { id: "4-3", title: "Dry clothes", completed: false },
          { id: "4-4", title: "Fold and put away", completed: false },
        ],
        comments: [],
      },
      {
        title: "Cook Family Dinner",
        description: "Prepare dinner for the whole family on Saturday evening.",
        assignedTo: "", // Not assigned yet, under voting
        dueDate: admin.firestore.Timestamp.fromDate(new Date(2025, 4, 30)),
        status: "voting",
        points: 100,
        priority: "medium",
        category: "Cooking",
        createdBy: "Admin",
        createdDate: admin.firestore.Timestamp.fromDate(new Date(2025, 4, 26)),
        votesYes: 3,
        votesNo: 2,
        comments: [],
      },
    ];

    // Add tasks to Firestore
    for (const task of tasks) {
      const docRef = await tasksCollection.add(task);
      console.log(`Added task: ${task.title} with ID: ${docRef.id}`);
    }

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Exit the process after seeding is complete
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
