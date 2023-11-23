package boostcamp.and07.mindsync.ui.view.model

import android.content.Context
import android.graphics.Color
import android.graphics.Paint
import android.text.TextPaint
import androidx.core.content.res.ResourcesCompat
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.ui.util.Dp
import boostcamp.and07.mindsync.ui.util.toPx

class DrawInfo(context: Context) {
    val circlePaint = Paint().apply {
        color = context.getColor(R.color.mindmap1)
    }
    val rectanglePaint = Paint()
    val textPaint = TextPaint().apply {
        color = Color.RED
        isAntiAlias = true
        textAlign = Paint.Align.CENTER
        textSize = Dp(12f).toPx(context)
        typeface = ResourcesCompat.getFont(context, R.font.pretendard_bold)
    }
    val strokePaint = Paint().apply {
        style = Paint.Style.STROKE
        isAntiAlias = true
        color = context.getColor(R.color.blue)
        strokeWidth = Dp(5f).toPx(context)
    }
    val lineHeight = Dp(15f)
    val padding = Dp(20f)
    val linePaint = Paint().apply {
        color = Color.BLACK
        style = Paint.Style.STROKE
        strokeWidth = Dp(5f).toPx(context)
        isAntiAlias = true
    }
}
