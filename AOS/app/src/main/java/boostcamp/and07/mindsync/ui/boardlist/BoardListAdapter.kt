package boostcamp.and07.mindsync.ui.boardlist

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import boostcamp.and07.mindsync.data.model.Board
import boostcamp.and07.mindsync.databinding.ItemBoardBinding

class BoardListAdapter : ListAdapter<Board, BoardListAdapter.BoardListViewHolder>(DIFF_CALLBACK) {
    private var boardClickListener: BoardClickListener? = null

    fun setBoardClickListener(listener: BoardClickListener) {
        this.boardClickListener = listener
    }

    class BoardListViewHolder(
        private val binding: ItemBoardBinding,
        private val boardClickListener: BoardClickListener?,
    ) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(item: Board) {
            with(binding) {
                board = item
                cbBoard.isChecked = item.isChecked
                imgbtnBoardItem.setOnClickListener {
                    boardClickListener?.onClick(item)
                }
                cbBoard.setOnClickListener {
                    item.isChecked = !item.isChecked
                    boardClickListener?.onCheckBoxClick(item)
                }
            }
        }
    }

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int,
    ): BoardListViewHolder {
        val binding = ItemBoardBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return BoardListViewHolder(binding, boardClickListener)
    }

    override fun onBindViewHolder(
        holder: BoardListViewHolder,
        position: Int,
    ) {
        holder.bind(getItem(position))
    }

    companion object {
        val DIFF_CALLBACK =
            object : DiffUtil.ItemCallback<Board>() {
                override fun areItemsTheSame(
                    oldItem: Board,
                    newItem: Board,
                ): Boolean {
                    return oldItem.id == newItem.id
                }

                override fun areContentsTheSame(
                    oldItem: Board,
                    newItem: Board,
                ): Boolean {
                    return oldItem == newItem
                }
            }
    }
}
