import { ResponseBuilder } from '@utils/response-builder';
import { ResponsePayload } from '@models/response-payload';
import { ResponseCodeEnum } from './enums/response-code.enum';

export class ApiError extends Error {
  public _status: number;

  protected readonly _message: string;

  protected readonly _errorCode: ResponseCodeEnum;

  constructor(status: number, errorCode: ResponseCodeEnum, message?: string) {
    super(message);
    this._status = status;
    this._message = message;
    this._errorCode = errorCode;
  }

  get status(): number {
    return this._status;
  }

  get message(): string {
    return this._message;
  }

  get errorCode(): ResponseCodeEnum {
    return this._errorCode;
  }

  toErrorResponse(): ResponsePayload<void> {
    const builder = new ResponseBuilder<void>()
      .error()
      .withCode(this._errorCode);
    if (this.message) {
      builder.withMessage(this.message);
    }
    return builder.build();
  }
}
