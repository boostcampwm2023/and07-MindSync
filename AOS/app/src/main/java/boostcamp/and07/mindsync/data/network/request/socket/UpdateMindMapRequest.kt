package boostcamp.and07.mindsync.data.network.request.socket

import boostcamp.and07.mindsync.data.network.response.mindmap.SerializedOperation
import kotlinx.serialization.Serializable

@Serializable
data class UpdateMindMapRequest(
    val operation: SerializedOperation,
    val boardId: String,
)
