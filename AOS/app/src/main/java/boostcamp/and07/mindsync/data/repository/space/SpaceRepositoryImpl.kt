package boostcamp.and07.mindsync.data.repository.space

import android.util.Log
import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.data.network.SpaceApi
import boostcamp.and07.mindsync.data.network.request.space.InviteCodeRequest
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import okhttp3.MultipartBody
import okhttp3.RequestBody
import javax.inject.Inject

class SpaceRepositoryImpl
    @Inject
    constructor(private val spaceApi: SpaceApi) : SpaceRepository {
        override fun addSpace(
            name: RequestBody,
            icon: MultipartBody.Part,
        ): Flow<Space> =
            flow {
                val response = spaceApi.addSpace(name, icon)
                Log.d("Jaehan", "response: $response")
                response.data?.let { spaceData ->
                    emit(
                        Space(
                            id = spaceData.uuid,
                            name = spaceData.name ?: "",
                            imageUrl = spaceData.icon ?: "",
                        ),
                    )
                }
            }

        override fun getSpace(spaceUuid: String): Flow<Space> =
            flow {
                val response = spaceApi.getSpace(spaceUuid)
                response.data?.let { spaceData ->
                    emit(
                        Space(
                            id = spaceData.uuid,
                            name = spaceData.name ?: "",
                            imageUrl = spaceData.icon ?: "",
                        ),
                    )
                }
            }

        override fun getInviteSpaceCode(spaceUuid: String): Flow<String> =
            flow {
                val response = spaceApi.getInviteCode(InviteCodeRequest(spaceUuid))
                response.data?.let { inviteCodeData ->
                    emit(
                        inviteCodeData.inviteCode,
                    )
                }
            }

        override fun joinInviteCode(inviteCode: String): Flow<Space> =
            flow {
                val response = spaceApi.inviteSpaceCode(inviteCode)
                response.data?.let { spaceData ->
                    emit(
                        Space(
                            id = spaceData.uuid,
                            name = spaceData.name ?: "",
                            imageUrl = spaceData.icon ?: "",
                        ),
                    )
                }
            }
    }
