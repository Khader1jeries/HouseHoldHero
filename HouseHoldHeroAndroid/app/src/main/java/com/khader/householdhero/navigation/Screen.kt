package com.khader.householdhero.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Home : Screen("home")
    object ForgotPassword : Screen("forgot-password")
    object ResetPassword : Screen("reset-password")
    object Settings : Screen("settings")

    // Task screens
    object ActiveTasks : Screen("active-tasks")
    object VotingTasks : Screen("voting-tasks")
    object FutureTasks : Screen("future-tasks")
    object FinishedTasks : Screen("finished-tasks")
}