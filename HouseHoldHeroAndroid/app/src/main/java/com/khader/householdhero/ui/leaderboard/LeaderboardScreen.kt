package com.khader.householdhero.ui.leaderboard

import android.content.Context
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.khader.householdhero.R
import com.khader.householdhero.model.LeaderboardMember
import com.khader.householdhero.network.RetrofitInstance
import com.khader.householdhero.repository.MemberRepository

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LeaderboardScreen(
    onBackPressed: () -> Unit = {}
) {
    val context = LocalContext.current
    val repository = remember { MemberRepository(RetrofitInstance.memberApi, context) }
    val factory = remember { LeaderboardViewModelFactory(repository) }
    val viewModel: LeaderboardViewModel = viewModel(factory = factory)

    val state = viewModel.leaderboardState

    // ⭐ Get current user email from SharedPreferences
    val currentUserEmail = remember {
        val sharedPrefs = context.getSharedPreferences("HouseholdHeroPrefs", Context.MODE_PRIVATE)
        sharedPrefs.getString("email", "") ?: ""
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = Color(0xFFFFD700), // Gold color
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Leaderboard",
                            color = Color(0xFF333333),
                            fontWeight = FontWeight.Bold
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBackPressed) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color(0xFF333333)
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.refreshLeaderboard() }) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = Color(0xFF333333)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFF5F5F5))
        ) {
            when {
                state.isLoading -> {
                    // Loading indicator
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            CircularProgressIndicator(
                                color = Color(0xFF2196F3)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "Loading leaderboard...",
                                color = Color(0xFF666666),
                                fontSize = 16.sp
                            )
                        }
                    }
                }

                state.errorMessage != null -> {
                    // Error state
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(32.dp)
                        ) {
                            Text(
                                text = "⚠️",
                                fontSize = 48.sp,
                                modifier = Modifier.padding(bottom = 16.dp)
                            )
                            Text(
                                text = "Oops! Something went wrong",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF333333),
                                modifier = Modifier.padding(bottom = 8.dp)
                            )
                            Text(
                                text = state.errorMessage,
                                fontSize = 14.sp,
                                color = Color(0xFF666666),
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(bottom = 24.dp)
                            )
                            Button(
                                onClick = { viewModel.refreshLeaderboard() },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color(0xFF2196F3)
                                )
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Refresh,
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Try Again")
                            }
                        }
                    }
                }

                state.members.isEmpty() -> {
                    // Empty state
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier.padding(32.dp)
                        ) {
                            Text(
                                text = "🏆",
                                fontSize = 48.sp,
                                modifier = Modifier.padding(bottom = 16.dp)
                            )
                            Text(
                                text = "No leaderboard data yet",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF333333),
                                modifier = Modifier.padding(bottom = 8.dp)
                            )
                            Text(
                                text = "Complete some tasks to see rankings!",
                                fontSize = 14.sp,
                                color = Color(0xFF666666),
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }

                else -> {
                    // Success state with data
                    LeaderboardContent(
                        members = state.members,
                        currentUserEmail = currentUserEmail // ⭐ Pass current user email
                    )
                }
            }
        }
    }
}

@Composable
fun LeaderboardContent(members: List<LeaderboardMember>, currentUserEmail: String) {
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(16.dp)
    ) {
        // Header with top 3 podium
        item {
            TopThreePodium(
                first = members.getOrNull(0),
                second = members.getOrNull(1),
                third = members.getOrNull(2),
                currentUserEmail = currentUserEmail // ⭐ Pass current user email
            )
            Spacer(modifier = Modifier.height(24.dp))
        }

        // Rest of the leaderboard (4th place and beyond)
        if (members.size > 3) {
            item {
                Text(
                    text = "Rankings",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF333333),
                    modifier = Modifier.padding(bottom = 16.dp)
                )
            }

            itemsIndexed(members.drop(3)) { index, member ->
                LeaderboardMemberCard(
                    member = member,
                    position = index + 4, // Since we dropped first 3, start from 4th
                    isCurrentUser = member.id == currentUserEmail // ⭐ Check if current user
                )
            }
        }
    }
}

@Composable
fun TopThreePodium(
    first: LeaderboardMember?,
    second: LeaderboardMember?,
    third: LeaderboardMember?,
    currentUserEmail: String // ⭐ Add current user email parameter
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
        border = if (first?.id == currentUserEmail || second?.id == currentUserEmail || third?.id == currentUserEmail) {
            BorderStroke(3.dp, Color(0xFF4CAF50)) // ⭐ Green border if current user is in top 3
        } else null
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "🏆 Top Performers",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF333333),
                modifier = Modifier.padding(bottom = 24.dp)
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.Bottom
            ) {
                // Second place
                second?.let {
                    PodiumPlace(
                        member = it,
                        position = 2,
                        podiumColor = Color(0xFFC0C0C0), // Silver
                        height = 80.dp,
                        isCurrentUser = it.id == currentUserEmail // ⭐ Check if current user
                    )
                }

                // First place
                first?.let {
                    PodiumPlace(
                        member = it,
                        position = 1,
                        podiumColor = Color(0xFFFFD700), // Gold
                        height = 100.dp,
                        showCrown = true,
                        isCurrentUser = it.id == currentUserEmail // ⭐ Check if current user
                    )
                }

                // Third place
                third?.let {
                    PodiumPlace(
                        member = it,
                        position = 3,
                        podiumColor = Color(0xFFCD7F32), // Bronze
                        height = 60.dp,
                        isCurrentUser = it.id == currentUserEmail // ⭐ Check if current user
                    )
                }
            }
        }
    }
}

@Composable
fun PodiumPlace(
    member: LeaderboardMember,
    position: Int,
    podiumColor: Color,
    height: Dp,
    showCrown: Boolean = false,
    isCurrentUser: Boolean = false // ⭐ Add current user parameter
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(80.dp)
    ) {
        // Crown for first place
        if (showCrown) {
            Text(
                text = "👑",
                fontSize = 24.sp,
                modifier = Modifier.padding(bottom = 4.dp)
            )
        }

        // Profile image (using logo as placeholder)
        Box(
            modifier = Modifier
                .size(60.dp)
                .clip(CircleShape)
                .background(
                    brush = Brush.radialGradient(
                        colors = listOf(podiumColor.copy(alpha = 0.3f), podiumColor.copy(alpha = 0.1f))
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Image(
                painter = painterResource(id = R.drawable.logo),
                contentDescription = "${member.fullName} profile",
                modifier = Modifier
                    .size(50.dp)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Member name
        Text(
            text = if (isCurrentUser) "${member.fullName} (You)" else member.fullName, // ⭐ Add "(You)" for current user
            fontSize = 12.sp,
            fontWeight = if (isCurrentUser) FontWeight.Bold else FontWeight.Medium, // ⭐ Bold for current user
            color = if (isCurrentUser) Color(0xFF4CAF50) else Color(0xFF333333), // ⭐ Green for current user
            textAlign = TextAlign.Center,
            maxLines = 2
        )

        // Score
        Text(
            text = "${member.score} pts",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = podiumColor
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Podium base
        Box(
            modifier = Modifier
                .width(60.dp)
                .height(height)
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(podiumColor, podiumColor.copy(alpha = 0.7f))
                    ),
                    shape = RoundedCornerShape(topStart = 8.dp, topEnd = 8.dp)
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = position.toString(),
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }
    }
}

@Composable
fun LeaderboardMemberCard(member: LeaderboardMember, position: Int, isCurrentUser: Boolean = false) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isCurrentUser) Color(0xFFF1F8E9) else Color.White // ⭐ Light green background for current user
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isCurrentUser) 6.dp else 2.dp), // ⭐ Higher elevation for current user
        border = if (isCurrentUser) {
            BorderStroke(2.dp, Color(0xFF4CAF50)) // ⭐ Green border for current user
        } else null
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Position number
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(
                        color = Color(0xFFE0E0E0),
                        shape = CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = position.toString(),
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = Color(0xFF333333)
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Profile image
            Image(
                painter = painterResource(id = R.drawable.logo),
                contentDescription = "${member.fullName} profile",
                modifier = Modifier
                    .size(50.dp)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop
            )

            Spacer(modifier = Modifier.width(16.dp))

            // Member info
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = member.fullName,
                        fontWeight = FontWeight.Medium,
                        fontSize = 16.sp,
                        color = Color(0xFF333333)
                    )
                    if (isCurrentUser) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "You", // ⭐ Add "You" indicator
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = Color.White,
                            modifier = Modifier
                                .background(
                                    Color(0xFF4CAF50),
                                    RoundedCornerShape(8.dp)
                                )
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
                Text(
                    text = "${member.completedTasks} tasks completed",
                    fontSize = 12.sp,
                    color = Color(0xFF666666)
                )
            }

            // Score
            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = "${member.score}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = Color(0xFF2196F3)
                )
                Text(
                    text = "points",
                    fontSize = 12.sp,
                    color = Color(0xFF666666)
                )
            }
        }
    }
}