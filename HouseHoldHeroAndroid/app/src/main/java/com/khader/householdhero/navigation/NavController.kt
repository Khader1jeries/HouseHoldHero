package com.khader.householdhero.navigation

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.khader.householdhero.ui.forgotPassword.ForgotPasswordScreen
import com.khader.householdhero.ui.resetPassword.ResetPasswordScreen
import com.khader.householdhero.ui.settings.SettingsScreen
import com.khader.householdhero.ui.tasks.ActiveTasksScreen
import com.khader.householdhero.ui.tasks.FinishedTasksScreen
import com.khader.householdhero.ui.tasks.FutureTasksScreen
import com.khader.householdhero.ui.tasks.VotingTasksScreen
import com.khader.householdhero.ui.theme.login.LoginScreen
import com.khader.householdhero.ui.theme.home.HomeScreen

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
                }
            )
        }

        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(
                onBackToLogin = {
                    navController.popBackStack(Screen.Login.route, inclusive = false)
                },
                onEmailExists = { email ->
                    navController.navigate("${Screen.ResetPassword.route}/$email")
                }
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
                }
            )
        }

        // Task screens
        composable(Screen.ActiveTasks.route) {
            ActiveTasksScreen(
                onBackPressed = {
                    navController.popBackStack()
                }
            )
        }

        composable(Screen.VotingTasks.route) {
            VotingTasksScreen(
                onBackPressed = {
                    navController.popBackStack()
                }
            )
        }

        composable(Screen.FutureTasks.route) {
            FutureTasksScreen(
                onBackPressed = {
                    navController.popBackStack()
                }
            )
        }

        composable(Screen.FinishedTasks.route) {
            FinishedTasksScreen(
                onBackPressed = {
                    navController.popBackStack()
                }
            )
        }
    }
}