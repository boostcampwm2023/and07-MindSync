package boostcamp.and07.mindsync.data.network.response

import kotlinx.serialization.Serializable

@Serializable
data class ProfileDTO(
    val statusCode: Int,
    val message: String,
    val data: ProfileResponse,
)
