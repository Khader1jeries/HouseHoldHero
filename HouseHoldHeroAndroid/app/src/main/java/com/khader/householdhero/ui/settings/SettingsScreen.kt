package com.khader.householdhero.ui.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.khader.householdhero.ui.theme.HouseHoldHeroTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onBackPressed: () -> Unit = {},
    onEditProfile: () -> Unit = {},
    onSecurity: () -> Unit = {},
    onPrivacy: () -> Unit = {},
    onContactAdmin: () -> Unit = {},
    onHelpSupport: () -> Unit = {},
    onTermsPolicies: () -> Unit = {},
    onReportProblem: () -> Unit = {},
    onLogOut: () -> Unit = {}
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = null,
                            tint = Color(0xFF000000),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Settings",
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
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                )
            )
        },
        containerColor = Color(0xFFF5F5F5) // Same grey background as home screen
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Spacer(modifier = Modifier.height(8.dp))

            // Account Section
            SettingsSection(
                title = "Account",
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.Person,
                        title = "Edit Profile",
                        onClick = onEditProfile
                    ),
                    SettingsItem(
                        icon = Icons.Default.Lock,
                        title = "Security",
                        onClick = onSecurity
                    ),
                    SettingsItem(
                        icon = Icons.Default.Lock,
                        title = "Privacy",
                        onClick = onPrivacy
                    ),
                    SettingsItem(
                        icon = Icons.Default.Email,
                        title = "Contact the Admin",
                        onClick = onContactAdmin
                    )
                )
            )

            // Support & About Section
            SettingsSection(
                title = "Support & About",
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.Info,
                        title = "Help & Support",
                        onClick = onHelpSupport
                    ),
                    SettingsItem(
                        icon = Icons.Default.Info,
                        title = "Terms and Policies",
                        onClick = onTermsPolicies
                    )
                )
            )

            // Actions Section
            SettingsSection(
                title = "Actions",
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.Info,
                        title = "Report a problem",
                        onClick = onReportProblem
                    ),
                    SettingsItem(
                        icon = Icons.Default.ExitToApp,
                        title = "Log out",
                        onClick = onLogOut,
                        isDestructive = true
                    )
                )
            )

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun SettingsSection(
    title: String,
    items: List<SettingsItem>
) {
    Column {
        // Section Title
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF333333),
            modifier = Modifier.padding(bottom = 8.dp)
        )

        // Section Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(vertical = 8.dp)
            ) {
                items.forEachIndexed { index, item ->
                    SettingsItemRow(
                        item = item,
                        showDivider = index < items.size - 1
                    )
                }
            }
        }
    }
}

@Composable
fun SettingsItemRow(
    item: SettingsItem,
    showDivider: Boolean = true
) {
    Column {
        Surface(
            onClick = item.onClick,
            color = Color.Transparent
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Icon
                Icon(
                    imageVector = item.icon,
                    contentDescription = item.title,
                    modifier = Modifier.size(24.dp),
                    tint = if (item.isDestructive) Color(0xFFE53E3E) else Color(0xFF666666)
                )

                Spacer(modifier = Modifier.width(16.dp))

                // Title
                Text(
                    text = item.title,
                    style = MaterialTheme.typography.bodyLarge,
                    color = if (item.isDestructive) Color(0xFFE53E3E) else Color(0xFF333333),
                    modifier = Modifier.weight(1f)
                )

                // Arrow Icon
                Icon(
                    imageVector = Icons.Default.ArrowForward,
                    contentDescription = "Go to ${item.title}",
                    modifier = Modifier.size(20.dp),
                    tint = Color(0xFF999999)
                )
            }
        }

        // Divider
        if (showDivider) {
            Divider(
                modifier = Modifier.padding(horizontal = 20.dp),
                color = Color(0xFFE0E0E0),
                thickness = 1.dp
            )
        }
    }
}

data class SettingsItem(
    val icon: ImageVector,
    val title: String,
    val onClick: () -> Unit,
    val isDestructive: Boolean = false
)

