package com.khader.householdhero.ui.tasks.votes

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.khader.householdhero.ui.tasks.activeTasks.ActiveTasksViewModel
import com.khader.householdhero.ui.tasks.activeTasks.ActiveTasksViewModelFactory
import com.khader.householdhero.ui.tasks.convertToTaskItemData
import com.khader.householdhero.ui.tasks.convertVotesToTaskItemData
import com.khader.householdhero.ui.theme.PrimaryColor
import com.khader.householdhero.ui.theme.TextColor

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VotingTasksScreen(
    onBackPressed: () -> Unit = {},onTaskClick: (String, Int) -> Unit = { _, _ -> }
) {
    // Get context for repository
    val context = LocalContext.current

    // Create ViewModel using factory that handles repository creation
    val viewModel: VotingTasksViewModel = viewModel(
        factory = VotingTasksViewModelFactory(context)
    )

    DisposableEffect(Unit) {
        viewModel.fetchAllVotes()
        onDispose { }
    }

    val tasks = convertVotesToTaskItemData(viewModel.tasks?.getOrNull() ?: emptyList())
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
        _root_ide_package_.com.khader.householdhero.ui.tasks.TaskListContent(
            modifier = Modifier.padding(paddingValues),
            tasks = tasks,
            emptyMessage = "No tasks available for voting",
                    onTaskClick = onTaskClick
        )
    }
}
