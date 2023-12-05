package boostcamp.and07.mindsync.data.network

import boostcamp.and07.mindsync.data.network.response.space.SpaceResponse
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Query

interface SpaceApi {
    @POST("spaces")
    @Multipart
    suspend fun addSpace(
        @Query("name") name: String,
        @Part icon: MultipartBody.Part?,
    ): Response<SpaceResponse>
}
