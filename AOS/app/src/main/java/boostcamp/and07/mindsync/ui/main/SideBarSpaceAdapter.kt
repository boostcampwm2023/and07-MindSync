package boostcamp.and07.mindsync.ui.main

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.databinding.ItemSpaceBinding

class SideBarSpaceAdapter :
    ListAdapter<Space, SideBarSpaceAdapter.SideBarSpaceViewHolder>(DIFF_CALLBACK) {
    class SideBarSpaceViewHolder(private val binding: ItemSpaceBinding) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(item: Space) {
            binding.imageUri = item.imageUrl
        }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SideBarSpaceViewHolder {
        val binding = ItemSpaceBinding.inflate(LayoutInflater.from(parent.context))
        return SideBarSpaceViewHolder(binding)
    }

    override fun onBindViewHolder(holder: SideBarSpaceViewHolder, position: Int) {
        holder.bind(getItem(position))
        holder.itemView.layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT,
        )
    }

    companion object {
        val DIFF_CALLBACK = object : DiffUtil.ItemCallback<Space>() {
            override fun areItemsTheSame(oldItem: Space, newItem: Space): Boolean {
                return oldItem.id == newItem.id
            }

            override fun areContentsTheSame(oldItem: Space, newItem: Space): Boolean {
                return oldItem == newItem
            }
        }
    }
}
