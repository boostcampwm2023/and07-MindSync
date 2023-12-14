package boostcamp.and07.mindsync.data.network.response.user

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable


@Serializable
data class UserDto(
    val uuid: String,
    @SerialName("user_id")
    val userId: String? = null,
    val image: String? = null,
    val nickname: String? = null,
)
