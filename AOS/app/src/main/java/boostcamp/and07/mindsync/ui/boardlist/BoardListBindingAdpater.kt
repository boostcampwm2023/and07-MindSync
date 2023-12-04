package boostcamp.and07.mindsync.ui.boardlist

import android.widget.TextView
import androidx.databinding.BindingAdapter
import androidx.recyclerview.widget.RecyclerView
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.model.Board
import com.google.android.flexbox.FlexboxLayoutManager
import com.google.android.flexbox.JustifyContent
import com.google.android.material.floatingactionbutton.FloatingActionButton
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
            justifyContent = JustifyContent.CENTER
        }
}

@BindingAdapter("app:floatingButtonImage")
fun FloatingActionButton.bindImage(selectBoards: List<Board>) {
    if (selectBoards.isEmpty()) {
        this.setImageDrawable(context.getDrawable(R.drawable.ic_add_board))
    } else {
        this.setImageDrawable(context.getDrawable(R.drawable.ic_delete_board))
    }
}

@BindingAdapter("app:floatingButtonImage", "app:onClickListener")
fun FloatingActionButton.bindImageButton(
    selectBoards: List<Board>,
    clickListener: () -> Unit,
) {
    if (selectBoards.isEmpty()) {
        this.setImageDrawable(context.getDrawable(R.drawable.ic_add_board))
        this.setOnClickListener { clickListener() }
    } else {
        this.setImageDrawable(context.getDrawable(R.drawable.ic_delete_board))
        this.setOnClickListener { clickListener() }
    }
}
