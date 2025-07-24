package com.khader.householdhero.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Home : Screen("home")
    object ForgotPassword : Screen("forgot-password")
    object ResetPassword : Screen("reset-password")
}