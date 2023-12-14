package boostcamp.and07.mindsync.data.network.response.mindmap

import boostcamp.and07.mindsync.data.crdt.Clock
import kotlinx.serialization.Serializable

@Serializable
data class SerializedOperation(
    val operationType: String,
    val id: String,
    val clock: Clock,
    val description: String? = null,
    val parentId: String? = null,
)
