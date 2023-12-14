package boostcamp.and07.mindsync.ui.boardlist

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import boostcamp.and07.mindsync.data.network.response.user.UserDto
import boostcamp.and07.mindsync.databinding.ItemUsersBinding

class UsersAdapter : ListAdapter<UserDto, UsersAdapter.UsersViewHolder>(DIFF_CALLBACK) {
    class UsersViewHolder(
        private val binding: ItemUsersBinding,
    ) :
        RecyclerView.ViewHolder(binding.root) {
        fun bind(item: UserDto) {
            with(binding) {
                user = item
            }
        }
    }

    override fun onCreateViewHolder(
        parent: ViewGroup,
        viewType: Int,
    ): UsersViewHolder {
        val binding = ItemUsersBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return UsersViewHolder(binding)
    }

    override fun onBindViewHolder(
        holder: UsersViewHolder,
        position: Int,
    ) {
        holder.bind(getItem(position))
    }

    companion object {
        val DIFF_CALLBACK =
            object : DiffUtil.ItemCallback<UserDto>() {
                override fun areItemsTheSame(
                    oldItem: UserDto,
                    newItem: UserDto,
                ): Boolean {
                    return oldItem.userId == newItem.userId
                }

                override fun areContentsTheSame(
                    oldItem: UserDto,
                    newItem: UserDto,
                ): Boolean {
                    return oldItem == newItem
                }
            }
    }
}
