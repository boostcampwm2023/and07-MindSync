package boostcamp.and07.mindsync.ui.space.join

import boostcamp.and07.mindsync.data.network.NetworkManager
import boostcamp.and07.mindsync.data.repository.login.LogoutEventRepository
import boostcamp.and07.mindsync.ui.base.BaseActivityViewModel

class AddInviteSpaceViewModel(
    logoutEventRepository: LogoutEventRepository,
    networkManager: NetworkManager,
) :
    BaseActivityViewModel(logoutEventRepository,networkManager)
