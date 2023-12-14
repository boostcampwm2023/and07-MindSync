package boostcamp.and07.mindsync.data.util

import java.util.UUID

object IdGenerator {
    fun makeRandomNodeId() = UUID.randomUUID().toString()
}
