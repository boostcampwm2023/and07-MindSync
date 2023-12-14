import { HttpStatus } from '@nestjs/common';
import { InsertDataType } from 'src/temporary-database/temporary-database.service';
type TokenDataType = {
  access_token: string;
  refresh_token?: string;
};
type InviteDataType = {
  invite_code: string;
};

type ExtendedDataType =
  | InsertDataType
  | TokenDataType
  | InviteDataType
  | InsertDataType[];

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
