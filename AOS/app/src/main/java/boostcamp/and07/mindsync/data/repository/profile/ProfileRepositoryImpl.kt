package boostcamp.and07.mindsync.data.repository.profile

import boostcamp.and07.mindsync.data.model.Profile
import boostcamp.and07.mindsync.data.network.ProfileApi
import kotlinx.coroutines.flow.flow
import okhttp3.MultipartBody
import okhttp3.RequestBody
import javax.inject.Inject

class ProfileRepositoryImpl
    @Inject
    constructor(private val profileApi: ProfileApi) : ProfileRepository {
        override fun getProfile() =
            flow {
                profileApi.getProfile().data?.let { responseData ->
                    emit(
                        Profile(
                            id = responseData.uuid,
                            nickname = responseData.nickname ?: "",
                            imageUrl = responseData.image ?: "",
                        ),
                    )
                }
            }

        override fun patchProfile(
            nickname: RequestBody,
            image: MultipartBody.Part?,
        ) = flow {
            profileApi.patchProfile(nickname, image).data?.let { responseData ->
                emit(
                    Profile(
                        id = responseData.uuid,
                        nickname = responseData.nickname ?: "",
                        imageUrl = responseData.image ?: "",
                    ),
                )
            }
        }
    }
