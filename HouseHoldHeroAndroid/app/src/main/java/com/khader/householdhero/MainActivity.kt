package com.khader.householdhero

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.google.firebase.FirebaseApp
import com.khader.householdhero.navigation.AppNavHost
import com.khader.householdhero.ui.theme.HouseHoldHeroTheme
import com.khader.householdhero.ui.theme.login.LoginScreen
import android.app.Application
import com.jakewharton.threetenabp.AndroidThreeTen
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        AndroidThreeTen.init(this)
        Log.d("MainActivity", "onCreate called") // Diagnostic log

        setContent {
            HouseHoldHeroTheme {
                Surface(color = MaterialTheme.colorScheme.background) {
                    val navController = rememberNavController()

                    // STEP 1: comment AppNavHost, test with simple text
                    // Text("App Loaded")

                    // STEP 2: Uncomment AppNavHost after confirming the above works
                    AppNavHost(navController = navController)
                }
            }
        }
    }
}

