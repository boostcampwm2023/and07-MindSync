package boostcamp.and07.mindsync.ui.space.join

import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.databinding.ActivityAddInviteSpaceBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class AddInviteSpaceActivity :
    BaseActivity<ActivityAddInviteSpaceBinding>(R.layout.activity_add_invite_space) {
    private lateinit var navController: NavController

    override fun init() {
        setBinding()
        setNavController()
        setBackBtn()
    }

    private fun setBinding() {
        binding.view = this
    }

    private fun setNavController() {
        val navHostFragment =
            (supportFragmentManager.findFragmentById(R.id.fcv_add_invite_space_nav_host) as NavHostFragment)
        navController = navHostFragment.navController
    }

    private fun setBackBtn() {
        binding.imgbtnAddInviteSpaceBack.setOnClickListener {
            finish()
        }
    }
}
