package boostcamp.and07.mindsync.ui.boardlist

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.databinding.ItemSpacesBinding
import boostcamp.and07.mindsync.ui.main.SpaceClickListener

class SpaceListAdapter : ListAdapter<Space, SpaceListAdapter.SpaceListViewHolder>(DIFF_CALLBACK) {
    private var spaceClickListener: SpaceClickListener? = null

    fun setSpaceClickListener(spaceClickListener: SpaceClickListener) {
        this.spaceClickListener = spaceClickListener
    }

    class SpaceListViewHolder(
        private val binding: ItemSpacesBinding,
        private val spaceClickListener: SpaceClickListener?,
    ) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(item: Space) {
            with(binding) {
                space = item
                itemView.setOnClickListener {
                    spaceClickListener?.onClickSpace(item)
                }
            }
        }
    }

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int,
    ): SpaceListViewHolder {
        val binding = ItemSpacesBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return SpaceListViewHolder(binding, spaceClickListener)
    }

    override fun onBindViewHolder(
        holder: SpaceListViewHolder,
        position: Int,
    ) {
        holder.bind(getItem(position))
    }

    companion object {
        val DIFF_CALLBACK =
            object : DiffUtil.ItemCallback<Space>() {
                override fun areItemsTheSame(
                    oldItem: Space,
                    newItem: Space,
                ): Boolean {
                    return oldItem.id == newItem.id
                }

                override fun areContentsTheSame(
                    oldItem: Space,
                    newItem: Space,
                ): Boolean {
                    return oldItem == newItem
                }
            }
    }
}
