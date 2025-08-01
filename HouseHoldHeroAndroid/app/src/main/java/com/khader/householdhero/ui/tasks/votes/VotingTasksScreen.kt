package com.khader.householdhero.ui.tasks

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khader.householdhero.ui.theme.PrimaryColor
import com.khader.householdhero.ui.theme.TextColor

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VotingTasksScreen(
    onBackPressed: () -> Unit = {}
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = Color(0xFF2196F3),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Voting Tasks",
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
        TaskListContent(
            modifier = Modifier.padding(paddingValues),
            tasks = getVotingTasksFullList(),
            emptyMessage = "No tasks available for voting"
        )
    }
}

// Extended sample data for Voting Tasks
fun getVotingTasksFullList(): List<TaskItem> = listOf(
    TaskItem(
        id = "v1",
        title = "Take the dog for a walk",
        description = "30 minute walk in the park",
        points = 20,
        status = "Vote: YES - 2",dueDate = "",
        backgroundColor = Color(0xFF9C27B0)
    ),
    TaskItem(
        id = "v2",
        title = "Grocery shopping",
        description = "Weekly grocery run",
        points = 40,
        status = "Vote: YES - 1",dueDate = "",
        backgroundColor = Color(0xFFE91E63)
    ),
    TaskItem(
        id = "v3",
        title = "Fix leaky faucet",dueDate = "",
        description = "Repair kitchen sink faucet",
        points = 60,
        status = "Vote: NO - 1",
        backgroundColor = Color(0xFFFF5722)
    ),
    TaskItem(
        id = "v4",
        title = "Paint bedroom walls",dueDate = "",
        description = "Paint master bedroom with new color",
        points = 100,
        status = "Vote: YES - 3",
        backgroundColor = Color(0xFF3F51B5)
    ),
    TaskItem(
        id = "v5",
        title = "Install new light fixture",
        description = "Replace dining room light",
        points = 80,
        status = "Vote: YES - 2",dueDate = "",
        backgroundColor = Color(0xFF009688)
    ),
    TaskItem(
        id = "v6",
        title = "Deep clean carpets",dueDate = "",
        description = "Steam clean all bedroom carpets",
        points = 70,
        status = "Vote: NO - 2",
        backgroundColor = Color(0xFF795548)
    ),
    TaskItem(
        id = "v7",
        title = "Organize garage",dueDate = "",
        description = "Sort and organize all garage items",
        points = 90,
        status = "Vote: YES - 1",
        backgroundColor = Color(0xFF607D8B)
    )
)