package boostcamp.and07.mindsync.ui.util

import android.content.Context
import android.util.TypedValue
import kotlinx.serialization.Serializable

@Serializable
data class Dp(val dpVal: Float) {
    operator fun plus(dpValue: Dp): Dp {
        return Dp(dpVal + dpValue.dpVal)
    }

    operator fun minus(dpValue: Dp): Dp {
        return Dp(dpVal - dpValue.dpVal)
    }

    operator fun times(dpValue: Dp): Dp {
        return Dp(dpVal * dpValue.dpVal)
    }

    operator fun div(dpValue: Dp): Dp {
        return Dp(dpVal / dpValue.dpVal)
    }

    operator fun rem(dpValue: Dp): Dp {
        return Dp(dpVal % dpValue.dpVal)
    }

    operator fun plus(value: Float): Dp {
        return Dp(dpVal + value)
    }

    operator fun minus(value: Float): Dp {
        return Dp(dpVal - value)
    }

    operator fun times(value: Float): Dp {
        return Dp(dpVal * value)
    }

    operator fun div(value: Float): Dp {
        return Dp(dpVal / value)
    }

    operator fun rem(value: Float): Dp {
        return Dp(dpVal % value)
    }

    operator fun plus(value: Int): Dp {
        return Dp(dpVal + value)
    }

    operator fun minus(value: Int): Dp {
        return Dp(dpVal - value)
    }

    operator fun times(value: Int): Dp {
        return Dp(dpVal * value)
    }

    operator fun div(value: Int): Dp {
        return Dp(dpVal / value)
    }

    operator fun rem(value: Int): Dp {
        return Dp(dpVal % value)
    }
}

data class Px(val pxVal: Float) {
    operator fun plus(pxValue: Px): Px {
        return Px(pxVal + pxValue.pxVal)
    }

    operator fun minus(pxValue: Px): Px {
        return Px(pxVal - pxValue.pxVal)
    }

    operator fun times(pxValue: Px): Px {
        return Px(pxVal * pxValue.pxVal)
    }

    operator fun div(pxValue: Px): Px {
        return Px(pxVal / pxValue.pxVal)
    }

    operator fun rem(pxValue: Px): Px {
        return Px(pxVal % pxValue.pxVal)
    }

    operator fun plus(value: Float): Px {
        return Px(pxVal + value)
    }

    operator fun minus(value: Float): Px {
        return Px(pxVal - value)
    }

    operator fun times(value: Float): Px {
        return Px(pxVal * value)
    }

    operator fun div(value: Float): Px {
        return Px(pxVal / value)
    }

    operator fun rem(value: Float): Px {
        return Px(pxVal % value)
    }

    operator fun plus(value: Int): Px {
        return Px(pxVal + value)
    }

    operator fun minus(value: Int): Px {
        return Px(pxVal - value)
    }

    operator fun times(value: Int): Px {
        return Px(pxVal * value)
    }

    operator fun div(value: Int): Px {
        return Px(pxVal / value)
    }

    operator fun rem(value: Int): Px {
        return Px(pxVal % value)
    }
}

fun Dp.toPx(context: Context): Float {
    return TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP,
        dpVal,
        context.resources
            .displayMetrics,
    )
}

fun Px.toDp(context: Context): Float {
    val scale = context.resources.displayMetrics.density
    return pxVal / scale
}
