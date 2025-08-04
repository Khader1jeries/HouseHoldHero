package com.khader.householdhero.ui.tasks.votes.taskDetails

import android.content.Context
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
import kotlinx.coroutines.launch

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

    var isVoting by remember { mutableStateOf(false) }
    var voteMessage by remember { mutableStateOf("") }
    val coroutineScope = rememberCoroutineScope()

    // Get user email from SharedPreferences
    val userEmail = remember {
        val sharedPref = context.getSharedPreferences("HouseholdHeroPrefs", Context.MODE_PRIVATE)
        sharedPref.getString("email", "") ?: ""
    }

    // Fetch task and subtasks when screen loads
    LaunchedEffect(taskId) {

        viewModel.fetchTask(taskId)
        viewModel.fetchSubTasks(taskId)
    }

    val task = viewModel.task?.getOrNull()
    val subtasks = viewModel.subTask?.getOrNull()

    // Check if user has already voted
    val hasVotedYes = task?.yes?.contains(userEmail) == true
    val hasVotedNo = task?.no?.contains(userEmail) == true

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {
        // Top App Bar
        TopAppBar(
            title = {
                Text(
                    text = "Vote Details",
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
                containerColor = PrimaryColor
            )
        )

        // Main Content
        if (task != null) {
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
                        text = task.title,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextColor
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = task.description,
                        fontSize = 14.sp,
                        color = Color(0xFF666666)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    DetailRow(
                        label = "Priority",
                        value = task.priority,
                        icon = Icons.Default.Flag
                    )
                    DetailRow(
                        label = "Due Date",
                        value = formatDateString(task.dueDate) ?: "No due date",
                        icon = Icons.Default.CalendarToday
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Voting Results Card
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
                                    text = "${task.yes.size}",
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
                                    text = "${task.no.size}",
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

            Spacer(modifier = Modifier.height(16.dp))

            // Vote Message
            if (voteMessage.isNotEmpty()) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (voteMessage.contains("successfully"))
                            Color(0xFF4CAF50).copy(alpha = 0.1f)
                        else
                            Color(0xFFF44336).copy(alpha = 0.1f)
                    )
                ) {
                    Text(
                        text = voteMessage,
                        modifier = Modifier.padding(16.dp),
                        color = if (voteMessage.contains("successfully"))
                            Color(0xFF4CAF50)
                        else
                            Color(0xFFF44336),
                        fontWeight = FontWeight.Medium
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Action Buttons
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Yes Button
                Button(
                    onClick = {
                        if (!isVoting && !hasVotedYes) {
                            coroutineScope.launch {
                                isVoting = true
                                voteMessage = ""
                                try {
                                    val result = viewModel.submitVote(taskId, "yes", userEmail)
                                    if (result.isSuccess) {
                                        val voteResponse = result.getOrNull()
                                        voteMessage = voteResponse?.message ?: "Vote submitted successfully!"
                                        if (voteResponse?.success == true) {
                                            // Refresh task data
                                            viewModel.fetchTask(taskId)
                                        }
                                    } else {
                                        voteMessage = result.exceptionOrNull()?.message ?: "Failed to submit vote"
                                    }
                                } catch (e: Exception) {
                                    voteMessage = "Error: ${e.message}"
                                } finally {
                                    isVoting = false
                                }
                            }
                        }
                    },
                    modifier = Modifier.weight(1f),
                    enabled = !isVoting && !hasVotedYes,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (hasVotedYes)
                            Color(0xFF4CAF50).copy(alpha = 0.6f)
                        else
                            Color(0xFF4CAF50),
                        disabledContainerColor = Color(0xFF4CAF50).copy(alpha = 0.3f)
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    if (isVoting) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(18.dp),
                            color = Color.White,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Icon(
                            imageVector = if (hasVotedYes) Icons.Default.Check else Icons.Default.ThumbUp,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (hasVotedYes) "VOTED YES" else "YES ${task.yes.size}",
                        fontWeight = FontWeight.Medium
                    )
                }

                // No Button
                Button(
                    onClick = {
                        if (!isVoting && !hasVotedNo) {
                            coroutineScope.launch {
                                isVoting = true
                                voteMessage = ""
                                try {
                                    val result = viewModel.submitVote(taskId, "no", userEmail)
                                    if (result.isSuccess) {
                                        val voteResponse = result.getOrNull()
                                        voteMessage = voteResponse?.message ?: "Vote submitted successfully!"
                                        if (voteResponse?.success == true) {
                                            // Refresh task data
                                            viewModel.fetchTask(taskId)
                                        }
                                    } else {
                                        voteMessage = result.exceptionOrNull()?.message ?: "Failed to submit vote"
                                    }
                                } catch (e: Exception) {
                                    voteMessage = "Error: ${e.message}"
                                } finally {
                                    isVoting = false
                                }
                            }
                        }
                    },
                    modifier = Modifier.weight(1f),
                    enabled = !isVoting && !hasVotedNo,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (hasVotedNo)
                            Color(0xFFF44336).copy(alpha = 0.6f)
                        else
                            Color(0xFFF44336),
                        disabledContainerColor = Color(0xFFF44336).copy(alpha = 0.3f)
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    if (isVoting) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(18.dp),
                            color = Color.White,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Icon(
                            imageVector = if (hasVotedNo) Icons.Default.Check else Icons.Default.ThumbDown,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (hasVotedNo) "VOTED NO" else "NO ${task.no.size}",
                        fontWeight = FontWeight.Medium
                    )
                }
            }

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
                        text = "Add Comment",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextColor
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    var commentText by remember { mutableStateOf("") }
                    var isAddingComment by remember { mutableStateOf(false) }
                    var commentMessage by remember { mutableStateOf("") }

                    // Comment input field
                    OutlinedTextField(
                        value = commentText,
                        onValueChange = { commentText = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Your comment") },
                        placeholder = { Text("Share your thoughts about this task...") },
                        maxLines = 4,
                        minLines = 2,
                        enabled = !isAddingComment,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryColor,
                            focusedLabelColor = PrimaryColor
                        )
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Comment message
                    if (commentMessage.isNotEmpty()) {
                        Text(
                            text = commentMessage,
                            color = if (commentMessage.contains("successfully"))
                                Color(0xFF4CAF50)
                            else
                                Color(0xFFF44336),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    // Submit comment button
                    Button(
                        onClick = {
                            if (commentText.trim().isNotEmpty()) {
                                coroutineScope.launch {
                                    isAddingComment = true
                                    commentMessage = ""
                                    try {
                                        val result = viewModel.addComment(taskId, userEmail, commentText.trim())
                                        if (result.isSuccess) {
                                            val response = result.getOrNull()
                                            commentMessage = response?.message ?: "Comment added successfully!"
                                            if (response?.success == true) {
                                                commentText = "" // Clear the input
                                            }
                                        } else {
                                            commentMessage = result.exceptionOrNull()?.message ?: "Failed to add comment"
                                        }
                                    } catch (e: Exception) {
                                        commentMessage = "Error: ${e.message}"
                                    } finally {
                                        isAddingComment = false
                                    }
                                }
                            } else {
                                commentMessage = "Please enter a comment"
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !isAddingComment && commentText.trim().isNotEmpty(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PrimaryColor
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        if (isAddingComment) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Adding...")
                        } else {
                            Icon(
                                imageVector = Icons.Default.Send,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Add Comment")
                        }
                    }
                }
            }
        } else {
            // Loading state
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
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
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = PrimaryColor,
            modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = "$label: ",
            fontWeight = FontWeight.Medium,
            fontSize = 14.sp,
            color = TextColor
        )
        Text(
            text = value,
            fontSize = 14.sp,
            color = Color(0xFF666666)
        )
    }
    Spacer(modifier = Modifier.height(8.dp))
}

@Composable
fun SubtaskItem(subtask: subTasks) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = if (subtask.status) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
            contentDescription = null,
            tint = if (subtask.status) Color(0xFF4CAF50) else Color.Gray,
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = "Score: ${subtask.score}",
            fontSize = 14.sp,
            color = if (subtask.status) Color(0xFF4CAF50) else TextColor
        )
    }
}

// Vote response data class
data class VoteResponse(
    val success: Boolean,
    val message: String
)