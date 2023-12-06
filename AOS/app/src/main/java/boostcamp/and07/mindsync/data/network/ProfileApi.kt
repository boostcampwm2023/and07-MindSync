package boostcamp.and07.mindsync.data.network

import boostcamp.and07.mindsync.data.network.response.ProfileResponse
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path

interface ProfileApi {
    @POST("profiles")
    @Multipart
    suspend fun addProfile(
        @Part("nickname")
        nickname: RequestBody,
        @Part image: MultipartBody.Part?,
    ): Response<ProfileResponse>

    @GET("profiles/{profile_uuid}")
    suspend fun getProfile(
        @Path("profile_uuid") uuid: String = "11ee9388fa933210a70e3f107ae3ec5d",
    ): Response<ProfileResponse>
}
