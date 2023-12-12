package boostcamp.and07.mindsync.ui.main

import androidx.databinding.BindingAdapter
import androidx.recyclerview.widget.RecyclerView
import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.data.network.response.user.UserData
import boostcamp.and07.mindsync.ui.boardlist.UsersAdapter

@BindingAdapter("app:users")
fun RecyclerView.bindUsers(users: List<UserData>) {
    if (this.adapter != null) {
        (this.adapter as UsersAdapter).submitList(users.toMutableList())
    }
}

@BindingAdapter("app:sideBarSpaces")
fun RecyclerView.bindSpaces(spaces: List<Space>) {
    if (this.adapter != null) {
        (this.adapter as SideBarSpaceAdapter).submitList(spaces.toMutableList())
    }
}
