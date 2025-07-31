package com.khader.householdhero.ui.forgotPassword

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.khader.householdhero.viewmodel.ForgotPasswordViewModel
import com.khader.householdhero.network.RetrofitInstance
import com.khader.householdhero.repository.MemberRepository

@Composable
fun ForgotPasswordScreen(
    onBackToLogin: () -> Unit,
    onEmailExists: (String) -> Unit
) {
    val context = LocalContext.current
    val repository = remember { MemberRepository(RetrofitInstance.memberApi, context) }
    val viewModel: ForgotPasswordViewModel = viewModel { ForgotPasswordViewModel(repository) }

    var email by remember { mutableStateOf("") }

    // Handle successful email check
    LaunchedEffect(viewModel.result) {
        viewModel.result?.let { result ->
            result.onSuccess { response ->
                if (response.success) {
                    // Email exists, navigate to reset password screen
                    onEmailExists(email)
                }
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Forgot Password",
            style = MaterialTheme.typography.titleLarge
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Enter your email address to check if you have an account",
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        OutlinedTextField(
            value = email,
            onValueChange = {
                email = it
                // Clear previous result when user types
                viewModel.clearResult()
            },
            label = { Text("Enter your email") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = {
                viewModel.checkEmail(email)
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = !viewModel.isLoading && email.isNotBlank()
        ) {
            if (viewModel.isLoading) {
                Row(
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        color = MaterialTheme.colorScheme.onPrimary,
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Checking...")
                }
            } else {
                Text("Check Email")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Display result message
        viewModel.result?.let { result ->
            result.onSuccess { response ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = if (response.success)
                            MaterialTheme.colorScheme.primaryContainer
                        else
                            MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Text(
                        text = response.message,
                        modifier = Modifier.padding(16.dp),
                        color = if (response.success)
                            MaterialTheme.colorScheme.onPrimaryContainer
                        else
                            MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }.onFailure { exception ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Text(
                        text = "Error: ${exception.localizedMessage}",
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        TextButton(onClick = onBackToLogin) {
            Text("Back to Login")
        }
    }
}