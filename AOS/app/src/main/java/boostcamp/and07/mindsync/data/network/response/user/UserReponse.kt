package boostcamp.and07.mindsync.data.network.response.user

import kotlinx.serialization.Serializable

@Serializable
data class UserResponse(
    val statusCode: Int,
    val message: String,
    val data: List<UserDto>? = null,
)
