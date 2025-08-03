package com.khader.householdhero.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.khader.householdhero.ui.forgotPassword.ForgotPasswordScreen
import com.khader.householdhero.ui.leaderboard.LeaderboardScreen
import com.khader.householdhero.ui.profile.EditProfileScreen
import com.khader.householdhero.ui.profile.ProfileScreen
import com.khader.householdhero.ui.resetPassword.ResetPasswordScreen
import com.khader.householdhero.ui.settings.SettingsScreen
import com.khader.householdhero.ui.settings.notifications.NotificationsScreen
import com.khader.householdhero.ui.settings.privacy.PrivacyScreen
import com.khader.householdhero.ui.tasks.activeTasks.ActiveTasksScreen
import com.khader.householdhero.ui.tasks.futureTasks.FutureTasksScreen
import com.khader.householdhero.ui.tasks.votes.VotingTasksScreen
import com.khader.householdhero.ui.tasks.activeTasks.FinishedTasksScreen
import com.khader.householdhero.ui.tasks.activeTasks.taskDetails.ActiveTaskDetailsScreen
import com.khader.householdhero.ui.tasks.finishedTasks.taskDetails.FinishedTaskDetailsScreen
import com.khader.householdhero.ui.tasks.futureTasks.taskDetails.FutureTaskDetailsScreen
import com.khader.householdhero.ui.tasks.votes.taskDetails.VoteDetailsScreen
import com.khader.householdhero.ui.theme.login.LoginScreen
import com.khader.householdhero.ui.theme.home.HomeScreen
import com.khader.householdhero.ui.verfication.VerficationScreen

@Composable
fun AppNavHost(navController: NavHostController) {
    NavHost(navController = navController, startDestination = Screen.Login.route) {
        composable(route = Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onForgotPassword = {
                    navController.navigate(Screen.ForgotPassword.route)
                }
            )
        }

        composable(route = Screen.Home.route) {
            HomeScreen(
                onSettingsClick = {
                    println("Settings clicked - navigating to settings")
                    navController.navigate(Screen.Settings.route)
                },
                onNavigateToActiveTasks = {
                    navController.navigate(Screen.ActiveTasks.route)
                },
                onNavigateToVotingTasks = {
                    navController.navigate(Screen.VotingTasks.route)
                },
                onNavigateToFutureTasks = {
                    navController.navigate(Screen.FutureTasks.route)
                },
                onNavigateToFinishedTasks = {
                    navController.navigate(Screen.FinishedTasks.route)
                },
                onNavigateToLeaderboard = {
                    navController.navigate(Screen.Leaderboard.route)
                },
                onNavigateToProfile={
                    navController.navigate(Screen.Profile.route)
                },
                onNotifications={
                    navController.navigate(Screen.Notification.route)
                }
            )
        }

        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(
                onBackToLogin = {
                    navController.popBackStack(Screen.Login.route, inclusive = false)
                },
                onEmailExists = { email ->
                    navController.navigate("${Screen.Verfication.route}/$email")
                }
            )
        }
        composable(Screen.Verfication.route) {backStackEntry ->
            val email = backStackEntry.arguments?.getString("email") ?: ""
            VerficationScreen(
                email = email,
                onBackToLogin = {
                    navController.popBackStack(Screen.Login.route, inclusive = false)
                },
                onVerfication = { email ->
                    navController.navigate("${Screen.ResetPassword.route}/$email")
                },

            )
        }
        composable("${Screen.ResetPassword.route}/{email}") { backStackEntry ->
            val email = backStackEntry.arguments?.getString("email") ?: ""
            ResetPasswordScreen(
                email = email,
                onPasswordResetSuccess = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onBackToLogin = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Settings.route) {
            SettingsScreen(
                onBackPressed = {
                    navController.popBackStack()
                },
                onEditProfile = {
                    navController.navigate(Screen.EditProfile.route)
                },
                onPrivacy={
                    navController.navigate(Screen.Privacy.route)
                },
                onNotifications={
                    navController.navigate(Screen.Notification.route)
                },
                onLogOut = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
        composable(Screen.EditProfile.route) {
            EditProfileScreen(
                onBackPressed = {
                    navController.popBackStack()
                },
                onProfileUpdated = {
                    // Navigate back to settings or profile after successful update
                    navController.popBackStack()
                }
            )
        }
        composable(Screen.Privacy.route) {
            PrivacyScreen(
                onBackPressed = {
                    navController.popBackStack()
                },
                onNavigateToLogin = {
                    // Navigate to login and clear the entire back stack
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
        composable(Screen.Notification.route) {
            NotificationsScreen(
                onBackPressed = {
                    navController.popBackStack()
                }

            )
        }
        composable(Screen.Leaderboard.route) {
            LeaderboardScreen(
                onBackPressed = {
                    navController.popBackStack()
                }
            )
        }
        composable(Screen.Profile.route) {
            ProfileScreen(
                onBackPressed = {
                    navController.popBackStack()
                }
            )
        }
        composable(Screen.ActiveTasks.route) {
            ActiveTasksScreen(
                onBackPressed = {
                    navController.popBackStack()
                },
                onTaskClick = { taskId ->
                    navController.navigate("${Screen.ActiveTaskDetails.route}/$taskId")
                }
            )
        }

// Add the new ActiveTaskDetails route
        composable("${Screen.ActiveTaskDetails.route}/{taskId}") { backStackEntry ->
            val taskId = backStackEntry.arguments?.getString("taskId") ?: ""

            ActiveTaskDetailsScreen(
                taskId = taskId,
                onBackPressed = {
                    navController.popBackStack()
                }
            )
        }

        composable(Screen.VotingTasks.route) {
            VotingTasksScreen(
                onBackPressed = {
                    navController.popBackStack()
                }, onTaskClick = { taskId ->
                    navController.navigate("${Screen.VoteDetails.route}/$taskId")
                }
            )
        }
        composable("${Screen.VoteDetails.route}/{taskId}") { backStackEntry ->
            val taskId = backStackEntry.arguments?.getString("taskId") ?: ""

            VoteDetailsScreen(
                taskId = taskId,
                onBackPressed = {
                    navController.popBackStack()
                }
            )
        }
        composable(Screen.FutureTasks.route) {
            FutureTasksScreen(
                onBackPressed = {
                    navController.popBackStack()
                },
                onTaskClick = { taskId ->
                    navController.navigate("${Screen.FutureTaskDetails.route}/$taskId")
                }
            )
        }
        composable("${Screen.FutureTaskDetails.route}/{taskId}") { backStackEntry ->
            val taskId = backStackEntry.arguments?.getString("taskId") ?: ""

            FutureTaskDetailsScreen(
                taskId = taskId,
                onBackPressed = {
                    navController.popBackStack()
                }
            )
        }

        composable(Screen.FinishedTasks.route) {
            FinishedTasksScreen(
                onBackPressed = {
                    navController.popBackStack()
                },
                onTaskClick = { taskId ->
                    navController.navigate("${Screen.FinishedTaskDetails.route}/$taskId")
                }
            )
        }


        composable("${Screen.FinishedTaskDetails.route}/{taskId}") { backStackEntry ->
            val taskId = backStackEntry.arguments?.getString("taskId") ?: ""

            FinishedTaskDetailsScreen(
                taskId = taskId,
                onBackPressed = {
                    navController.popBackStack()
                }
            )
        }
    }
}