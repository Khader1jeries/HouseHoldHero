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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.khader.householdhero.ui.tasks.TasksViewModel
import com.khader.householdhero.ui.tasks.convertToTaskItemData
import com.khader.householdhero.ui.theme.PrimaryColor
import com.khader.householdhero.ui.theme.TextColor

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ActiveTasksScreen(
    onBackPressed: () -> Unit,
    viewModel: ActiveTasksViewModel = viewModel()
) {
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
        _root_ide_package_.com.khader.householdhero.ui.tasks.TaskListContent(
            modifier = Modifier.padding(paddingValues),
            tasks = tasks,
            emptyMessage = "No active tasks available"
        )
    }
}

// Extended sample data for Active Tasks
fun getActiveTasksFullList(): List<com.khader.householdhero.ui.tasks.TaskItem> = listOf(
    _root_ide_package_.com.khader.householdhero.ui.tasks.TaskItem(
        id = "1",
        title = "Clean bathroom",
        description = "Including sink, toilet, mirror",
        points = 50,
        status = "In Progress",
        backgroundColor = Color(0xFF4CAF50)
    ),
    _root_ide_package_.com.khader.householdhero.ui.tasks.TaskItem(
        id = "2",
        title = "Make the laundry",
        description = "Wash, dry and fold clothes",
        points = 30,
        status = "Pending",
        backgroundColor = Color(0xFF2196F3)
    ),
    _root_ide_package_.com.khader.householdhero.ui.tasks.TaskItem(
        id = "3",
        title = "Vacuum living room",
        description = "Complete vacuum of all areas",
        points = 25,
        status = "Assigned",
        backgroundColor = Color(0xFFFF9800)
    ),
    _root_ide_package_.com.khader.householdhero.ui.tasks.TaskItem(
        id = "4",
        title = "Clean kitchen counters",
        description = "Wipe down all surfaces and appliances",
        points = 20,
        status = "In Progress",
        backgroundColor = Color(0xFF4CAF50)
    ),
    _root_ide_package_.com.khader.householdhero.ui.tasks.TaskItem(
        id = "5",
        title = "Organize bedroom",
        description = "Make bed and organize closet",
        points = 35,
        status = "Assigned",
        backgroundColor = Color(0xFFE91E63)
    ),
    _root_ide_package_.com.khader.householdhero.ui.tasks.TaskItem(
        id = "6",
        title = "Water plants",
        description = "Water all indoor and outdoor plants",
        points = 15,
        status = "Pending",
        backgroundColor = Color(0xFF795548)
    ),
    _root_ide_package_.com.khader.householdhero.ui.tasks.TaskItem(
        id = "7",
        title = "Clean windows",
        description = "Clean all windows in living room",
        points = 40,
        status = "In Progress",
        backgroundColor = Color(0xFF607D8B)
    ),
    _root_ide_package_.com.khader.householdhero.ui.tasks.TaskItem(
        id = "8",
        title = "Sweep patio",
        description = "Sweep and clean outdoor patio area",
        points = 20,
        status = "Assigned",
        backgroundColor = Color(0xFF9C27B0)
    )
)