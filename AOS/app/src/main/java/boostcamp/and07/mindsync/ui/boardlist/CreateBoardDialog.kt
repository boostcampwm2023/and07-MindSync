package boostcamp.and07.mindsync.ui.boardlist

import android.Manifest
import android.app.ActionBar.LayoutParams
import android.app.Activity.RESULT_OK
import android.app.Dialog
import android.content.DialogInterface
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat.checkSelfPermission
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.DialogCreateBoardBinding
import boostcamp.and07.mindsync.ui.util.setClickEvent
import boostcamp.and07.mindsync.ui.util.toAbsolutePath
import dagger.hilt.android.AndroidEntryPoint
import okhttp3.MultipartBody
import java.io.File

@AndroidEntryPoint
class CreateBoardDialog : DialogFragment() {
    private var _binding: DialogCreateBoardBinding? = null
    private val binding get() = _binding!!

    private val createBoardViewModel: CreateBoardViewModel by viewModels()

    private var completeListener: ((MultipartBody.Part?, String) -> (Unit))? = null

    private val pickMedia =
        registerForActivityResult(ActivityResultContracts.PickVisualMedia()) { url ->
            url?.let {
                val file = File(url.toAbsolutePath(requireContext()))
                createBoardViewModel.setSpaceImage(url.toString())
                createBoardViewModel.setImageFile(file)
            }
        }
    private val galleryPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            if (isGranted) {
                launchImagePicker()
            }
        }

    private val imageResult =
        registerForActivityResult(
            ActivityResultContracts.StartActivityForResult(),
        ) { result ->
            Log.d("CreateBoardDialog", "result: ${result.resultCode}")
            if (result.resultCode == RESULT_OK) {
                result.data?.data?.let { uri ->
                    createImage(uri)
                }
            }
        }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val dialog = super.onCreateDialog(savedInstanceState)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.window?.attributes?.windowAnimations = R.style.AnimationDialogStyle
        isCancelable = true
        return dialog
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View {
        _binding = DialogCreateBoardBinding.inflate(inflater, container, false)
        setBinding()
        setClickEventThrottle()
        return binding.root
    }

    private fun setBinding() {
        binding.view = this
        binding.vm = createBoardViewModel
        binding.lifecycleOwner = this
    }

    override fun onStart() {
        super.onStart()
        resizeDialog()
    }

    fun setCompleteListener(listener: (MultipartBody.Part?, String) -> (Unit)) {
        this.completeListener = listener
    }

    private fun resizeDialog() {
        val params: ViewGroup.LayoutParams? = dialog?.window?.attributes

        val displayMetrics = requireActivity().resources.displayMetrics
        val deviceWidth = displayMetrics.widthPixels
        val deviceHeight = displayMetrics.heightPixels

        params?.width = (deviceWidth * 0.8).toInt()
        params?.height = LayoutParams.WRAP_CONTENT
        dialog?.window?.attributes = params as WindowManager.LayoutParams
    }

    override fun onDismiss(dialog: DialogInterface) {
        _binding = null
        super.onDismiss(dialog)
    }

    fun onClickCompleteButton(imageName: String) {
        val result = createBoardViewModel.changeImageToFile(imageName)
        completeListener?.invoke(result.first, result.second)
        dismiss()
    }

    private fun setClickEventThrottle() {
        binding.imgbtnUpdateSpaceThumbnail.setClickEvent(lifecycleScope) {
            checkPermissionsAndLaunchImagePicker()
        }
    }

    private fun createImage(uri: Uri?) {
        uri?.let { uri ->
            createBoardViewModel.setSpaceImage(uri.toString())
        }
    }

    private fun checkPermissionsAndLaunchImagePicker() {
        when {
            checkSelfPermission(
                requireContext(),
                getPermissionReadMediaImagesOrReadExternalStorage(),
            ) == PackageManager.PERMISSION_GRANTED -> {
                launchImagePicker()
            }

            shouldShowRequestPermissionRationale(
                getPermissionReadMediaImagesOrReadExternalStorage(),
            ) -> {
                requestGalleryPermission()
            }

            else -> {
                requestGalleryPermission()
            }
        }
    }

    private fun launchImagePicker() {
        pickMedia.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
    }

    private fun getPermissionReadMediaImagesOrReadExternalStorage() =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            Manifest.permission.READ_MEDIA_IMAGES
        } else {
            Manifest.permission.READ_EXTERNAL_STORAGE
        }

    private fun requestGalleryPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            galleryPermissionLauncher.launch(Manifest.permission.READ_MEDIA_IMAGES)
        } else {
            checkPermissionAndLaunchImageSelector()
        }
    }

    private fun checkPermissionAndLaunchImageSelector() {
        val readPermission =
            checkSelfPermission(requireContext(), Manifest.permission.READ_EXTERNAL_STORAGE)

        if (readPermission == PackageManager.PERMISSION_GRANTED) {
            launchImageSelector()
        } else {
            requestExternalStoragePermission()
        }
    }

    private fun requestExternalStoragePermission() {
        ActivityCompat.requestPermissions(
            requireActivity(),
            arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE),
            REQUEST_CODE_PERMISSIONS,
        )
    }

    private fun launchImageSelector() {
        val intent =
            Intent(Intent.ACTION_PICK).apply {
                setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "image/*")
            }
        imageResult.launch(intent)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray,
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_CODE_PERMISSIONS && grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            launchImagePicker()
        }
    }

    companion object {
        private const val REQUEST_CODE_PERMISSIONS = 1
    }
}
