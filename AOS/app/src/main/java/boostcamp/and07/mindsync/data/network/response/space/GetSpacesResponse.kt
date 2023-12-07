package boostcamp.and07.mindsync.data.network.response.space

import kotlinx.serialization.Serializable

@Serializable
data class GetSpacesResponse(
    val statusCode: Int,
    val message: String,
    val data: List<SpaceData>?,
)
