package boostcamp.and07.mindsync.network.request

import boostcamp.and07.mindsync.data.crdt.SerializedOperation
import kotlinx.serialization.Serializable

@Serializable
data class UpdateMindMap(
    val operation: SerializedOperation,
    val boardId: String,
)
