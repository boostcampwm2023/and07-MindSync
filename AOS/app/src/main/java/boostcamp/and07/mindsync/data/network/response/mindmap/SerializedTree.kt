package boostcamp.and07.mindsync.data.network.response.mindmap

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class SerializedTree(
    @SerialName("nodes")
    val nodes: List<NodeDto>,
)
