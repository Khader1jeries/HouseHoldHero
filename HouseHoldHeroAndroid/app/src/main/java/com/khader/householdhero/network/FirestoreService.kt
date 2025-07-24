package com.khader.householdhero.network


import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.Response
import com.khader.householdhero.model.DocumentResponse

interface FirestoreService {
    @GET("{collection}")
    suspend fun getCollection(
        @Path("collection") collection: String,
        @Query("pageSize") pageSize: Int = 10
    ): Response<DocumentResponse>
}
