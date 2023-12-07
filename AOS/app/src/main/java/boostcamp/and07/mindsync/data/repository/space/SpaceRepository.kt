package boostcamp.and07.mindsync.data.repository.space

import boostcamp.and07.mindsync.data.model.Space
import kotlinx.coroutines.flow.Flow
import okhttp3.MultipartBody
import okhttp3.RequestBody

interface SpaceRepository {
    suspend fun addSpace(
        name: RequestBody,
        icon: MultipartBody.Part,
    ): Flow<Space>

    suspend fun getSpace(spaceUuid: String): Flow<Space>

    suspend fun getInviteSpaceCode(spaceUuid: String): Flow<String>

    suspend fun joinInviteCode(inviteCode: String): Flow<Space>
}
