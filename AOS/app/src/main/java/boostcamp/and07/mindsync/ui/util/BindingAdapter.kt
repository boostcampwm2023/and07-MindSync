package boostcamp.and07.mindsync.ui.util

import android.net.Uri
import android.widget.ImageView
import androidx.databinding.BindingAdapter
import boostcamp.and07.mindsync.R
import coil.load
import coil.transform.CircleCropTransformation

@BindingAdapter("app:imageUri")
fun ImageView.loadImage(uri: String) {
    load(Uri.parse(uri)) {
        placeholder(R.mipmap.ic_app_logo_round)
        error(R.mipmap.ic_app_logo_round)
        transformations(CircleCropTransformation())
    }
}
