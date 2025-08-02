package com.khader.householdhero.ui.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.khader.householdhero.network.RetrofitInstance
import com.khader.householdhero.repository.MemberRepository
import com.khader.householdhero.ui.settings.editProfile.EditProfileViewModelFactory
import com.khader.householdhero.ui.theme.PrimaryColor
import com.khader.householdhero.ui.theme.TextColor

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileScreen(
    onBackPressed: () -> Unit = {},
    onProfileUpdated: () -> Unit = {}
) {
    val context = LocalContext.current
    val repository = remember { MemberRepository(RetrofitInstance.memberApi, context) }
    val factory = remember { EditProfileViewModelFactory(repository) }
    val viewModel: EditProfileViewModel = viewModel(factory = factory)



    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var countryCode by remember { mutableStateOf("+1") }

    // UI state
    var isLoading by remember { mutableStateOf(false) }
    var showSuccessMessage by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // Load member data on first composition
    LaunchedEffect(Unit) {
        viewModel.fetchMember()
    }

    // Observe member data and populate form fields
    LaunchedEffect(viewModel.member) {
        viewModel.member?.getOrNull()?.let { member ->
            email =  member.id
            phone = member.phoneNumber
            firstName =  member.firstName
            lastName = member.lastName
            countryCode=member.countryCode
        }
    }

    // Observe update result
    LaunchedEffect(viewModel.updateResult) {
        viewModel.updateResult?.let { result ->
            isLoading = false
            result.onSuccess {
                showSuccessMessage = true
                errorMessage = null
                // Auto-hide success message after 3 seconds
                kotlinx.coroutines.delay(3000)
                showSuccessMessage = false
                onProfileUpdated()
            }.onFailure {
                errorMessage = it.localizedMessage
                showSuccessMessage = false
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Edit Profile",
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackPressed) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = PrimaryColor
                )
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Profile Image Section
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {

                        // Profile Information Form
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(20.dp)
                            ) {
                                Text(
                                    text = "Profile Information",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = TextColor,
                                    modifier = Modifier.padding(bottom = 16.dp)
                                )

                                // Success Message
                                if (showSuccessMessage) {
                                    Card(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(bottom = 16.dp),
                                        colors = CardDefaults.cardColors(
                                            containerColor = Color(
                                                0xFFE8F5E8
                                            )
                                        ),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(12.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.CheckCircle,
                                                contentDescription = "Success",
                                                tint = Color(0xFF4CAF50),
                                                modifier = Modifier.size(20.dp)
                                            )
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(
                                                text = "Profile updated successfully!",
                                                color = Color(0xFF2E7D32),
                                                fontSize = 14.sp
                                            )
                                        }
                                    }
                                }

                                // Error Message
                                errorMessage?.let { error ->
                                    Card(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(bottom = 16.dp),
                                        colors = CardDefaults.cardColors(
                                            containerColor = Color(
                                                0xFFFFEBEE
                                            )
                                        ),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(12.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Error,
                                                contentDescription = "Error",
                                                tint = Color(0xFFE53935),
                                                modifier = Modifier.size(20.dp)
                                            )
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(
                                                text = error,
                                                color = Color(0xFFC62828),
                                                fontSize = 14.sp
                                            )
                                        }
                                    }
                                }

                                // Email Field (Read-only)
                                OutlinedTextField(
                                    value = email,
                                    onValueChange = { },
                                    label = { Text("Email") },
                                    leadingIcon = {
                                        Icon(
                                            imageVector = Icons.Default.Email,
                                            contentDescription = "Email"
                                        )
                                    },
                                    enabled = false,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(bottom = 16.dp),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        disabledBorderColor = Color(0xFFE0E0E0),
                                        disabledLabelColor = Color(0xFF9E9E9E)
                                    )
                                )
                                // First Name Field
                                OutlinedTextField(
                                    value = firstName,
                                    onValueChange = { firstName = it },
                                    label = { Text("First Name") },
                                    leadingIcon = {
                                        Icon(
                                            imageVector = Icons.Default.Person,
                                            contentDescription = "First Name"
                                        )
                                    },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(bottom = 16.dp),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = PrimaryColor,
                                        focusedLabelColor = PrimaryColor
                                    )
                                )

                                // Last Name Field
                                OutlinedTextField(
                                    value = lastName,
                                    onValueChange = { lastName = it },
                                    label = { Text("Last Name") },
                                    leadingIcon = {
                                        Icon(
                                            imageVector = Icons.Default.Person,
                                            contentDescription = "Last Name"
                                        )
                                    },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(bottom = 16.dp),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = PrimaryColor,
                                        focusedLabelColor = PrimaryColor
                                    )
                                )



                                // Phone Number Field
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(bottom = 16.dp),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    // Country Code
                                    CountryCodeSelector(
                                        selectedCode = countryCode,
                                        onCodeSelected = { countryCode = it }
                                    )

                                    // Phone Number
                                    OutlinedTextField(
                                        value = phone,
                                        onValueChange = { phone = it },
                                        label = { Text("Phone Number") },
                                        leadingIcon = {
                                            Icon(
                                                imageVector = Icons.Default.Phone,
                                                contentDescription = "Phone"
                                            )
                                        },
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                        modifier = Modifier.weight(1f),
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedBorderColor = PrimaryColor,
                                            focusedLabelColor = PrimaryColor
                                        )
                                    )
                                }

                                Spacer(modifier = Modifier.height(24.dp))

                                // Action Buttons
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    // Cancel Button
                                    OutlinedButton(
                                        onClick = onBackPressed,
                                        modifier = Modifier.weight(1f),
                                        colors = ButtonDefaults.outlinedButtonColors(
                                            contentColor = PrimaryColor
                                        ),
                                        border = ButtonDefaults.outlinedButtonBorder.copy(
                                            brush = Brush.horizontalGradient(
                                                listOf(
                                                    PrimaryColor,
                                                    PrimaryColor
                                                )
                                            )
                                        )
                                    ) {
                                        Text("Cancel")
                                    }

                                    // Save Button
                                    Button(
                                        onClick = {
                                            if (email.isNotBlank()&&firstName.isNotBlank() && lastName.isNotBlank()&&phone.isNotBlank()&&countryCode.isNotBlank()) {
                                                isLoading = true
                                                errorMessage = null
                                                viewModel.updateProfile(
                                                    email=email,
                                                    firstName = firstName,
                                                    lastName = lastName,
                                                    phone = phone,
                                                    countryCode = countryCode
                                                )
                                            } else {
                                                errorMessage = "Please fill in all required fields"
                                            }
                                        },
                                        enabled = !isLoading,
                                        modifier = Modifier.weight(1f),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = PrimaryColor,
                                            contentColor = Color.White
                                        )
                                    ) {
                                        if (isLoading) {
                                            CircularProgressIndicator(
                                                modifier = Modifier.size(16.dp),
                                                color = Color.White,
                                                strokeWidth = 2.dp
                                            )
                                        } else {
                                            Text("Save Changes")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }}}
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CountryCodeSelector(
    selectedCode: String,
    onCodeSelected: (String) -> Unit
) {
    val options = listOf(
        "+1 🇺🇸 (USA)",
        "+44 🇬🇧 (UK)",
        "+91 🇮🇳 (India)",
        "+33 🇫🇷 (France)",
        "+49 🇩🇪 (Germany)",
        "+972 🇮🇱 (Israel)"
    )

    var expanded by remember { mutableStateOf(false) }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = !expanded }
    ) {
        OutlinedTextField(
            value = selectedCode,
            onValueChange = {}, // not editable directly
            readOnly = true,
            label = { Text("Code") },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
            modifier = Modifier
                .menuAnchor()
                .width(140.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = PrimaryColor,
                focusedLabelColor = PrimaryColor
            )
        )

        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            options.forEach { option ->
                DropdownMenuItem(
                    text = { Text(option) },
                    onClick = {
                        onCodeSelected(option.substringBefore(" ")) // e.g. "+1"
                        expanded = false
                    }
                )
            }
        }
    }
}