package boostcamp.and07.mindsync.data.network

import boostcamp.and07.mindsync.data.network.request.NewAccessTokenRequest
import boostcamp.and07.mindsync.data.network.response.NewAccessTokenResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface TokenApi {
    @POST("auth/token")
    suspend fun postNewAccessToken(
        @Body newAccessTokenRequest: NewAccessTokenRequest,
    ): Response<NewAccessTokenResponse>
}
