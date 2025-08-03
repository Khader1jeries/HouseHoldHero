package com.khader.householdhero.ui.theme.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.khader.householdhero.R
import com.khader.householdhero.network.RetrofitInstance
import com.khader.householdhero.repository.TasksRepository
import com.khader.householdhero.ui.tasks.TasksContent
import com.khader.householdhero.ui.tasks.TasksViewModel
import com.khader.householdhero.ui.tasks.TasksViewModelFactory
import com.khader.householdhero.ui.theme.HouseHoldHeroTheme
import kotlin.Unit

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onSettingsClick: () -> Unit = {},
    onNavigateToActiveTasks: () -> Unit = {},
    onNavigateToVotingTasks: () -> Unit = {},
    onNavigateToFutureTasks: () -> Unit = {},
    onNavigateToFinishedTasks: () -> Unit = {},
    onNavigateToLeaderboard: () -> Unit = {},
            onNavigateToProfile: () -> Unit = {},
    onNotifications: () -> Unit = {},
) {
    println("HomeScreen loaded with onSettingsClick: ${onSettingsClick != {}}")
    var selectedTab by remember { mutableStateOf(0) }

    // Define all navigation items
    val navItems = listOf(
        NavItem(Icons.Default.Home, "Home", 0),
        NavItem(Icons.Default.CheckCircle, "Tasks", 1),
        NavItem(Icons.Default.Star, "Leaderboard", 2),
        NavItem(Icons.Default.Person, "Profile", 3),
        NavItem(Icons.Default.Settings, "Settings", 4),
        NavItem(Icons.Default.Notifications, "Notifications", 5)
    )

    Scaffold(
        topBar = {
            // Simplified Top Bar with just the logo
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(110.dp),
                color = Color(0xFFF5F5F5), // Light grey background
                shadowElevation = 4.dp
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    // Logo (Center)
                    Image(
                        painter = painterResource(id = R.drawable.logo),
                        contentDescription = "HouseHold Hero Logo",
                        modifier = Modifier.size(100.dp)
                    )
                }
            }
        },
        bottomBar = {
            // Custom Bottom Navigation Bar with horizontal scroll
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color.White,
                shadowElevation = 8.dp
            ) {
                Box(modifier = Modifier.fillMaxWidth()) {
                    LazyRow(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        contentPadding = PaddingValues(horizontal = 32.dp) // More padding for scroll indicators
                    ) {
                        items(navItems) { item ->
                            BottomNavItem(
                                icon = item.icon,
                                label = item.label,
                                selected = selectedTab == item.index,
                                onClick = {
                                    selectedTab = item.index
                                    // Handle special actions
                                    when (item.index) {
                                        2 -> onNavigateToLeaderboard()
                                        3->onNavigateToProfile()
                                        4 -> onSettingsClick()
                                        5 -> onNotifications()
                                        else -> selectedTab = item.index
                                    }
                                }
                            )
                        }
                    }

                    // Left scroll indicator (shows when there are items to the left)
                    if (selectedTab > 0) {
                        Box(
                            modifier = Modifier
                                .align(Alignment.CenterStart)
                                .padding(start = 4.dp)
                                .size(24.dp)
                                .background(
                                    Color.Black.copy(alpha = 0.1f),
                                    RoundedCornerShape(12.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "‹",
                                color = Color.Gray,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    // Right scroll indicator (shows when there are items to the right)
                    if (selectedTab < navItems.size - 1) {
                        Box(
                            modifier = Modifier
                                .align(Alignment.CenterEnd)
                                .padding(end = 4.dp)
                                .size(24.dp)
                                .background(
                                    Color.Black.copy(alpha = 0.1f),
                                    RoundedCornerShape(12.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "›",
                                color = Color.Gray,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        },
        containerColor = Color(0xFFF5F5F5) // Grey background for the whole screen
    ) { paddingValues ->
        // Main Content Area
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFF5F5F5))
        ) {
            val context = LocalContext.current
            val repository = remember { TasksRepository(RetrofitInstance.tasksApi, context) }


            val factory = remember { TasksViewModelFactory(repository) }
            val viewModel: TasksViewModel = viewModel(factory = factory)
            when (selectedTab) {
                0 -> HomeContent()
                1 -> TasksContent(
                    viewModel = viewModel,
                    onNavigateToActiveTasks = onNavigateToActiveTasks,
                    onNavigateToVotingTasks = onNavigateToVotingTasks,
                    onNavigateToFutureTasks = onNavigateToFutureTasks,
                    onNavigateToFinishedTasks = onNavigateToFinishedTasks
                )
                2 -> LeaderboardContent()
                3 -> ProfileContent()


                5 -> SettingsContent()
                4-> NotificationsContent()
            }
        }
    }
}

// Data class for navigation items
data class NavItem(
    val icon: ImageVector,
    val label: String,
    val index: Int
)

@Composable
fun BottomNavItem(
    icon: ImageVector,
    label: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .padding(horizontal = 8.dp)
            .width(80.dp) // Fixed width to ensure 4+ items are visible
    ) {
        IconButton(
            onClick = onClick,
            modifier = Modifier.size(40.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = if (selected) MaterialTheme.colorScheme.primary else Color.Gray,
                modifier = Modifier.size(24.dp)
            )
        }
        Text(
            text = label,
            fontSize = 12.sp,
            color = if (selected) MaterialTheme.colorScheme.primary else Color.Gray,
            fontWeight = if (selected) FontWeight.Medium else FontWeight.Normal,
            maxLines = 1
        )
    }
}

@Composable
fun HomeContent() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Logo placeholder - replace with your actual logo
        Box(
            modifier = Modifier.size(120.dp),
            contentAlignment = Alignment.Center
        ) {
            Image(
                painter = painterResource(id = R.drawable.logo),
                contentDescription = "HouseHold Hero Logo",
                modifier = Modifier.size(120.dp)
            )

        }

        Spacer(modifier = Modifier.height(24.dp))

        // App Name
        Text(
            text = "HouseHold Hero",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF333333),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(16.dp))

        // App Information Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Transform household chores into an exciting family competition!",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF333333),
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "• Assign and track household tasks\n" +
                            "• Earn points for completed chores\n" +
                            "• Compete with family members\n" +
                            "• Build better household habits together",
                    style = MaterialTheme.typography.bodyLarge,
                    color = Color(0xFF666666),
                    textAlign = TextAlign.Start,
                    lineHeight = 24.sp
                )

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    text = "Get started and make household management fun for everyone!",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF4CAF50),
                    fontWeight = FontWeight.Medium,
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}




@Composable
fun LeaderboardContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "Leaderboard Screen",
            style = MaterialTheme.typography.headlineMedium,
            color = Color(0xFF333333)
        )
    }
}

@Composable
fun ProfileContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "Profile Screen",
            style = MaterialTheme.typography.headlineMedium,
            color = Color(0xFF333333)
        )
    }
}

@Composable
fun SettingsContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "Settings Screen",
            style = MaterialTheme.typography.headlineMedium,
            color = Color(0xFF333333)
        )
    }
}

@Composable
fun NotificationsContent() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "Notifications Screen",
            style = MaterialTheme.typography.headlineMedium,
            color = Color(0xFF333333)
        )
    }
}

@Preview(showBackground = true)
@Composable
fun HomeScreenPreview() {
    HouseHoldHeroTheme {
        HomeScreen()
    }
}