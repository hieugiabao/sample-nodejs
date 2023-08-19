import { BaseResponse } from './base.response';
import { ValidationError } from 'class-validator';
import { ResponseBuilder } from '@utils/response-builder';
import { ResponseCodeEnum } from './enums/response-code.enum';
import { ApiError } from './api-error';
import { StatusCodes } from 'http-status-codes';

export class ValidationRequestError extends ApiError {
  private readonly _errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super(StatusCodes.BAD_REQUEST, ResponseCodeEnum.C0005);
    this._errors = errors;
  }

  toResponse(): BaseResponse<void> {
    return new ResponseBuilder<void>().error().withErrors(this._errors).build();
  }
}
