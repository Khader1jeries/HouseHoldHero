package com.khader.householdhero.model

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class ResetPasswordRequest(
    val email: String,
    val password: String  // Changed from 'newPassword' to 'password' to match backend
)