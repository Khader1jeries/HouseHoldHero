package com.khader.householdhero.ui.tasks.activeTasks

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
import com.khader.householdhero.ui.tasks.TasksViewModel
import com.khader.householdhero.ui.tasks.convertToTaskItemData
import com.khader.householdhero.ui.theme.PrimaryColor
import com.khader.householdhero.ui.theme.TextColor
import com.khader.householdhero.repository.TasksRepository
import com.khader.householdhero.network.RetrofitInstance
import com.khader.householdhero.ui.tasks.TaskItem
import com.khader.householdhero.ui.tasks.TaskListContent



@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ActiveTasksScreen(
    onBackPressed: () -> Unit
) {
    // Get context for repository
    val context = LocalContext.current

    // Create ViewModel using factory that handles repository creation
    val viewModel: ActiveTasksViewModel = viewModel(
        factory = ActiveTasksViewModelFactory(context)
    )

    DisposableEffect(Unit) {
        viewModel.fetchAllActiveTasks()
        onDispose { }
    }

    val tasks = convertToTaskItemData(viewModel.tasks?.getOrNull() ?: emptyList(),"Pending")

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = null,
                            tint = Color(0xFF4CAF50),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Active Tasks",
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
            tasks = tasks,
            emptyMessage = "No finished tasks"
        )
    }
}



