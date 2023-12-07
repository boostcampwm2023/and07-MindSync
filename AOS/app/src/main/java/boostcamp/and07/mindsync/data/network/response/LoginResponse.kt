package boostcamp.and07.mindsync.data.network.response

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class LoginResponse(
    val statusCode: Int,
    val message: String,
    val error: String? = null,
    val data: LoginData? = null,
)

@Serializable
data class LoginData(
    @SerialName("access_token")
    val accessToken: String,
    @SerialName("refresh_token")
    val refreshToken: String,
)
