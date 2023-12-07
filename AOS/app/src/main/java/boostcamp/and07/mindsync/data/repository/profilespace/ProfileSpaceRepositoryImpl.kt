package boostcamp.and07.mindsync.data.repository.profilespace

import boostcamp.and07.mindsync.data.model.Space
import boostcamp.and07.mindsync.data.network.ProfileSpaceApi
import boostcamp.and07.mindsync.data.network.request.ProfileSpaceJoinRequest
import boostcamp.and07.mindsync.data.network.response.space.ProfileSpaceJoinData
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class ProfileSpaceRepositoryImpl
    @Inject
    constructor(
        private val profileSpaceApi: ProfileSpaceApi,
    ) : ProfileSpaceRepository {
        override fun joinSpace(spaceUuid: String): Flow<ProfileSpaceJoinData> =
            flow {
                val response = profileSpaceApi.joinSpace(ProfileSpaceJoinRequest(spaceUuid))
                response.data?.let { profileSpaceJoinData ->
                    emit(
                        profileSpaceJoinData,
                    )
                }
            }

        override fun getSpaces(): Flow<List<Space>> =
            flow {
                val response = profileSpaceApi.getSpaces()
                response.data?.let { spaceDatas ->
                    emit(
                        spaceDatas.map { spaceData ->
                            Space(
                                id = spaceData.uuid,
                                name = spaceData.name ?: "",
                                imageUrl = spaceData.icon ?: "",
                            )
                        },
                    )
                }
            }
    }
