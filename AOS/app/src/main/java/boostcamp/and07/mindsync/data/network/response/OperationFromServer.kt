package boostcamp.and07.mindsync.data.network.response

import boostcamp.and07.mindsync.data.network.response.mindmap.SerializedOperation
import kotlinx.serialization.Serializable

@Serializable
data class OperationFromServer(
    val operation: SerializedOperation,
    val boardId: String,
)
