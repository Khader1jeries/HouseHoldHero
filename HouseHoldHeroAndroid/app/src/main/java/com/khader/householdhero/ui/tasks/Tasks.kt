package com.khader.householdhero.ui.tasks

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khader.householdhero.ui.theme.PrimaryColor
import com.khader.householdhero.ui.theme.SecondaryColor
import com.khader.householdhero.ui.theme.TextColor

@Composable
fun TasksContent(
    onNavigateToActiveTasks: () -> Unit = {},
    onNavigateToVotingTasks: () -> Unit = {},
    onNavigateToFutureTasks: () -> Unit = {},
    onNavigateToFinishedTasks: () -> Unit = {}
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(8.dp))
        }

        // Active Tasks Container
        item {
            TaskContainer(
                title = "Active Tasks",
                icon = Icons.Default.PlayArrow,
                iconColor = Color(0xFF4CAF50),
                tasks = getActiveTasksSample(),
                onSeeAllClick = onNavigateToActiveTasks
            )
        }

        // Voting Tasks Container
        item {
            TaskContainer(
                title = "Voting",
                icon = Icons.Default.CheckCircle,
                iconColor = Color(0xFF2196F3),
                tasks = getVotingTasksSample(),
                onSeeAllClick = onNavigateToVotingTasks
            )
        }

        // Future Tasks Container
        item {
            TaskContainer(
                title = "Future Tasks",
                icon = Icons.Default.CheckCircle,
                iconColor = Color(0xFFFF9800),
                tasks = getFutureTasksSample(),
                onSeeAllClick = onNavigateToFutureTasks
            )
        }

        // Finished Tasks Container
        item {
            TaskContainer(
                title = "Finished Tasks",
                icon = Icons.Default.CheckCircle,
                iconColor = Color(0xFF9C27B0),
                tasks = getFinishedTasksSample(),
                onSeeAllClick = onNavigateToFinishedTasks
            )
        }

        item {
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun TaskContainer(
    title: String,
    icon: ImageVector,
    iconColor: Color,
    tasks: List<TaskItem>,
    onSeeAllClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            // Header with title and see all button
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconColor,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = TextColor
                    )
                }

                TextButton(
                    onClick = onSeeAllClick,
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = PrimaryColor
                    )
                ) {
                    Text(
                        text = "See All",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Task items
            if (tasks.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(80.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No tasks available",
                        color = Color.Gray,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            } else {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(tasks.take(3)) { task ->
                        TaskCard(task = task)
                    }
                }
            }
        }
    }
}

@Composable
fun TaskCard(task: TaskItem) {
    Card(
        modifier = Modifier
            .width(200.dp)
            .height(120.dp)
            .clickable { /* Handle task click */ },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = task.backgroundColor
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = task.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                if (task.description.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = task.description,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White.copy(alpha = 0.8f),
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (task.points > 0) {
                    Text(
                        text = "${task.points}pts",
                        style = MaterialTheme.typography.labelMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                }

                if (task.status.isNotEmpty()) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color.White.copy(alpha = 0.2f))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = task.status,
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White,
                            fontSize = 10.sp
                        )
                    }
                }
            }
        }
    }
}

// Data class for task items
data class TaskItemData(
    val id: String,
    val title: String,
    val description: String,
    val points: Int,
    val status: String,
    val backgroundColor: Color
)

// Sample data functions
fun getActiveTasksSample(): List<TaskItemData> = listOf(
    TaskItemData(
        id = "1",
        title = "Clean bathroom",
        description = "Including sink, toilet, mirror",
        points = 50,
        status = "In Progress",
        backgroundColor = Color(0xFF4CAF50)
    ),
    TaskItemData(
        id = "2",
        title = "Make the laundry",
        description = "Wash, dry and fold clothes",
        points = 30,
        status = "Pending",
        backgroundColor = Color(0xFF2196F3)
    ),
    TaskItemData(
        id = "3",
        title = "Vacuum living room",
        description = "Complete vacuum of all areas",
        points = 25,
        status = "Assigned",
        backgroundColor = Color(0xFFFF9800)
    )
)

fun getVotingTasksSample(): List<TaskItemData> = listOf(
    TaskItemData(
        id = "4",
        title = "Take the dog in walk",
        description = "30 minute walk in the park",
        points = 20,
        status = "Vote: YES - 2",
        backgroundColor = Color(0xFF9C27B0)
    ),
    TaskItemData(
        id = "5",
        title = "Grocery shopping",
        description = "Weekly grocery run",
        points = 40,
        status = "Vote: YES - 1",
        backgroundColor = Color(0xFFE91E63)
    )
)

fun getFutureTasksSample(): List<TaskItemData> = listOf(
    TaskItemData(
        id = "6",
        title = "Clean garage",
        description = "Organize and clean garage",
        points = 75,
        status = "Scheduled",
        backgroundColor = Color(0xFF607D8B)
    ),
    TaskItemData(
        id = "7",
        title = "Garden maintenance",
        description = "Trim hedges and water plants",
        points = 45,
        status = "Next Week",
        backgroundColor = Color(0xFF795548)
    )
)

fun getFinishedTasksSample(): List<TaskItemData> = listOf(
    TaskItemData(
        id = "8",
        title = "Wash dishes",
        description = "All dishes cleaned and dried",
        points = 15,
        status = "Complete",
        backgroundColor = Color(0xFF9E9E9E)
    ),
    TaskItemData(
        id = "9",
        title = "Take out trash",
        description = "Garbage and recycling",
        points = 10,
        status = "Complete",
        backgroundColor = Color(0xFF9E9E9E)
    )
)