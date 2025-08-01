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
import com.khader.householdhero.model.Task
import com.khader.householdhero.model.TaskUnderVote
import com.khader.householdhero.ui.theme.PrimaryColor
import com.khader.householdhero.ui.theme.SecondaryColor
import com.khader.householdhero.ui.theme.TextColor

// Data class for task items


@Composable
fun TasksContent(
    viewModel: TasksViewModel,onNavigateToActiveTasks: () -> Unit = {},
    onNavigateToVotingTasks: () -> Unit = {},
    onNavigateToFutureTasks: () -> Unit = {},
    onNavigateToFinishedTasks: () -> Unit = {},

) {
    DisposableEffect(Unit) {
        viewModel.fetchTwoActiveTasks()
        viewModel.fetchTwoFutureTasks()
        viewModel.fetchTwoFinishedTasks()
        viewModel.fetchTwoVotes()
        onDispose { }
    }
    val active = convertToTaskItemData(viewModel.twoActiveTasksResult?.getOrNull() ?: emptyList(),"Pending")
    val future = convertToTaskItemData(viewModel.twoFutureTasksResult?.getOrNull() ?: emptyList(),"Upcoming")
    val finished = convertToTaskItemData(viewModel.twoFinishedTasksResult?.getOrNull() ?: emptyList(),"")
    val votes = convertVotesToTaskItemData(viewModel.twoVotes?.getOrNull() ?: emptyList())
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
                tasks = active,
                onSeeAllClick = onNavigateToActiveTasks
            )
        }

        // Voting Tasks Container
        item {
            TaskContainer(
                title = "Voting",
                icon = Icons.Default.CheckCircle,
                iconColor = Color(0xFF2196F3),
                tasks = votes,
                onSeeAllClick = onNavigateToVotingTasks
            )
        }

        // Future Tasks Container
        item {
            TaskContainer(
                title = "Future Tasks",
                icon = Icons.Default.Schedule,
                iconColor = Color(0xFFFF9800),
                tasks = future,
                onSeeAllClick = onNavigateToFutureTasks
            )
        }

        // Finished Tasks Container
        item {
            TaskContainer(
                title = "Finished Tasks",
                icon = Icons.Default.Done,
                iconColor = Color(0xFF9E9E9E),
                tasks = finished,
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
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            // Header
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
                    onClick = onSeeAllClick
                ) {
                    Text(
                        text = "See All",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = PrimaryColor
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
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            // Bottom row with points and status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if ((task.points ?: 0) > 0) {
                    Text(
                        text = "${task.points} pts",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
                Text(
                    text = task.status,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.9f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}








