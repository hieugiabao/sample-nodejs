import { ValidationError } from 'class-validator';
import { BaseResponse } from '@models/base.response';
import { getMessage, ResponseCodeEnum } from '@models/enums/response-code.enum';
import { ResponseTypeEnum } from '@models/enums/response-type.enum';

export class ResponseBuilder<E> {
  private payload: BaseResponse<E> = {
    type: ResponseTypeEnum.SUCCESS,
  };

  private message: string;

  private errors: ValidationError[];

  constructor(data?: E) {
    this.payload.data = data;
  }

  success() {
    this.payload.type = ResponseTypeEnum.SUCCESS;
    return this;
  }

  error() {
    this.payload.type = ResponseTypeEnum.ERROR;
    return this;
  }

  withData(data: E) {
    this.payload.data = data;
    return this;
  }

  withCode(code: ResponseCodeEnum) {
    this.payload.code = code;
    this.payload.message = getMessage(code);
    return this;
  }

  withMessage(message: string) {
    this.message = message;
    return this;
  }

  withMeta(meta: unknown) {
    this.payload.meta = meta;
    return this;
  }

  withNextPageToken(token: any) {
    this.payload.nextPageToken = token ? String(token) : null;
    return this;
  }

  build() {
    if (this.message) {
      this.payload.message = this.message;
    }
    if (this.errors) {
      this.payload.errors = this.errors;
    }
    return this.payload;
  }

  withErrors(errors: ValidationError[]) {
    this.errors = errors;
    return this;
  }
}
