package com.khader.householdhero.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Home : Screen("home")
    // Add more screens here later
}