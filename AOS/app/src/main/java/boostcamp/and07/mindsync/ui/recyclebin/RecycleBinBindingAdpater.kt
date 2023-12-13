package boostcamp.and07.mindsync.ui.recyclebin

import androidx.databinding.BindingAdapter
import androidx.recyclerview.widget.RecyclerView
import boostcamp.and07.mindsync.data.model.Board

@BindingAdapter("app:restoreBoards")
fun RecyclerView.bindRestoreBoards(boards: List<Board>) {
    if (this.adapter != null) {
        (this.adapter as RecycleBinAdapter).submitList(boards.toMutableList())
    }
}
