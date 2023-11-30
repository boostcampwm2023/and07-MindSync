package boostcamp.and07.mindsync.ui.boardlist

import android.widget.TextView
import androidx.databinding.BindingAdapter
import androidx.recyclerview.widget.RecyclerView
import boostcamp.and07.mindsync.data.model.Board
import com.google.android.flexbox.FlexboxLayoutManager
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@BindingAdapter("app:date")
fun TextView.bindDate(date: LocalDate) {
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    this.text = date.format(formatter)
}

@BindingAdapter("app:boards")
fun RecyclerView.bindBoards(boards: List<Board>) {
    if (this.adapter != null) {
        (this.adapter as BoardListAdapter).submitList(boards.toMutableList())
    }
}

@BindingAdapter("app:flexBoxLayoutManager")
fun RecyclerView.bindLayoutManager(direction: Int) {
    this.layoutManager =
        FlexboxLayoutManager(context).apply {
            flexDirection = direction
        }
}
