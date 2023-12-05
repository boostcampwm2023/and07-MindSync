package boostcamp.and07.mindsync.data.network

import boostcamp.and07.mindsync.data.network.request.NewAccessTokenRequest
import boostcamp.and07.mindsync.data.network.response.NewAccessTokenResponse
import retrofit2.Response
import retrofit2.http.Body

interface TokenApi {
    // TODO : 서버 명세서 받으면 수정
    suspend fun getNewAccessToken(
        @Body newAccessTokenRequest: NewAccessTokenRequest,
    ): Response<NewAccessTokenResponse>
}
