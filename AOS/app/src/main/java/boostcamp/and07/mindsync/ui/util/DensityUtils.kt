package boostcamp.and07.mindsync.ui.util

import android.content.Context
import android.util.TypedValue

data class Dp(val dpVal: Float) {
    operator fun plus(value: Dp): Dp {
        return Dp(dpVal + value.dpVal)
    }

    operator fun minus(value: Dp): Dp {
        return Dp(dpVal - value.dpVal)
    }

    operator fun times(value: Dp): Dp {
        return Dp(dpVal * value.dpVal)
    }

    operator fun div(value: Dp): Dp {
        return Dp(dpVal / value.dpVal)
    }

    operator fun rem(value: Dp): Dp {
        return Dp(dpVal % value.dpVal)
    }
}

data class Px(val pxVal: Float) {
    operator fun plus(value: Px): Px {
        return Px(pxVal + value.pxVal)
    }

    operator fun minus(value: Px): Px {
        return Px(pxVal - value.pxVal)
    }

    operator fun times(value: Px): Px {
        return Px(pxVal * value.pxVal)
    }

    operator fun div(value: Px): Px {
        return Px(pxVal / value.pxVal)
    }

    operator fun rem(value: Px): Px {
        return Px(pxVal % value.pxVal)
    }
}

fun Dp.toPx(context: Context): Int {
    return TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP,
        dpVal,
        context.resources
            .displayMetrics,
    ).toInt()
}

fun Px.toDp(context: Context): Int {
    val scale = context.resources.displayMetrics.density
    return (pxVal / scale).toInt()
}
