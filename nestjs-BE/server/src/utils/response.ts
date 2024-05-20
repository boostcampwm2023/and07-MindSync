import { HttpStatus } from '@nestjs/common';

type TokenDataType = {
  access_token: string;
  refresh_token?: string;
};
type InviteDataType = {
  invite_code: string;
};

type ExtendedDataType = TokenDataType | InviteDataType;

export class ResponseUtils {
  private static messages = new Map([
    [HttpStatus.OK, 'Success'],
    [HttpStatus.CREATED, 'Created'],
    [HttpStatus.NOT_FOUND, 'Not Found'],
    [HttpStatus.NO_CONTENT, 'No Content'],
  ]);

  static createResponse(status: HttpStatus, data?: ExtendedDataType) {
    const response: any = {
      statusCode: status,
      message: this.messages.get(status),
    };
    if (data) response.data = data;

    return response;
  }
}
