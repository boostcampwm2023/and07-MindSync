package boostcamp.and07.mindsync.ui.view

import android.content.Context
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.ScaleGestureDetector
import androidx.constraintlayout.widget.ConstraintLayout
import boostcamp.and07.mindsync.ui.view.model.LayoutMode
import java.lang.Float.max
import java.lang.Float.min

class ZoomLayout(context: Context, attrs: AttributeSet? = null) : ConstraintLayout(context, attrs) {
    private var scaleFactor = DEFAULT_ZOOM
    private val scaleGestureDetector = ScaleGestureDetector(
        context,
        object : ScaleGestureDetector.SimpleOnScaleGestureListener() {
            override fun onScale(detector: ScaleGestureDetector): Boolean {
                scaleFactor *= detector.scaleFactor
                scaleFactor = max(MIN_ZOOM, min(scaleFactor, MAX_ZOOM))
                applyScaleAndTranslation()
                return true
            }
        },
    )
    private var touchStartX = 0f
    private var touchStartY = 0f
    private var preDx = 0f
    private var preDy = 0f
    private var dx = 0f
    private var dy = 0f
    private var mode = LayoutMode.DRAG
    private var nodeView: NodeView
    private var lineView: LineView
    private val mindmapContainer = MindmapContainer()

    init {
        nodeView = NodeView(context, attrs)
        lineView = LineView(context, attrs)
        mindmapContainer.nodeView = nodeView
        mindmapContainer.lineView = lineView
        nodeView.mindmapContainer = mindmapContainer
        nodeView.changeNodeSize()
        addView(nodeView)
        addView(lineView)
        applyScaleAndTranslation()
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                updateInitialTouchCoordinates(event)
                mode = LayoutMode.DRAG
            }

            MotionEvent.ACTION_MOVE -> {
                if (mode == LayoutMode.DRAG) {
                    updateTranslation(event)
                }
            }

            MotionEvent.ACTION_UP -> {
                updatePreTranslation()
            }

            MotionEvent.ACTION_POINTER_UP -> {
                mode = LayoutMode.ZOOM
            }

            MotionEvent.ACTION_POINTER_DOWN -> {
                mode = LayoutMode.NONE
            }
        }
        scaleGestureDetector.onTouchEvent(event)
        applyScaleAndTranslation()
        return true
    }

    private fun updateInitialTouchCoordinates(event: MotionEvent) {
        touchStartX = event.x - preDx
        touchStartY = event.y - preDy
    }

    private fun updateTranslation(event: MotionEvent) {
        dx = event.x - touchStartX
        dy = event.y - touchStartY
    }

    private fun updatePreTranslation() {
        preDx = dx
        preDy = dy
    }

    private fun applyScaleAndTranslation() {
        for (index in 0 until childCount) {
            with(getChildAt(index)) {
                scaleX = scaleFactor
                scaleY = scaleFactor
                translationX = dx
                translationY = dy
            }
        }
    }

    companion object {
        private const val DEFAULT_ZOOM = 1f
        private const val MIN_ZOOM = 0.5f
        private const val MAX_ZOOM = 10f
    }
}
