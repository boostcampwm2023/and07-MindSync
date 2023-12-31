package boostcamp.and07.mindsync.data.network.response.space

import kotlinx.serialization.Serializable

@Serializable
data class SpaceResponse(
    val statusCode: Int,
    val message: String,
    val error: String? = null,
    val data: SpaceData? = null,
)

@Serializable
data class SpaceData(
    val uuid: String,
    val name: String? = null,
    val icon: String? = null,
)
