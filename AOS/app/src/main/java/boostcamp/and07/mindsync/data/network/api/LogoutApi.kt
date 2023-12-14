package boostcamp.and07.mindsync.data.network.api

import boostcamp.and07.mindsync.data.network.request.login.LogoutRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface LogoutApi {
    @POST("auth/logout")
    suspend fun postLogout(
        @Body logoutRequest: LogoutRequest,
    ): Response<Unit>
}
