//package com.khader.householdhero.repository
//
//import com.khader.householdhero.model.DocumentResponse
//import com.khader.householdhero.network.RetrofitInstance
//import retrofit2.Response
//
//class MemberRepository {
//
//    // Get all members from the "members" collection
//    suspend fun getMembers(): Response<DocumentResponse> {
//        return RetrofitInstance.api.getCollection("members")
//    }
//
//    // Login: check if a member exists with matching email and password
//    suspend fun login(email: String, password: String): Boolean {
//        val response = getMembers()
//
//        if (response.isSuccessful) {
//            val documents = response.body()?.documents ?: return false
//
//            for (doc in documents) {
//                val fields = doc["fields"] as? Map<String, Any> ?: continue
//                val emailField = fields["email"] as? Map<String, String>
//                val passwordField = fields["password"] as? Map<String, String>
//
//                if (emailField?.get("stringValue") == email &&
//                    passwordField?.get("stringValue") == password
//                ) {
//                    return true
//                }
//            }
//        }
//
//        return false
//    }
//}
