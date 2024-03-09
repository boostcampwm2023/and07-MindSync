package boostcamp.and07.mindsync.ui.util

import android.net.Uri
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.databinding.BindingAdapter
import androidx.recyclerview.widget.RecyclerView
import boostcamp.and07.mindsync.R
import coil.load
import coil.transform.CircleCropTransformation
import com.google.android.flexbox.FlexboxLayoutManager
import com.google.android.flexbox.JustifyContent
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@BindingAdapter("app:imageUri")
fun ImageView.loadImage(uri: String) {
    load(Uri.parse(uri)) {
        placeholder(R.mipmap.ic_app_logo_round)
        error(R.mipmap.ic_app_logo_round)
        transformations(CircleCropTransformation())
    }
}

@BindingAdapter("app:boardImageUri")
fun ImageView.loadBoardImage(uri: String) {
    load(Uri.parse(uri)) {
        placeholder(R.mipmap.ic_app_logo_round)
        error(R.mipmap.ic_app_logo_round)
    }
}

@BindingAdapter("app:date")
fun TextView.bindDate(date: String) {
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSX")
    val localDate = LocalDateTime.parse(date, formatter)
    val year = localDate.year
    val month = localDate.monthValue
    val day = localDate.dayOfMonth

    this.text = "$year-$month-$day"
}

@BindingAdapter("app:editButtonEnabled")
fun Button.bindEnabled(content: String) {
    this.isEnabled =
        when (content.length) {
            in 1..20 -> true
            else -> false
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
