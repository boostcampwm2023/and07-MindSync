package boostcamp.and07.mindsync.network.response

import boostcamp.and07.mindsync.data.crdt.SerializedOperation
import kotlinx.serialization.Serializable

@Serializable
data class OperationFromServer(
    val operation: SerializedOperation,
    val boardId: String,
)
