package boostcamp.and07.mindsync.data.repository.profilespace

import boostcamp.and07.mindsync.data.network.response.space.ProfileSpaceJoinData
import kotlinx.coroutines.flow.Flow

interface ProfileSpaceRepository {
    fun joinSpace(spaceUuid: String): Flow<ProfileSpaceJoinData>
}
