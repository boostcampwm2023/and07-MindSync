package boostcamp.and07.mindsync.data.network.api

import boostcamp.and07.mindsync.data.network.request.login.KakaoLoginRequest
import boostcamp.and07.mindsync.data.network.response.login.LoginResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface LoginApi {
    @POST("auth/kakao-oauth")
    suspend fun postKakaoOAuth(
        @Body kakaoLoginRequest: KakaoLoginRequest,
    ): Response<LoginResponse>
}
