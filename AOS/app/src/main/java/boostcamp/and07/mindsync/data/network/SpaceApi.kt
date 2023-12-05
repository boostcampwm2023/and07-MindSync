package boostcamp.and07.mindsync.data.network

import boostcamp.and07.mindsync.data.network.response.space.SpaceResponse
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface SpaceApi {
    @POST("spaces")
    @Multipart
    suspend fun addSpace(
        @Part("name") name: RequestBody,
        @Part icon: MultipartBody.Part?,
    ): Response<SpaceResponse>
}
