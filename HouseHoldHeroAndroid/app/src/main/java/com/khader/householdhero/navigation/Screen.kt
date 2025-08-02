package com.khader.householdhero.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Home : Screen("home")
    object ForgotPassword : Screen("forgot-password")
    object ResetPassword : Screen("reset-password")
    object Settings : Screen("settings")
    object Tasks : Screen("tasks")
    object Leaderboard : Screen("leaderboard")
    object Profile:Screen("profile")
    // Task screens
    object ActiveTasks : Screen("active-tasks")
    object VotingTasks : Screen("voting-tasks")
    object FutureTasks : Screen("future-tasks")
    object FinishedTasks : Screen("finished-tasks")


    object ActiveTaskDetails : Screen("active-task-details")
    object FinishedTaskDetails : Screen("finished-task-details")
    object FutureTaskDetails : Screen("future-task-details")
    object VoteDetails : Screen("vote-details")

    object EditProfile:Screen("edit-profile")
    object Privacy: Screen("privacy")
}