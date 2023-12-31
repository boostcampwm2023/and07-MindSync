package boostcamp.and07.mindsync.data.network.api

import boostcamp.and07.mindsync.data.network.request.space.ProfileSpaceJoinRequest
import boostcamp.and07.mindsync.data.network.response.space.GetSpacesResponse
import boostcamp.and07.mindsync.data.network.response.space.ProfileSpaceJoinResponse
import boostcamp.and07.mindsync.data.network.response.user.UserResponse
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface ProfileSpaceApi {
    @POST("profileSpace/join")
    suspend fun joinSpace(
        @Body profileSpaceJoinRequest: ProfileSpaceJoinRequest,
    ): ProfileSpaceJoinResponse

    @GET("profileSpace/spaces")
    suspend fun getSpaces(): GetSpacesResponse

    @GET("profileSpace/users/{space_uuid}")
    suspend fun getSpaceUsers(
        @Path("space_uuid") spaceUuid: String,
    ): UserResponse

    @DELETE("profileSpace/leave/{space_uuid}")
    suspend fun leaveSpace(
        @Path("space_uuid") spaceUuid: String,
    )
}
