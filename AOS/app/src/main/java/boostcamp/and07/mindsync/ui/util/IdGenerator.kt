package boostcamp.and07.mindsync.ui.util

import java.util.UUID

object IdGenerator {

    fun makeRandomNodeId() = UUID.randomUUID().toString()
}
