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
fun FinishedTasksScreen(
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
                            tint = Color(0xFF9C27B0),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Finished Tasks",
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
            tasks = getFinishedTasksFullList(),
            emptyMessage = "No finished tasks"
        )
    }
}

// Extended sample data for Finished Tasks
fun getFinishedTasksFullList(): List<TaskItem> = listOf(
    TaskItem(
        id = "fin1",
        title = "Wash dishes",
        description = "All dishes cleaned and dried",
        points = 15,
        status = "Completed",
        backgroundColor = Color(0xFF9E9E9E)
    ),
    TaskItem(
        id = "fin2",
        title = "Take out trash",
        description = "Garbage and recycling",
        points = 10,
        status = "Completed",
        backgroundColor = Color(0xFF9E9E9E)
    ),
    TaskItem(
        id = "fin3",
        title = "Vacuum stairs",
        description = "Vacuumed all carpeted stairs",
        points = 25,
        status = "Completed",
        backgroundColor = Color(0xFF9E9E9E)
    ),
    TaskItem(
        id = "fin4",
        title = "Clean mirrors",
        description = "Cleaned all bathroom mirrors",
        points = 20,
        status = "Completed",
        backgroundColor = Color(0xFF9E9E9E)
    ),
    TaskItem(
        id = "fin5",
        title = "Dust living room",
        description = "Dusted all surfaces and furniture",
        points = 30,
        status = "Completed",
        backgroundColor = Color(0xFF9E9E9E)
    ),
    TaskItem(
        id = "fin6",
        title = "Mop kitchen floor",
        description = "Swept and mopped entire kitchen",
        points = 35,
        status = "Completed",
        backgroundColor = Color(0xFF9E9E9E)
    ),
    TaskItem(
        id = "fin7",
        title = "Clean shower",
        description = "Scrubbed and disinfected shower",
        points = 45,
        status = "Completed",
        backgroundColor = Color(0xFF9E9E9E)
    ),
    TaskItem(
        id = "fin8",
        title = "Organize pantry",
        description = "Sorted and organized all pantry items",
        points = 40,
        status = "Completed",
        backgroundColor = Color(0xFF9E9E9E)
    ),
    TaskItem(
        id = "fin9",
        title = "Wash car",
        description = "Exterior wash and interior vacuum",
        points = 50,
        status = "Completed",
        backgroundColor = Color(0xFF9E9E9E)
    ),
    TaskItem(
        id = "fin10",
        title = "Clean baseboards",
        description = "Wiped down all baseboards",
        points = 25,
        status = "Completed",
        backgroundColor = Color(0xFF9E9E9E)
    ),
    TaskItem(
        id = "fin11",
        title = "Replace light bulbs",
        description = "Changed burned out bulbs",
        points = 15,
        status = "Completed",
        backgroundColor = Color(0xFF9E9E9E)
    ),
    TaskItem(
        id = "fin12",
        title = "Weed garden",
        description = "Removed weeds from flower beds",
        points = 30,
        status = "Completed",
        backgroundColor = Color(0xFF9E9E9E)
    )
)