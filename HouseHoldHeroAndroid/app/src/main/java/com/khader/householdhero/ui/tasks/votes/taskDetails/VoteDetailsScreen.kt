package com.khader.householdhero.ui.tasks.votes.taskDetails

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
fun VoteDetailsScreen(
    taskId: String,
    onBackPressed: () -> Unit,
) {
    // Get context for repository
    val context = LocalContext.current

    // Create ViewModel using factory that handles repository creation
    val viewModel: VoteDetailsViewModel = viewModel(
        factory = VoteDetailsViewModelFactory(context)
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

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Assignment,
                            contentDescription = null,
                            tint = PrimaryColor,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Vote Details",
                            color = TextColor,
                            fontWeight = FontWeight.Bold
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBackPressed) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = TextColor
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
        ) {
            if (taskError != null) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE))
                ) {
                    Text(
                        text = "Error loading task: ${taskError.message}",
                        modifier = Modifier.padding(16.dp),
                        color = Color(0xFFD32F2F)
                    )
                }
            }

            // Task Details Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = task?.title ?: "Loading...",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextColor
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = task?.description ?: "Loading description...",
                        fontSize = 14.sp,
                        color = Color(0xFF666666)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

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

                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Voting Results Card
            task?.let { currentTask ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "Voting Results",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextColor
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Vote counts display
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            // Yes votes
                            Card(
                                colors = CardDefaults.cardColors(
                                    containerColor = Color(0xFF4CAF50).copy(alpha = 0.1f)
                                ),
                                border = BorderStroke(1.dp, Color(0xFF4CAF50))
                            ) {
                                Column(
                                    modifier = Modifier.padding(16.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.ThumbUp,
                                        contentDescription = "Yes votes",
                                        tint = Color(0xFF4CAF50),
                                        modifier = Modifier.size(24.dp)
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "${currentTask.yes?.size ?: 0}",
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF4CAF50)
                                    )
                                    Text(
                                        text = "Yes",
                                        fontSize = 12.sp,
                                        color = Color(0xFF4CAF50)
                                    )
                                }
                            }

                            // No votes
                            Card(
                                colors = CardDefaults.cardColors(
                                    containerColor = Color(0xFFF44336).copy(alpha = 0.1f)
                                ),
                                border = BorderStroke(1.dp, Color(0xFFF44336))
                            ) {
                                Column(
                                    modifier = Modifier.padding(16.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.ThumbDown,
                                        contentDescription = "No votes",
                                        tint = Color(0xFFF44336),
                                        modifier = Modifier.size(24.dp)
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "${currentTask.no?.size ?: 0}",
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFFF44336)
                                    )
                                    Text(
                                        text = "No",
                                        fontSize = 12.sp,
                                        color = Color(0xFFF44336)
                                    )
                                }
                            }
                        }
                    }
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
                // Yes Button
                Button(
                    onClick = { /* TODO: Vote Yes */ },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF4CAF50)
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ThumbUp,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "YES ${task?.yes?.size ?: 0}",
                        fontWeight = FontWeight.Medium
                    )
                }

                // No Button
                Button(
                    onClick = { /* TODO: Vote No */ },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFF44336)
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ThumbDown,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "NO ${task?.no?.size ?: 0}",
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
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = PrimaryColor,
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(
                text = label,
                fontSize = 12.sp,
                color = Color(0xFF666666),
                fontWeight = FontWeight.Medium
            )
            Text(
                text = value,
                fontSize = 14.sp,
                color = TextColor
            )
        }
    }
}