package boostcamp.and07.mindsync.ui.space.generate

import android.net.Uri
import androidx.activity.viewModels
import androidx.compose.runtime.Composable
import boostcamp.and07.mindsync.ui.base.BaseComposeActivity
import boostcamp.and07.mindsync.ui.theme.MindSyncTheme
import boostcamp.and07.mindsync.ui.util.toAbsolutePath
import dagger.hilt.android.AndroidEntryPoint
import java.io.File

@AndroidEntryPoint
class AddSpaceActivity : BaseComposeActivity() {
    private val addSpaceViewModel: AddSpaceViewModel by viewModels()

    private fun createImage(uri: Uri?) {
        uri?.let { uri ->
            val file = File(uri.toAbsolutePath(this))
            addSpaceViewModel.setSpaceThumbnail(uri.toString())
            addSpaceViewModel.setImageFile(file)
        }
    }

    @Composable
    override fun Content() {
        MindSyncTheme {
            AddSpaceScreen(
                onBackClicked = { this.finish() },
                addSpaceViewModel = addSpaceViewModel,
                createSpace = { addSpaceViewModel.addSpace(it) },
                updateSpaceName = { addSpaceViewModel.onSpaceNameChanged(it, 0, 0, 0) },
                createImage = { createImage(it) },
            )
        }
    }
}
