package boostcamp.and07.mindsync.ui.space

import androidx.databinding.BindingAdapter
import androidx.recyclerview.widget.RecyclerView
import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.ui.boardlist.SpaceListAdapter

@BindingAdapter("app:spaces")
fun RecyclerView.bindSpaces(spaces: List<Space>) {
    if (this.adapter != null) {
        (this.adapter as SpaceListAdapter).submitList(spaces.toMutableList())
    }
}
