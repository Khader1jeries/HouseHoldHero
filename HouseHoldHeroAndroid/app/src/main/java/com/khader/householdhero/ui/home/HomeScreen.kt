package com.khader.householdhero.ui.theme.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khader.householdhero.R
import com.khader.householdhero.ui.tasks.TasksContent
import com.khader.householdhero.ui.theme.HouseHoldHeroTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onSettingsClick: () -> Unit = {}
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
                                        4 -> onSettingsClick() // Settings
                                        5 -> { /* Handle notification click */ }
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
            when (selectedTab) {
                0 -> HomeContent()
                1 -> TasksContent()
                2 -> LeaderboardContent()
                3 -> ProfileContent()

                4-> NotificationsContent()
                5 -> SettingsContent()
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
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Welcome Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
                Text(
                    text = "Welcome to HouseHold Hero!",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF333333)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Manage your household tasks and compete with family members!",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF666666)
                )
            }
        }

        // Quick Stats Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
                Text(
                    text = "Today's Overview",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF333333)
                )
                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    QuickStatItem("Tasks", "3", Color(0xFF4CAF50))
                    QuickStatItem("Points", "150", Color(0xFF2196F3))
                    QuickStatItem("Rank", "#2", Color(0xFFFF9800))
                }
            }
        }

        // Recent Activity Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp)
            ) {
                Text(
                    text = "Recent Activity",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF333333)
                )
                Spacer(modifier = Modifier.height(12.dp))

                ActivityItem("Completed: Wash dishes", "2 hours ago")
                ActivityItem("Completed: Take out trash", "5 hours ago")
                ActivityItem("Assigned: Clean living room", "1 day ago")
            }
        }
    }
}

@Composable
fun QuickStatItem(label: String, value: String, color: Color) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value,
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = Color(0xFF666666)
        )
    }
}

@Composable
fun ActivityItem(activity: String, time: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = activity,
            style = MaterialTheme.typography.bodyMedium,
            color = Color(0xFF333333),
            modifier = Modifier.weight(1f)
        )
        Text(
            text = time,
            style = MaterialTheme.typography.bodySmall,
            color = Color(0xFF999999)
        )
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