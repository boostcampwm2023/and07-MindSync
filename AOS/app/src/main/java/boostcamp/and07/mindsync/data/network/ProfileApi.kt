package boostcamp.and07.mindsync.data.network

import boostcamp.and07.mindsync.data.network.response.ProfileResponse
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.Header
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part

interface ProfileApi {
    @POST("profiles")
    @Multipart
    suspend fun addProfile(
        @Part("nickname")
        nickname: RequestBody,
        @Part image: MultipartBody.Part?,
        @Header(
            "authorization",
        ) accessToken: String = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4OWRhNmQ5Zi1iNTg4LTQyOWUtODk4OC1mZjM4YTk4NmYzMjYiLCJlbWFpbCI6ImRsdGtkMTM5NTZAa2FrYW8uY29tIiwiaWF0IjoxNzAxNzg2ODU5LCJleHAiOjE3MDE3ODcxNTl9.CoSxfm3U4xXHNI31HskAx61Sg9wxI6Wem5_YXHUx4ts",
    ): Response<ProfileResponse>
}
