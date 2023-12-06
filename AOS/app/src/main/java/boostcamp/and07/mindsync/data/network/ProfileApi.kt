package boostcamp.and07.mindsync.data.network

import boostcamp.and07.mindsync.data.network.response.ProfileDTO
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.PATCH
import retrofit2.http.Part

interface ProfileApi {
    @GET("profiles")
    suspend fun getProfile(): ProfileDTO

    @PATCH("profiles")
    @Multipart
    suspend fun patchProfile(
        @Part("nickname") nickname: RequestBody,
        @Part image: MultipartBody.Part?,
    ): ProfileDTO
}
