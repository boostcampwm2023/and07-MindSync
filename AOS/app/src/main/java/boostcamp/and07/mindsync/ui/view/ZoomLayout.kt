package boostcamp.and07.mindsync.ui.view

import android.content.Context
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.ScaleGestureDetector
import android.widget.FrameLayout
import boostcamp.and07.mindsync.ui.view.model.LayoutMode
import java.lang.Float.max
import java.lang.Float.min

class ZoomLayout(context: Context, attrs: AttributeSet? = null) : FrameLayout(context, attrs) {
    private var scaleFactor = DEFAULT_ZOOM
    private var focusX = 0f
    private var focusY = 0f
    private val scaleGestureDetector =
        ScaleGestureDetector(
            context,
            object : ScaleGestureDetector.SimpleOnScaleGestureListener() {
                override fun onScale(detector: ScaleGestureDetector): Boolean {
                    scaleFactor *= detector.scaleFactor
                    scaleFactor = max(MIN_ZOOM, min(scaleFactor, MAX_ZOOM))
                    focusX = detector.focusX
                    focusY = detector.focusY
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
    lateinit var nodeView: NodeView
    lateinit var lineView: LineView
    lateinit var mindMapContainer: MindMapContainer

    fun initializeZoomLayout() {
        nodeView = NodeView(mindMapContainer, context, attrs = null)
        lineView = LineView(context, attrs = null)
        addView(lineView)
        addView(nodeView)
    }

    override fun onMeasure(
        widthMeasureSpec: Int,
        heightMeasureSpec: Int,
    ) {
        var width = 0
        var height = 0
        for (index in 0 until childCount) {
            val child = getChildAt(index)
            measureChild(child, widthMeasureSpec, heightMeasureSpec)
            width = maxOf(width, child.measuredWidth)
            height = maxOf(height, child.measuredHeight)
        }
        setMeasuredDimension(
            resolveSize(width, widthMeasureSpec),
            resolveSize(height, heightMeasureSpec),
        )
    }

    override fun onLayout(
        changed: Boolean,
        l: Int,
        t: Int,
        r: Int,
        b: Int,
    ) {
        val childCount = childCount
        for (index in 0 until childCount) {
            val child = getChildAt(index)
            val childLeft =
                (paddingLeft + (child.layoutParams as MarginLayoutParams).leftMargin)
            val childTop =
                (paddingTop + (child.layoutParams as MarginLayoutParams).topMargin)
            val childRight = Int.MAX_VALUE
            val childBottom = Int.MAX_VALUE
            child.layout(childLeft, childTop, childRight, childBottom)
        }
    }

    override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
        if (mindMapContainer.selectNode == null) {
            return false
        }
        return super.onInterceptTouchEvent(ev)
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                updateInitialTouchCoordinates(event)
                mode = LayoutMode.DRAG
            }

            MotionEvent.ACTION_MOVE -> {
                if (mode == LayoutMode.DRAG && mindMapContainer.isMoving.not()) {
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
                pivotX = focusX
                pivotY = focusY
                translationX = dx
                translationY = dy
            }
        }
    }

    companion object {
        private const val DEFAULT_ZOOM = 1f
        private const val MIN_ZOOM = 0.2f
        private const val MAX_ZOOM = 5f
    }
}
