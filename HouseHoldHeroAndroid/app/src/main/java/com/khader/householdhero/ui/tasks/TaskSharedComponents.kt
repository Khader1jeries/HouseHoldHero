package com.khader.householdhero.ui.tasks

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khader.householdhero.model.Task
import com.khader.householdhero.model.TaskUnderVote
import com.khader.householdhero.ui.theme.PrimaryColor
import com.khader.householdhero.ui.theme.TextColor
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

// Data class for task items (shared across all screens)
data class TaskItem(
    val id: String,
    val title: String,
    val description: String,
    val points: Int,
    val status: String,
    val backgroundColor: Color,
    val dueDate: String
)
fun convertVotesToTaskItemData(tasks: List<TaskUnderVote>): List<TaskItem> {
    return tasks.map { task ->
        TaskItem(
            id = task.id,
            title = task.title,
            description = task.description,
            points = task.score,
            status = "Votes: YES - ${task.yes.size}", dueDate = formatDateString(task.dueDate), // You can just use task.yes.size.toString() if you want a number only
            backgroundColor = Color(
                red = (70..150).random() / 255f,
                green = (70..150).random() / 255f,
                blue = (70..150).random() / 255f
            )
        )
    }
}

fun convertToTaskItemData(tasks: List<Task>,status: String): List<TaskItem> {

    return tasks.map {
            task ->
        val resolvedStatus = if (status.isEmpty() && task.status == false) {
            "Uncompleted"
        } else if (status.isEmpty() && task.status == true) {
            "Completed"
        } else {
            status
        }
        TaskItem(
            id = task.id,
            title = task.title,
            description = task.description,
            points = task.score,
            status = resolvedStatus,dueDate = formatDateString(task.dueDate),
            backgroundColor = Color(
                red = (70..150).random() / 255f,
                green = (70..150).random() / 255f,
                blue = (70..150).random() / 255f
            )
        )
    }
}

// Shared Task List Content Component
@Composable
fun TaskListContent(
    modifier: Modifier = Modifier,
    tasks: List<TaskItem>,
    emptyMessage: String
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
    ) {
        if (tasks.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = Color.Gray
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = emptyMessage,
                        color = Color.Gray,
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(tasks) { task ->
                    TaskListItem(task = task)
                }

                // Add some bottom padding
                item {
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}

// Individual task list item component
@Composable
fun TaskListItem(
    task: TaskItem,
    onTaskClick: () -> Unit = {}
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onTaskClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Color indicator
            Box(
                modifier = Modifier
                    .size(12.dp)
                    .background(
                        color = task.backgroundColor,
                        shape = RoundedCornerShape(6.dp)
                    )
            )

            Spacer(modifier = Modifier.width(16.dp))

            // Task content
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = task.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = TextColor,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                if (task.description.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = task.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Status and points row
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Status badge
                    Surface(
                        color = task.backgroundColor.copy(alpha = 0.1f),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.padding(0.dp)
                    ) {
                        Text(
                            text = task.status,
                            color = task.backgroundColor,
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Medium,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }

                    // Points
                    Text(
                        text = "${task.points} pts",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryColor
                    )
                    Text(
                        text = "Ends: ${task.dueDate}",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                        color = task.backgroundColor
                    )
                }
            }
        }
    }
}

// Task detail card component for consistent styling
@Composable
fun TaskDetailCard(
    modifier: Modifier = Modifier,
    title: String,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = TextColor
            )
            Spacer(modifier = Modifier.height(12.dp))
            content()
        }
    }
}

// Priority badge component
@Composable
fun PriorityBadge(
    priority: String,
    modifier: Modifier = Modifier
) {
    val (backgroundColor, textColor) = when (priority.lowercase()) {
        "high" -> Pair(Color(0xFFFFEBEE), Color(0xFFC62828))
        "medium" -> Pair(Color(0xFFFFF3E0), Color(0xFFEF6C00))
        "low" -> Pair(Color(0xFFE8F5E8), Color(0xFF2E7D32))
        else -> Pair(Color(0xFFF5F5F5), Color(0xFF666666))
    }

    Surface(
        color = backgroundColor,
        shape = RoundedCornerShape(16.dp),
        modifier = modifier
    ) {
        Text(
            text = priority.uppercase(),
            color = textColor,
            style = MaterialTheme.typography.bodySmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        )
    }
}

// Status badge component
@Composable
fun StatusBadge(
    status: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Surface(
        color = color.copy(alpha = 0.1f),
        shape = RoundedCornerShape(16.dp),
        modifier = modifier
    ) {
        Text(
            text = status,
            color = color,
            style = MaterialTheme.typography.bodySmall,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        )
    }
}fun formatDateString(input: String): String {
    val formatsToTry = listOf(
        "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
        "yyyy-MM-dd'T'HH:mm:ss'Z'",
        "yyyy-MM-dd'T'HH:mm",
        "yyyy-MM-dd'T'HH:mm:ss"
    )

    val locale = Locale.getDefault()
    val outputFormat = SimpleDateFormat("MMMM dd, yyyy - hh:mm a", locale)
    outputFormat.timeZone = TimeZone.getDefault()

    for (format in formatsToTry) {
        try {
            val parser = SimpleDateFormat(format, locale)
            parser.timeZone = TimeZone.getTimeZone("UTC")
            val date = parser.parse(input)
            if (date != null) {
                return outputFormat.format(date)
            }
        } catch (e: Exception) {
            // Try the next format
        }
    }

    return "Invalid date"
}
