package com.khader.householdhero.repository

import com.khader.householdhero.api.MemberApi

import com.khader.householdhero.model.LoginRequest
import com.khader.householdhero.model.LoginResponse


class MemberRepository(private val api: MemberApi) {

    suspend fun login(email: String, password: String): Result<LoginResponse> {
        return try {
            val response = api.loginMember(LoginRequest(email, password))
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    suspend fun checkIfUserExists(email: String): Result<LoginResponse> {
        return try {
            val response = api.checkIfUserExists(email)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}