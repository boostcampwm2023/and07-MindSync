package boostcamp.and07.mindsync.ui.mindmap

import android.widget.ImageButton
import androidx.databinding.BindingAdapter
import boostcamp.and07.mindsync.data.model.CircleNode
import boostcamp.and07.mindsync.data.model.Node
import boostcamp.and07.mindsync.data.model.RectangleNode
@BindingAdapter("app:removeBtn")
fun ImageButton.setEnabled(selectedNode: Node?) {
    this.isEnabled = when (selectedNode) {
        is CircleNode -> false
        is RectangleNode -> true
        else -> false
    }
}