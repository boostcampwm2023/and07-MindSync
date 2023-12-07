package boostcamp.and07.mindsync.data.repository.profilespace

import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.data.network.response.space.ProfileSpaceJoinData
import boostcamp.and07.mindsync.data.network.response.user.UserData
import kotlinx.coroutines.flow.Flow

interface ProfileSpaceRepository {
    fun joinSpace(spaceUuid: String): Flow<ProfileSpaceJoinData>

    fun getSpaces(): Flow<List<Space>>

    fun getSpaceUsers(spaceUuid: String): Flow<List<UserData>>
}
