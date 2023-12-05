package boostcamp.and07.mindsync.ui.main

import androidx.lifecycle.ViewModel
import boostcamp.and07.mindsync.data.repository.profile.ProfileRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class MainViewModel
    @Inject
    constructor(
        private val profileRepository: ProfileRepository,
    ) : ViewModel() {
    }
