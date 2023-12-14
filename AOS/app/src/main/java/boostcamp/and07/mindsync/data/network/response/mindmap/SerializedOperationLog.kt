package boostcamp.and07.mindsync.data.network.response.mindmap

import kotlinx.serialization.Serializable

@Serializable
data class SerializedOperationLog(
    val operation: SerializedOperation,
    val oldDescription: String? = null,
    val oldParentId: String? = null,
)
