package boostcamp.and07.mindsync.ui.util

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

const val THROTTLE_DURATION = 200L

fun <T> Flow<T>.throttleFirst(windowDuration: Long = THROTTLE_DURATION): Flow<T> =
    flow {
        var lastEmissionTime = 0L
        collect { upstream ->
            val currentTime = System.currentTimeMillis()
            if (currentTime - lastEmissionTime > windowDuration) {
                lastEmissionTime = currentTime
                emit(upstream)
            }
        }
    }
