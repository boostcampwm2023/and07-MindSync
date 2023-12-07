package boostcamp.and07.mindsync.data.network.response

import kotlinx.serialization.Serializable

@Serializable
data class ProfileData(
    val statusCode: Int,
    val message: String,
    val data: ProfileResponse,
)
