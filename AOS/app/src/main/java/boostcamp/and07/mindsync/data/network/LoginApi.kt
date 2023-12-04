package boostcamp.and07.mindsync.data.network

import boostcamp.and07.mindsync.data.network.request.KakaoLoginRequest
import boostcamp.and07.mindsync.data.network.response.LoginResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface LoginApi {
    @POST("auth/kakao-oauth")
    suspend fun postKakaoOAuth(
        @Body kakaoLoginRequest: KakaoLoginRequest,
    ): Response<LoginResponse>
}
