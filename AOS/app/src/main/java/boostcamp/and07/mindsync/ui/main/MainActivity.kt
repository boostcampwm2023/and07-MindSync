package boostcamp.and07.mindsync.ui.main

import android.content.Intent
import android.view.View
import android.widget.Toast
import androidx.activity.addCallback
import androidx.activity.viewModels
import androidx.core.view.GravityCompat
import androidx.drawerlayout.widget.DrawerLayout
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import boostcamp.and07.mindsync.R
import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.databinding.ActivityMainBinding
import boostcamp.and07.mindsync.ui.base.BaseActivity
import boostcamp.and07.mindsync.ui.profile.ProfileActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class MainActivity :
    BaseActivity<ActivityMainBinding>(R.layout.activity_main) {
    private lateinit var drawerLayout: DrawerLayout
    private var backPressedTime: Long = 0L
    private var backPressedToast: Toast? = null
    private lateinit var spaceAdapter: SideBarSpaceAdapter
    private lateinit var navController: NavController
    private val mainViewModel: MainViewModel by viewModels()

    override fun onStart() {
        super.onStart()
        mainViewModel.fetchProfile()
    }

    override fun init() {
        drawerLayout = binding.drawerLayoutMainSideBar
        setNavController()
        setBackPressedToast()
        setBackPressed()
        setSideBar()
        setSideBarNavigation()
        setBinding()
        observeEvent()
    }

    private fun setBinding() {
        binding.vm = mainViewModel
    }

    private fun observeEvent() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                mainViewModel.event.collectLatest { event ->
                    if (event is MainUiEvent.ShowMessage) {
                        Toast.makeText(this@MainActivity, event.message, Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }

    private fun setNavController() {
        val navHostFragment =
            (supportFragmentManager.findFragmentById(R.id.fcv_main_nav_host) as NavHostFragment)
        navController = navHostFragment.navController
    }

    private fun setSideBarNavigation() {
        with(binding.includeMainInDrawer) {
            tvSideBarBoardList.setOnClickListener {
                drawerLayout.closeDrawers()
                navController.navigate(R.id.action_to_boardListFragment)
            }
            tvSideBarRecycleBin.setOnClickListener {
                drawerLayout.closeDrawers()
                navController.navigate(R.id.action_to_recycleBinFragment)
            }
            imgbtnSideBarAddSpace.setOnClickListener {
                drawerLayout.closeDrawers()
                navController.navigate(R.id.action_to_addSpaceDialog)
            }
            tvSideBarInviteSpace.setOnClickListener {
                drawerLayout.closeDrawers()
                navController.navigate(R.id.action_to_inviteUserDialog)
            }
            imgbtnSideBarProfile.setOnClickListener {
                val intent = Intent(this@MainActivity, ProfileActivity::class.java)
                startActivity(intent)
            }
        }
    }

    private fun setBackPressedToast() {
        backPressedToast =
            Toast.makeText(
                baseContext,
                getString(R.string.main_back_pressed_message),
                Toast.LENGTH_SHORT,
            )
    }

    private fun setBackPressed() {
        onBackPressedDispatcher.addCallback {
            if (drawerLayout.isDrawerOpen(GravityCompat.START)) {
                drawerLayout.closeDrawers()
            } else {
                if (System.currentTimeMillis() - backPressedTime <= 2000L) {
                    backPressedToast?.cancel()
                    finish()
                } else {
                    backPressedTime = System.currentTimeMillis()
                    backPressedToast?.show()
                }
            }
        }
    }

    private fun setSideBar() {
        spaceAdapter = SideBarSpaceAdapter()
        binding.includeMainInDrawer.rvSideBarSpace.adapter = spaceAdapter
        spaceAdapter.submitList(getSampleSpace())
    }

    private fun getSampleSpace(): List<Space> {
        val sampleSpace =
            mutableListOf(
                Space(
                    "0",
                    "space1",
                    "error",
                ),
                Space(
                    "1",
                    "space3",
                    "https://img.freepik.com/premium-vector/" +
                        "cute-kawaii-shiba-inu-dog-cartoon-style" +
                        "-character-mascot-corgi-dog_945253-162.jpg",
                ),
                Space(
                    "2",
                    "space3",
                    "https://image.yes24.com/blogimage/blog/w/o/woojukaki/IMG_20201015_182419.jpg",
                ),
            )
        return sampleSpace.toList()
    }

    fun openDrawerButtonOnClick(view: View) {
        drawerLayout.openDrawer(GravityCompat.START)
    }

    fun foldDrawerButtonOnClick(view: View) {
        drawerLayout.closeDrawers()
    }
}
