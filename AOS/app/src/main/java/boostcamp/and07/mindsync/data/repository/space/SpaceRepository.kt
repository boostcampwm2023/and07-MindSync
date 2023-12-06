package boostcamp.and07.mindsync.data.repository.space

import boostcamp.and07.mindsync.data.model.Space
import okhttp3.MultipartBody
import okhttp3.RequestBody

interface SpaceRepository {
    suspend fun addSpace(
        name: RequestBody,
        icon: MultipartBody.Part,
    ): Result<Space>

    suspend fun getSpace(spaceUuid: String): Result<Space>

    suspend fun getInviteSpaceCode(spaceUuid: String): Result<String>
}
