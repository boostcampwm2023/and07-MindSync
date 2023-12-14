package boostcamp.and07.mindsync.data.network.response.profile

import kotlinx.serialization.Serializable

@Serializable
data class ProfileData(
    val statusCode: Int,
    val message: String,
    val error: String? = null,
    val data: ProfileResponse? = null,
)
