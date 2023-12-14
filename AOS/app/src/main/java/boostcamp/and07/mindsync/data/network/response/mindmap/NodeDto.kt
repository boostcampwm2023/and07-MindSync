package boostcamp.and07.mindsync.data.network.response.mindmap

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class NodeDto(
    @SerialName("children")
    val children: List<String>,
    @SerialName("targetId")
    val targetId: String,
    @SerialName("parentId")
    val parentId: String,
    @SerialName("description")
    val description: String = "",
)
