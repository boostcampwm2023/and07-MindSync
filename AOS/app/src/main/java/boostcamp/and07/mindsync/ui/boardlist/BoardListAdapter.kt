package boostcamp.and07.mindsync.ui.boardlist

import android.util.Log
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import boostcamp.and07.mindsync.data.model.Board
import boostcamp.and07.mindsync.databinding.ItemBoardBinding

class BoardListAdapter : ListAdapter<Board, BoardListAdapter.BoardListViewHolder>(DIFF_CALLBACK) {

    class BoardListViewHolder(
        private val binding: ItemBoardBinding,
    ) :
        RecyclerView.ViewHolder(binding.root) {
        private val tag = "BoardListViewHolder"

        fun bind(item: Board) {
            Log.d(tag, "bind")
            binding.board = item
        }
    }

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int,
    ): BoardListViewHolder {
        val binding = ItemBoardBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return BoardListViewHolder(binding)
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
