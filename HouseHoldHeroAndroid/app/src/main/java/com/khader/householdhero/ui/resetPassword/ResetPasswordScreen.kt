package com.khader.householdhero.ui.resetPassword

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.khader.householdhero.network.RetrofitInstance
import com.khader.householdhero.repository.MemberRepository
import com.khader.householdhero.viewmodel.ResetPasswordViewModel
import com.khader.householdhero.viewmodel.ResetPasswordViewModelFactory

@Composable
fun ResetPasswordScreen(
    email: String,
    onPasswordResetSuccess: () -> Unit,
    onBackToLogin: () -> Unit
) {
    val context = LocalContext.current
    val repository = remember { MemberRepository(RetrofitInstance.memberApi, context) }
    val factory = remember { ResetPasswordViewModelFactory(repository) }
    val viewModel: ResetPasswordViewModel = viewModel(factory = factory)

    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var showNewPassword by remember { mutableStateOf(false) }
    var showConfirmPassword by remember { mutableStateOf(false) }

    // Watch for successful password reset
    LaunchedEffect(viewModel.result) {
        viewModel.result?.let { result ->
            result.onSuccess { response ->
                if (response.success) {
                    // Wait a bit to show success message, then navigate
                    kotlinx.coroutines.delay(1500)
                    onPasswordResetSuccess()
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
            text = "Reset Password",
            style = MaterialTheme.typography.titleLarge
        )

        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Enter a new password for: $email",
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(24.dp)) {
                OutlinedTextField(
                    value = newPassword,
                    onValueChange = {
                        newPassword = it
                        viewModel.clearResult()
                    },
                    label = { Text("New Password") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    visualTransformation = if (showNewPassword) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        TextButton(onClick = { showNewPassword = !showNewPassword }) {
                            Text(if (showNewPassword) "Hide" else "Show")
                        }
                    },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = confirmPassword,
                    onValueChange = {
                        confirmPassword = it
                        viewModel.clearResult()
                    },
                    label = { Text("Confirm Password") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    visualTransformation = if (showConfirmPassword) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        TextButton(onClick = { showConfirmPassword = !showConfirmPassword }) {
                            Text(if (showConfirmPassword) "Hide" else "Show")
                        }
                    },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                )

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = {
                        viewModel.resetPassword(email, newPassword, confirmPassword)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(32.dp),
                    enabled = !viewModel.isLoading && newPassword.isNotBlank() && confirmPassword.isNotBlank()
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
                            Text("Changing Password...")
                        }
                    } else {
                        Text("Change Password")
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                TextButton(onClick = onBackToLogin) {
                    Text("Back to Login")
                }
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
                    ),
                    shape = RoundedCornerShape(8.dp)
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
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "Error: ${exception.localizedMessage ?: "Unknown error"}",
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }
        }
    }
}