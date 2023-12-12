package boostcamp.and07.mindsync.ui.util

import android.view.View
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach

enum class ThrottleDuration(val duration: Long) {
    SHORT_DURATION(250L),
    MIDDLE_DURATION(500L),
    LONG_DURATION(1000L),
}

fun View.setClickEvent(
    uiScope: CoroutineScope,
    windowDuration: Long = ThrottleDuration.MIDDLE_DURATION.duration,
    onClick: () -> Unit,
) {
    clicks()
        .throttleFirst(windowDuration)
        .onEach { onClick.invoke() }
        .launchIn(uiScope)
}

fun <T> Flow<T>.throttleFirst(windowDuration: Long = ThrottleDuration.MIDDLE_DURATION.duration): Flow<T> =
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

fun View.clicks(): Flow<Unit> =
    callbackFlow {
        setOnClickListener {
            this.trySend(Unit)
        }
        awaitClose { setOnClickListener(null) }
    }
