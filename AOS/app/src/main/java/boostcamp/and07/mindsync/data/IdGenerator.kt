package boostcamp.and07.mindsync.data

import java.util.UUID

object IdGenerator {
    fun makeRandomNodeId() = UUID.randomUUID().toString()
}
