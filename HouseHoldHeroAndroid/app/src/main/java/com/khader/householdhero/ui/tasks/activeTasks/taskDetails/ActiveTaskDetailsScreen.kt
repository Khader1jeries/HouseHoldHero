package com.khader.householdhero.ui.tasks.activeTasks.taskDetails

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
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

        viewModel.fetchTask(taskId)
        viewModel.fetchSubTasks(taskId)
    }

    val task = viewModel.task?.getOrNull()
    val subtasks = viewModel.subTask?.getOrNull()
    val subtaskError = viewModel.subTask?.exceptionOrNull()
    val isLoading = viewModel.task == null

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = task?.title ?: "Task Details",
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackPressed) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PrimaryColor,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        if (isLoading) {
            // Loading state
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    CircularProgressIndicator(
                        color = PrimaryColor,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Loading task details...",
                        style = MaterialTheme.typography.bodyLarge,
                        color = Color(0xFF666666)
                    )
                }
            }
        } else if (task == null) {
            // Error state
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = Color(0xFFFF5722),
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Task not found",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = TextColor
                    )
                    Text(
                        text = "The requested task could not be loaded.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF666666),
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = onBackPressed,
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryColor)
                    ) {
                        Text("Go Back", color = Color.White)
                    }
                }
            }
        } else {
            // Main content
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .verticalScroll(rememberScrollState())
            ) {
                // Task Header Card
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp)
                    ) {
                        // Title
                        Text(
                            text = task.title,
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = TextColor,
                            lineHeight = 28.sp
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        // Description
                        Text(
                            text = task.description.ifBlank { "No description provided" },
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

                        // Subtasks section
                        when {
                            subtasks != null && subtasks.isNotEmpty() -> {
                                SubtaskChecklist(
                                    subtasks = subtasks,
                                    onSubtaskToggle = { subtaskId ->

                                        viewModel.toggleSubtaskStatus(subtaskId)
                                    },
                                    isUpdating = viewModel.isUpdatingSubtasks
                                )

                                // Show error message if update failed
                                viewModel.updateError?.let { error ->
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Card(
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = CardDefaults.cardColors(
                                            containerColor = Color(0xFFFFEBEE)
                                        ),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(12.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Warning,
                                                contentDescription = null,
                                                tint = Color(0xFFD32F2F),
                                                modifier = Modifier.size(16.dp)
                                            )
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(
                                                text = error,
                                                style = MaterialTheme.typography.bodySmall,
                                                color = Color(0xFFD32F2F),
                                                modifier = Modifier.weight(1f)
                                            )
                                            TextButton(
                                                onClick = {
                                                    viewModel.clearUpdateError()
                                                }
                                            ) {
                                                Text("Dismiss", color = Color(0xFFD32F2F))
                                            }
                                        }
                                    }
                                }
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
                            viewModel.subTask?.isFailure == true -> {
                                // Error loading subtasks
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = CardDefaults.cardColors(
                                        containerColor = Color(0xFFFFEBEE)
                                    ),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Column(
                                        modifier = Modifier.padding(16.dp)
                                    ) {
                                        Text(
                                            text = "Error loading subtasks",
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFF721C24)
                                        )
                                        Text(
                                            text = subtaskError?.message ?: "Unknown error",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = Color(0xFF721C24)
                                        )
                                        Spacer(modifier = Modifier.height(8.dp))
                                        TextButton(
                                            onClick = {

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
                            value = task.assignedTo.ifBlank { "Unassigned" },
                            icon = Icons.Default.Person
                        )
                        DetailRow(
                            label = "Priority",
                            value = task.priority.ifBlank { "Not set" },
                            icon = Icons.Default.Flag
                        )
                        DetailRow(
                            label = "Due Date",
                            value = formatDateString(task.dueDate) ?: "Not set",
                            icon = Icons.Default.DateRange
                        )
                        DetailRow(
                            label = "Points",
                            value = "${task.score}",
                            icon = Icons.Default.Star
                        )
                        DetailRow(
                            label = "Status",
                            value = if (task.status) "Completed" else "Active",
                            icon = if (task.status) Icons.Default.CheckCircle else Icons.Default.Schedule
                        )
                    }
                }

                // Add some bottom padding
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun SubtaskChecklist(
    subtasks: List<subTasks>,
    onSubtaskToggle: (String) -> Unit,
    isUpdating: Boolean = false
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Header
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
                    text = "Subtasks (${subtasks.count { it.status }}/${subtasks.size})",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = TextColor
                )

                // Show loading indicator when updating
                if (isUpdating) {
                    Spacer(modifier = Modifier.width(8.dp))
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        strokeWidth = 2.dp,
                        color = PrimaryColor
                    )
                }
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
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(
                                enabled = !isUpdating,
                                onClick = { onSubtaskToggle(subtask.id) }
                            ),
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
                                tint = if (isDone) Color(0xFF4CAF50) else Color(0xFF9E9E9E),
                                modifier = Modifier.size(24.dp)
                            )

                            Spacer(modifier = Modifier.width(12.dp))

                            // Subtask details
                            Column(
                                modifier = Modifier.weight(1f)
                            ) {
                                Text(
                                    text = "Subtask ${subtask.id}",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = if (isDone) FontWeight.Normal else FontWeight.Medium,
                                    color = if (isDone) Color(0xFF666666) else TextColor,
                                    textDecoration = if (isDone) TextDecoration.LineThrough else TextDecoration.None
                                )

                                if (subtask.score > 0) {
                                    Text(
                                        text = "${subtask.score} points",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = Color(0xFF666666),
                                        fontWeight = FontWeight.Light
                                    )
                                }
                            }

                            // Optional: Add a subtle arrow or touch indicator
                            if (!isUpdating) {
                                Icon(
                                    imageVector = if (isDone) Icons.Default.KeyboardArrowDown else Icons.Default.KeyboardArrowRight,
                                    contentDescription = null,
                                    tint = Color(0xFFBBBBBB),
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DetailRow(
    label: String,
    value: String,
    icon: ImageVector
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
            modifier = Modifier.size(18.dp)
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
            fontWeight = FontWeight.Medium,
            color = TextColor,
            modifier = Modifier.weight(1f)
        )
    }
}