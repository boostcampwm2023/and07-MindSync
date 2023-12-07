package boostcamp.and07.mindsync.data.network.response.user

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class UserResponse(
    val statusCode: Int,
    val message: String,
    val data: List<UserData>? = null,
)

@Serializable
data class UserData(
    val uuid: String,
    @SerialName("user_id")
    val userId: String? = null,
    val image: String? = null,
    val nickname: String? = null,
)
