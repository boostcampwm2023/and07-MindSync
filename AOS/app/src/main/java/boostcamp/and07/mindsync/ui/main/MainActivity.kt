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
import boostcamp.and07.mindsync.ui.base.BaseActivityViewModel
import boostcamp.and07.mindsync.ui.boardlist.UsersAdapter
import boostcamp.and07.mindsync.ui.profile.ProfileActivity
import boostcamp.and07.mindsync.ui.space.list.SpaceListFragmentDirections
import boostcamp.and07.mindsync.ui.util.ThrottleDuration
import boostcamp.and07.mindsync.ui.util.setClickEvent
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
    private val usersAdapter = UsersAdapter()

    override fun onStart() {
        super.onStart()
        mainViewModel.fetchProfile()
        mainViewModel.getSpaceUsers()
        mainViewModel.getSpaces()
        setTitle()
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

    override fun getViewModel(): BaseActivityViewModel {
        return mainViewModel
    }

    private fun setBinding() {
        binding.vm = mainViewModel
    }

    private fun observeEvent() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                mainViewModel.event.collectLatest { event ->
                    if (event is MainUiEvent.ShowMessage) {
                        showMessage(event.message)
                    }
                    if (event is MainUiEvent.GetUsers) {
                        mainViewModel.getSpaceUsers()
                    }
                    if (event is MainUiEvent.LeaveSpace) {
                        showMessage(getString(R.string.space_leave_room_message, event.spaceName))
                        navController.navigate(R.id.spaceListFragment)
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
            tvSideBarBoardList.setClickEvent(
                lifecycleScope,
                ThrottleDuration.LONG_DURATION.duration,
            ) {
                mainViewModel.uiState.value.nowSpace?.let { nowSpace ->
                    drawerLayout.closeDrawers()
                    navController.navigate(
                        SpaceListFragmentDirections.actionToBoardListFragment(
                            nowSpace.id,
                        ),
                    )
                } ?: run {
                    Toast.makeText(
                        this@MainActivity,
                        resources.getString(R.string.space_not_join),
                        Toast.LENGTH_SHORT,
                    ).show()
                }
            }

            tvSideBarRecycleBin.setClickEvent(
                lifecycleScope,
                ThrottleDuration.LONG_DURATION.duration,
            ) {
                drawerLayout.closeDrawers()
                mainViewModel.uiState.value.nowSpace?.let { nowSpace ->
                    drawerLayout.closeDrawers()
                    navController.navigate(
                        SpaceListFragmentDirections.actionToRecycleBinFragment(
                            spaceId = nowSpace.id,
                        ),
                    )
                } ?: run {
                    Toast.makeText(
                        this@MainActivity,
                        resources.getString(R.string.space_not_join),
                        Toast.LENGTH_SHORT,
                    ).show()
                }
            }

            imgbtnSideBarAddSpace.setClickEvent(
                lifecycleScope,
                ThrottleDuration.LONG_DURATION.duration,
            ) {
                drawerLayout.closeDrawers()
                navController.navigate(R.id.action_to_addSpaceDialog)
            }

            tvSideBarInviteSpace.setClickEvent(
                lifecycleScope,
                ThrottleDuration.LONG_DURATION.duration,
            ) {
                mainViewModel.uiState.value.nowSpace?.let { nowSpace ->
                    drawerLayout.closeDrawers()
                    navController.navigate(
                        SpaceListFragmentDirections.actionToInviteUserDialog(
                            nowSpace.id,
                        ),
                    )
                } ?: run {
                    Toast.makeText(
                        this@MainActivity,
                        resources.getString(R.string.space_not_join),
                        Toast.LENGTH_SHORT,
                    ).show()
                }
            }

            imgbtnSideBarProfile.setClickEvent(
                lifecycleScope,
                ThrottleDuration.LONG_DURATION.duration,
            ) {
                val intent = Intent(this@MainActivity, ProfileActivity::class.java)
                startActivity(intent)
            }

            tvSideBarLeaveSpace.setClickEvent(
                lifecycleScope,
                ThrottleDuration.LONG_DURATION.duration,
            ) {
                mainViewModel.leaveSpace()
                drawerLayout.closeDrawers()
                navController.popBackStack()
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
                if (navController.currentDestination!!.id == R.id.spaceListFragment) {
                    if (System.currentTimeMillis() - backPressedTime <= 2000L) {
                        backPressedToast?.cancel()
                        finish()
                    } else {
                        backPressedTime = System.currentTimeMillis()
                        backPressedToast?.show()
                    }
                } else {
                    navController.popBackStack()
                }
            }
        }
    }

    private fun setSideBar() {
        spaceAdapter = SideBarSpaceAdapter()
        spaceAdapter.setSideBarClickListener(
            object : SpaceClickListener {
                override fun onClickSpace(space: Space) {
                    navController.navigate(SpaceListFragmentDirections.actionToBoardListFragment(spaceId = space.id))
                    mainViewModel.updateCurrentSpace(space)
                }
            },
        )
        binding.includeMainInDrawer.rvSideBarSpace.adapter = spaceAdapter
        binding.includeMainInDrawer.rcvSideBarUsers.adapter = usersAdapter
    }

    fun openDrawerButtonOnClick(view: View) {
        drawerLayout.openDrawer(GravityCompat.START)
    }

    fun foldDrawerButtonOnClick(view: View) {
        drawerLayout.closeDrawers()
    }

    private fun setTitle() {
        navController.addOnDestinationChangedListener { _, destination, _ ->
            lifecycleScope.launch {
                mainViewModel.uiState.collectLatest { uiState ->
                    binding.tvMainTitle.text =
                        when {
                            uiState.spaces.isEmpty() -> getString(R.string.app_start)
                            destination.id == R.id.spaceListFragment -> getString(R.string.space_list_title)
                            destination.id == R.id.boardListFragment -> getString(R.string.board_list_title)
                            destination.id == R.id.recycleBinFragment -> getString(R.string.recyclebin_title)
                            else -> ""
                        }
                }
            }
        }
    }
}
