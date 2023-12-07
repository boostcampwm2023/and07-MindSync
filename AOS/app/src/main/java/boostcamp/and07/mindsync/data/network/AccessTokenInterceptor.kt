package boostcamp.and07.mindsync.data.network

import boostcamp.and07.mindsync.data.repository.login.DataStoreConst
import boostcamp.and07.mindsync.data.repository.login.TokenRepository
import boostcamp.and07.mindsync.ui.util.NetworkExceptionMessage
import com.kakao.sdk.common.Constants.AUTHORIZATION
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Protocol
import okhttp3.Request
import okhttp3.Response
import okhttp3.ResponseBody.Companion.toResponseBody
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
                .request(request)
                .protocol(Protocol.HTTP_2)
                .code(DataStoreConst.UNAUTHORIZED_CODE)
                .body("".toResponseBody())
                .message(NetworkExceptionMessage.ERROR_MESSAGE_CANT_GET_TOKEN.message)
                .build()
    }
