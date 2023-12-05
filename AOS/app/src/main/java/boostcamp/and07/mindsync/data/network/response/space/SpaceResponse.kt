package boostcamp.and07.mindsync.data.network.response.space

import kotlinx.serialization.Serializable

@Serializable
data class SpaceResponse(
    val uuid: String,
    val name: String? = null,
    val icon: String? = null,
)
