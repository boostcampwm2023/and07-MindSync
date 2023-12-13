package boostcamp.and07.mindsync.ui.RecycleBin

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import boostcamp.and07.mindsync.data.model.Board
import boostcamp.and07.mindsync.databinding.ItemRecycleBoardBinding
import boostcamp.and07.mindsync.ui.recyclebin.RecycleBinClickListener

class RecycleBinAdapter :
    ListAdapter<Board, RecycleBinAdapter.RecycleBinViewHolder>(DIFF_CALLBACK) {
    private var clickListener: RecycleBinClickListener? = null

    fun setRecycleBinClickListener(listener: RecycleBinClickListener) {
        this.clickListener = listener
    }

    class RecycleBinViewHolder(
        private val binding: ItemRecycleBoardBinding,
        private val clickListener: RecycleBinClickListener?,
    ) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(item: Board) {
            with(binding) {
                board = item
                cbBoard.isChecked = item.isChecked
                cbBoard.setOnClickListener {
                    item.isChecked = !item.isChecked
                    clickListener?.onCheckBoxClick(item)
                }
            }
        }
    }

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int,
    ): RecycleBinViewHolder {
        val binding =
            ItemRecycleBoardBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return RecycleBinViewHolder(binding, clickListener)
    }

    override fun onBindViewHolder(
        holder: RecycleBinViewHolder,
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
