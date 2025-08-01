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
fun FutureTasksScreen(
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
                            tint = Color(0xFFFF9800),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Future Tasks",
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
            tasks = getFutureTasksFullList(),
            emptyMessage = "No future tasks scheduled"
        )
    }
}

// Extended sample data for Future Tasks
fun getFutureTasksFullList(): List<TaskItem> = listOf(
    TaskItem(
        id = "f1",
        title = "Clean garage",
        description = "Organize and clean garage",
        points = 75,
        status = "Aug 15",dueDate = "",
        backgroundColor = Color(0xFF607D8B)
    ),
    TaskItem(
        id = "f2",dueDate = "",
        title = "Garden maintenance",
        description = "Trim hedges and water plants",
        points = 45,
        status = "Aug 20",
        backgroundColor = Color(0xFF795548)
    ),
    TaskItem(
        id = "f3",dueDate = "",
        title = "Monthly deep clean",
        description = "Deep clean entire house",
        points = 150,
        status = "Sep 1",
        backgroundColor = Color(0xFF9C27B0)
    ),
    TaskItem(
        id = "f4",
        title = "Replace air filters",
        description = "Change HVAC filters throughout house",
        points = 25,
        status = "Aug 25",dueDate = "",
        backgroundColor = Color(0xFF4CAF50)
    ),
    TaskItem(
        id = "f5",
        title = "Clean gutters",
        description = "Remove debris from all gutters",
        points = 80,
        status = "Sep 10",dueDate = "",
        backgroundColor = Color(0xFFFF5722)
    ),
    TaskItem(
        id = "f6",
        title = "Winterize outdoor furniture",
        description = "Store or cover patio furniture",
        points = 35,
        status = "Oct 1",dueDate = "",
        backgroundColor = Color(0xFF3F51B5)
    ),
    TaskItem(
        id = "f7",
        title = "Service lawn mower",
        description = "Annual maintenance and tune-up",
        points = 40,
        status = "Sep 5",dueDate = "",
        backgroundColor = Color(0xFF009688)
    ),
    TaskItem(
        id = "f8",
        title = "Organize holiday decorations",
        description = "Sort and organize holiday items",
        points = 30,
        status = "Nov 1",dueDate = "",
        backgroundColor = Color(0xFFE91E63)
    ),
    TaskItem(
        id = "f9",
        title = "Inspect smoke detectors",
        description = "Test and replace batteries if needed",
        points = 20,
        status = "Sep 15",dueDate = "",
        backgroundColor = Color(0xFFFF9800)
    )
)