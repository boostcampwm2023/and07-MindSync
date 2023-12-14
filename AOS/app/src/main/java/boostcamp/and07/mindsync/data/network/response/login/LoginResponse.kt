package boostcamp.and07.mindsync.data.network.response.login

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class LoginResponse(
    val statusCode: Int,
    val message: String,
    val error: String? = null,
    val data: LoginDto? = null,
)

