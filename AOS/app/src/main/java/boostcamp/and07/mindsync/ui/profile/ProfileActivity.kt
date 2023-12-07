package boostcamp.and07.mindsync.ui.profile

import androidx.activity.viewModels
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.ActivityProfileBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity
import boostcamp.and07.mindsync.ui.base.BaseActivityViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class ProfileActivity : BaseActivity<ActivityProfileBinding>(R.layout.activity_profile) {
    private lateinit var navController: NavController
    private val profileViewModel by viewModels<ProfileViewModel>()

    override fun init() {
        setNavController()
    }

    override fun getViewModel(): BaseActivityViewModel {
        return profileViewModel
    }

    private fun setNavController() {
        val navHostFragment =
            (supportFragmentManager.findFragmentById(R.id.fcv_profile_nav_host) as NavHostFragment)
        navController = navHostFragment.navController
    }
}
