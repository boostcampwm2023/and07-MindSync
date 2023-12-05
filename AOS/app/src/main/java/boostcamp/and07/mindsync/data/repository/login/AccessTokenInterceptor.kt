package boostcamp.and07.mindsync.data.repository.login

import boostcamp.and07.mindsync.ui.util.NetworkExceptionMessage
import com.kakao.sdk.common.Constants.AUTHORIZATION
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response
import javax.inject.Inject

class AccessTokenInterceptor
@Inject
constructor(
    private val tokenRepository: TokenRepository,
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val requestBuilder = originalRequest.newBuilder()

        val accessToken: String =
            runBlocking {
                tokenRepository.getAccessToken().first()
            } ?: return errorResponse(chain.request())

        val request =
            requestBuilder.header(AUTHORIZATION, DataStoreConst.BEARER_TOKEN_PREFIX + accessToken)
                .build()

        return chain.proceed(request)
    }

    private fun errorResponse(request: Request): Response =
        Response.Builder()
            .code(DataStoreConst.UNAUTHORIZED_CODE)
            .message(NetworkExceptionMessage.ERROR_MESSAGE_CANT_GET_TOKEN.message)
            .build()
}
