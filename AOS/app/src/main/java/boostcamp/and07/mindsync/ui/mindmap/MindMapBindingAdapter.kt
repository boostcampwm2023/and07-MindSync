package boostcamp.and07.mindsync.ui.mindmap

import android.widget.ImageButton
import androidx.databinding.BindingAdapter
import boostcamp.and07.mindsync.data.model.Node

@BindingAdapter("app:removeBtn")
fun ImageButton.setEnabled(selectedNode: Node?) {
    if (selectedNode != null) {
        this.isEnabled =
            selectedNode.isRectangle()
    }
}
