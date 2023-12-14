package boostcamp.and07.mindsync.data.network.api

import boostcamp.and07.mindsync.data.network.request.space.InviteCodeRequest
import boostcamp.and07.mindsync.data.network.response.space.InviteCodeResponse
import boostcamp.and07.mindsync.data.network.response.space.SpaceResponse
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path

interface SpaceApi {
    @POST("spaces")
    @Multipart
    suspend fun addSpace(
        @Part("name") name: RequestBody,
        @Part icon: MultipartBody.Part?,
    ): SpaceResponse

    @GET("spaces/{space_uuid}")
    suspend fun getSpace(
        @Path("space_uuid") spaceUuid: String,
    ): SpaceResponse

    @POST("inviteCodes")
    suspend fun getInviteCode(
        @Body inviteCodeRequest: InviteCodeRequest,
    ): InviteCodeResponse

    @GET("inviteCodes/{inviteCode}")
    suspend fun inviteSpaceCode(
        @Path("inviteCode") inviteCode: String,
    ): SpaceResponse
}
