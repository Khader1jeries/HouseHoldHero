package com.khader.householdhero.navigation

import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.khader.householdhero.ui.forgotPassword.ForgotPasswordScreen
import com.khader.householdhero.ui.theme.login.LoginScreen
import com.khader.householdhero.ui.theme.home.HomeScreen

@Composable
fun AppNavHost(navController: NavHostController) {
    NavHost(navController = navController, startDestination = Screen.Login.route) {
        composable(route = Screen.Login.route) {
            LoginScreen(   onLoginSuccess = {
                navController.navigate(Screen.Home.route) {
                    popUpTo(Screen.Login.route) { inclusive = true }
                }
            },
                onForgotPassword = {
                    navController.navigate(Screen.ForgotPassword.route)
                })
        }

        composable(route = Screen.Home.route) {
            HomeScreen()
        }
        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(
                onBackToLogin = {
                    navController.popBackStack(Screen.Login.route, inclusive = false)
                }
            )
        }
    }

}
