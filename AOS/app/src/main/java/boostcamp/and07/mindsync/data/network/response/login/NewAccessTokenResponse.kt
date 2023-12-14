package boostcamp.and07.mindsync.data.network.response.login

import kotlinx.serialization.Serializable

@Serializable
data class NewAccessTokenResponse(
    val statusCode: Int,
    val message: String,
    val error: String? = null,
    val data: NewAccessTokenDto? = null,
)
