import { ValidationError } from 'class-validator';
import { ResponseCodeEnum } from './enums/response-code.enum';
import { ResponseTypeEnum } from './enums/response-type.enum';
import {
  ApiModel,
  ApiModelProperty,
  SwaggerDefinitionConstant,
} from 'swagger-express-ts';

@ApiModel({
  description: 'Base response',
  name: 'BaseResponse',
})
export class BaseResponse<E> {
  @ApiModelProperty({
    description: 'Response type. 0 = success, 1 = error',
    required: true,
    enum: Object.values(ResponseTypeEnum)
      .filter((i) => !isNaN(Number(i)))
      .map((value) => String(value)),
  })
  type: ResponseTypeEnum;

  @ApiModelProperty({
    description: 'Message of response',
    example: 'Handle success',
    required: false,
  })
  message?: string;

  @ApiModelProperty({
    description: 'Response code when error occurred',
    required: false,
    enum: Object.values(ResponseCodeEnum),
  })
  code?: ResponseCodeEnum;

  @ApiModelProperty({
    description: 'Data of response',
    required: false,
  })
  data?: E;

  @ApiModelProperty({
    description: 'Meta data of response',
    required: false,
  })
  meta?: unknown;

  @ApiModelProperty({
    description: 'Next page token',
    required: false,
  })
  nextPageToken?: string;

  @ApiModelProperty({
    description: 'Errors of response',
    required: false,
    type: SwaggerDefinitionConstant.Response.Type.ARRAY,
  })
  errors?: ValidationError[];
}
