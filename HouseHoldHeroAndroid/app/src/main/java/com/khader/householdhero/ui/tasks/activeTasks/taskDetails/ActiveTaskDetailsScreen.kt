package com.khader.householdhero.ui.tasks.activeTasks.taskDetails

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.khader.householdhero.model.subTasks
import com.khader.householdhero.ui.tasks.formatDateString
import com.khader.householdhero.ui.theme.PrimaryColor
import com.khader.householdhero.ui.theme.TextColor

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ActiveTaskDetailsScreen(
    taskId: String,
    onBackPressed: () -> Unit,
) {
    // Get context for repository
    val context = LocalContext.current

    // Create ViewModel using factory that handles repository creation
    val viewModel: ActiveTaskDetailsViewModel = viewModel(
        factory = ActiveTaskDetailsViewModelFactory(context)
    )

    // Fetch task and subtasks when screen loads
    LaunchedEffect(taskId) {
        println("🔄 Fetching task and subtasks for taskId: $taskId")
        viewModel.fetchTask(taskId)
        viewModel.fetchSubTasks(taskId)
    }

    val task = viewModel.task?.getOrNull()
    val subtasks = viewModel.subTask?.getOrNull()
    val subtaskError = viewModel.subTask?.exceptionOrNull()
    val taskError = viewModel.task?.exceptionOrNull()

    // Debug logging
    LaunchedEffect(subtasks, subtaskError) {
        println("🔍 Subtasks state - List: $subtasks, Error: $subtaskError")
        if (subtasks != null) {
            println("🔍 Subtasks count: ${subtasks.size}")
            subtasks.forEachIndexed { index, subtask ->
                println("🔍 Subtask $index: id=${subtask.id}, status=${subtask.status}, score=${subtask.score}")
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Task Details",
                        color = TextColor,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackPressed) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = TextColor
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = TextColor
                )
            )
        }
    ) { innerPadding ->

        // Show loading state
        if (viewModel.task == null || viewModel.subTask == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator(color = PrimaryColor)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Loading task details...",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray
                    )
                }
            }
            return@Scaffold
        }

        // Show error state if task loading failed
        if (task == null && taskError != null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = "Error",
                        tint = Color.Red,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Failed to load task",
                        style = MaterialTheme.typography.headlineSmall,
                        color = TextColor
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = taskError.message ?: "Unknown error",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = onBackPressed) {
                        Text("Go Back")
                    }
                }
            }
            return@Scaffold
        }

        // Show task with subtasks info
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Task Header Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = task?.title ?: "No Title",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = TextColor
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = task?.description ?: "",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF666666),
                        lineHeight = 20.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Task Details Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            tint = PrimaryColor,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Task Details",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = TextColor
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Subtasks section with debugging info
                    when {
                        subtasks != null && subtasks.isNotEmpty() -> {
                            SubtaskChecklist(subtasks)
                        }
                        subtasks != null && subtasks.isEmpty() -> {
                            // Empty list returned from API
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(
                                    containerColor = Color(0xFFFFF3CD)
                                ),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Column(
                                    modifier = Modifier.padding(16.dp)
                                ) {
                                    Text(
                                        text = "No subtasks found",
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF856404)
                                    )
                                    Text(
                                        text = "This task doesn't have any subtasks configured.",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = Color(0xFF856404)
                                    )
                                }
                            }
                        }
                        subtaskError != null -> {
                            // Error loading subtasks
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(
                                    containerColor = Color(0xFFF8D7DA)
                                ),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Column(
                                    modifier = Modifier.padding(16.dp)
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Warning,
                                            contentDescription = null,
                                            tint = Color(0xFF721C24),
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = "Failed to load subtasks",
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFF721C24)
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = subtaskError.message ?: "Unknown error",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = Color(0xFF721C24)
                                    )
                                    Spacer(modifier = Modifier.height(8.dp))
                                    TextButton(
                                        onClick = {
                                            println("🔄 Retrying subtask fetch for taskId: $taskId")
                                            viewModel.fetchSubTasks(taskId)
                                        }
                                    ) {
                                        Text("Retry", color = Color(0xFF721C24))
                                    }
                                }
                            }
                        }
                        else -> {
                            // Still loading subtasks
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(
                                    containerColor = Color(0xFFF5F5F5)
                                ),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(16.dp),
                                        strokeWidth = 2.dp,
                                        color = PrimaryColor
                                    )
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Text(
                                        text = "Loading subtasks...",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = Color(0xFF666666)
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Task details rows
                    DetailRow(
                        label = "Assigned to",
                        value = task?.assignedTo ?: "Unassigned",
                        icon = Icons.Default.Person
                    )
                    DetailRow(
                        label = "Priority",
                        value = task?.priority ?: "Not set",
                        icon = Icons.Default.Flag
                    )
                    DetailRow(
                        label = "Due Date",
                        value = formatDateString(task?.dueDate ?: "") ?: "No due date",
                        icon = Icons.Default.CalendarToday
                    )
                    DetailRow(
                        label = "Score",
                        value = "${task?.score ?: 0} points",
                        icon = Icons.Default.Star
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Debug Info Card (remove this in production)
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFE3F2FD))
            ) {
                Column(
                    modifier = Modifier.padding(12.dp)
                ) {
                    Text(
                        text = "Debug Info (TaskID: $taskId)",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = Color(0xFF1565C0)
                    )
                    Text(
                        text = "Subtasks: ${if (subtasks == null) "null" else "${subtasks.size} items"}",
                        fontSize = 10.sp,
                        color = Color(0xFF1565C0)
                    )
                    Text(
                        text = "Error: ${subtaskError?.message ?: "none"}",
                        fontSize = 10.sp,
                        color = Color(0xFF1565C0)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Action Buttons
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Mark as Complete Button
                Button(
                    onClick = { /* TODO: Mark as complete */ },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF4CAF50)
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Complete",
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun DetailRow(
    label: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Color(0xFF666666),
            modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = Color(0xFF666666),
            modifier = Modifier.width(100.dp)
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            color = TextColor,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun SubtaskChecklist(subtasks: List<subTasks>) {
    Column(
        modifier = Modifier.fillMaxWidth()
    ) {
        // Subtasks header
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(bottom = 12.dp)
        ) {
            Icon(
                imageVector = Icons.Default.List,
                contentDescription = null,
                tint = PrimaryColor,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Subtasks (${subtasks.size})",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = TextColor
            )
        }

        // Subtasks list
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(max = 300.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            subtasks.forEach { subtask ->
                val isDone = subtask.status
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isDone) Color(0xFFE8F5E8) else Color(0xFFF8F9FA)
                    ),
                    border = BorderStroke(
                        1.dp,
                        if (isDone) Color(0xFF4CAF50) else Color(0xFFE0E0E0)
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Status icon
                        Icon(
                            imageVector = if (isDone) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
                            contentDescription = if (isDone) "Completed" else "Not completed",
                            tint = if (isDone) Color(0xFF4CAF50) else Color(0xFF757575),
                            modifier = Modifier.size(20.dp)
                        )

                        Spacer(modifier = Modifier.width(12.dp))

                        // Subtask content
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = subtask.id, // Using ID as the name
                                fontWeight = FontWeight.Medium,
                                fontSize = 14.sp,
                                color = TextColor
                            )
                            if (subtask.score > 0) {
                                Text(
                                    text = "${subtask.score} points",
                                    fontSize = 12.sp,
                                    color = Color(0xFF666666)
                                )
                            }
                        }

                        // Status badge
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isDone) Color(0xFF4CAF50) else Color(0xFF757575)
                        ) {
                            Text(
                                text = if (isDone) "Done" else "Pending",
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                fontSize = 10.sp,
                                color = Color.White,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }
        }
    }
}