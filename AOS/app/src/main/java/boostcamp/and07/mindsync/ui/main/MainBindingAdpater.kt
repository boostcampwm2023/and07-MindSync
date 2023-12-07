package boostcamp.and07.mindsync.ui.main

import androidx.databinding.BindingAdapter
import androidx.recyclerview.widget.RecyclerView
import boostcamp.and07.mindsync.data.network.response.user.UserData
import boostcamp.and07.mindsync.ui.boardlist.UsersAdapter

@BindingAdapter("app:users")
fun RecyclerView.bindUsers(users: List<UserData>) {
    if (this.adapter != null) {
        (this.adapter as UsersAdapter).submitList(users.toMutableList())
    }
}
