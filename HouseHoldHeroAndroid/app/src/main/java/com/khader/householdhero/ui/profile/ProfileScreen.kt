package com.khader.householdhero.ui.profile

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.khader.householdhero.R
import com.khader.householdhero.model.MemberData
import com.khader.householdhero.ui.tasks.finishedTasks.FinishedTasksViewModelFactory
import com.khader.householdhero.ui.tasks.formatDateString
import com.khader.householdhero.ui.theme.TextColor

// Data class for user profile
data class UserProfile(
    val id: String,
    val fullName: String,
    val email: String,
    val score: Int,
    val level: Int,
    val completedTasks: Int,
    val activeTasks: Int,
    val streakDays: Int,
    val joinedDate: String,
    val profileImageRes: Int = R.drawable.logo,
    val badges: List<Badge> = emptyList()
)

data class Badge(
    val id: String,
    val name: String,
    val description: String,
    val icon: ImageVector,
    val color: Color,
    val isEarned: Boolean = true
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onBackPressed: () -> Unit = {},
    onEditProfile: () -> Unit = {},
    onSettings: () -> Unit = {}
) {
    // Get context for repository
    val context = LocalContext.current

    // Create ViewModel using factory that handles repository creation
    val viewModel: ProfileViewModel = viewModel(
        factory = FinishedTasksViewModelFactory(context)
    )
    val level=viewModel.calculateLevel()
    val progress=viewModel.calculateLevelProgress()
    val toGo =viewModel.pointsNeededToNextLevel()
    DisposableEffect(Unit) {
        viewModel.fetchMember()

        onDispose { }
    }

    val member = viewModel.member?.getOrNull()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            tint = TextColor,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Profile",
                            color = TextColor,
                            fontWeight = FontWeight.Bold
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBackPressed) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = TextColor
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onSettings) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Settings",
                            tint = TextColor
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                )
            )
        },
        containerColor = Color(0xFFF5F5F5)
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
        ) {
            // Profile Header Card
            ProfileHeaderCard(
                member = member,
                onEditProfile = onEditProfile
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Level & Score Card
            LevelScoreCard(member = member, level =level,progress=progress,toGo=toGo)

            Spacer(modifier = Modifier.height(16.dp))

            // Stats Cards Row
            StatsCardsRow(member = member)









            Spacer(modifier = Modifier.height(100.dp)) // Bottom padding
        }
    }
}

@Composable
fun ProfileHeaderCard(
    member: MemberData?,
    onEditProfile: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Box {
            // Gradient background
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp)
                    .background(
                        Brush.horizontalGradient(
                            colors = listOf(
                                Color(0xFF2196F3),
                                Color(0xFF21CBF3)
                            )
                        )
                    )
            )

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(40.dp))

                // Profile Image
                Box(
                    modifier = Modifier.size(100.dp)
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.logo),
                        contentDescription = "Profile Picture",
                        modifier = Modifier
                            .size(100.dp)
                            .clip(CircleShape)
                            .border(4.dp, Color.White, CircleShape),
                        contentScale = ContentScale.Crop
                    )

                    // Edit button
                    IconButton(
                        onClick = onEditProfile,
                        modifier = Modifier
                            .size(32.dp)
                            .background(Color.White, CircleShape)
                            .align(Alignment.BottomEnd)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = "Edit Profile",
                            tint = Color(0xFF2196F3),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Name and Email
                Text(
                    text = member?.fullName ?: "",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextColor
                )

                Text(
                    text = member?.id ?: "",
                    fontSize = 14.sp,
                    color = Color(0xFF666666)
                )

                Text(
                    text = "Member since ${formatDateString(member?.createdAt ?: "")}",
                    fontSize = 12.sp,
                    color = Color(0xFF999999)
                )
            }
        }
    }
}

@Composable
fun LevelScoreCard(member: MemberData?, level: Int, progress: Float, toGo: Int) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.EmojiEvents,
                    contentDescription = null,
                    tint = Color(0xFFFFD700),
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Level & Score",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextColor
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                // Level Section
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.weight(1f)
                ) {
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .background(
                                Color(0xFF2196F3).copy(alpha = 0.1f),
                                CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "${level}",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF2196F3)
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Level",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextColor
                    )
                }

                // Divider
                Box(
                    modifier = Modifier
                        .width(1.dp)
                        .height(60.dp)
                        .background(Color(0xFFE0E0E0))
                )

                // Score Section
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.weight(1f)
                ) {
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .background(
                                Color(0xFF4CAF50).copy(alpha = 0.1f),
                                CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "${member?.score}",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF4CAF50)
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Total Score",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextColor
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Progress to next level
            val currentLevelProgress = progress
            val pointsToNext = toGo

            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Progress to Level ${ + 1}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = TextColor
                    )
                    Text(
                        text = "$pointsToNext points to go",
                        fontSize = 12.sp,
                        color = Color(0xFF666666)
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = currentLevelProgress ?: 0f,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = Color(0xFF2196F3),
                    trackColor = Color(0xFFE3F2FD),

                )
            }
        }
    }
}

@Composable
fun StatsCardsRow(member: MemberData?) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        StatCard(
            icon = Icons.Default.CheckCircle,
            title = "Completed",
            value = "${member?.completedTasks}",
            color = Color(0xFF4CAF50),
            modifier = Modifier.weight(1f)
        )

        StatCard(
            icon = Icons.Default.PendingActions,
            title = "Active",
            value = "${member?.activeTasks}",
            color = Color(0xFF2196F3),
            modifier = Modifier.weight(1f)
        )

        StatCard(
            icon = Icons.Default.LocalFireDepartment,
            title = "Completion Rate",
            value = "${member?.completionRate}%",
            color = Color(0xFFFF5722),
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
fun StatCard(
    icon: ImageVector,
    title: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = color,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = TextColor
            )
            Text(
                text = title,
                fontSize = 12.sp,
                color = Color(0xFF666666),
                textAlign = TextAlign.Center
            )
        }
    }
}





