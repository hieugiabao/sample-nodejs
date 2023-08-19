import { ResponseCodeEnum } from './enums/response-code.enum';
import { ResponseTypeEnum } from './enums/response-type.enum';
import { ApiModel, ApiModelProperty } from 'swagger-express-ts';

@ApiModel({
  description: 'Response payload',
  name: 'ResponsePayload',
})
export class ResponsePayload<T> {
  @ApiModelProperty({
    description: 'Response type. 0 = success, 1 = error',
    example: [0, 1],
    required: true,
  })
  type: ResponseTypeEnum;

  @ApiModelProperty({
    description: 'Error code when error occurred',
    required: false,
  })
  code?: ResponseCodeEnum;

  @ApiModelProperty({
    description: 'Message of response',
    example: 'Handle success',
    required: false,
  })
  message?: string;

  @ApiModelProperty({
    description: 'Data of response',
    required: false,
  })
  data?: T;

  @ApiModelProperty({
    description: 'Meta data of response',
    required: false,
  })
  meta?: unknown;

  @ApiModelProperty({
    description: '__debug__',
    required: false,
  })
  __debug__?: unknown;
}
