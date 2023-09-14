import { ResponseBuilder } from '@common/utils/response-builder';
import { BaseResponse } from '@models/base.response';
import { ContentType, Controller, Get } from 'routing-controllers';
import { Service } from 'typedi';
import {
  ApiPath,
  SwaggerDefinitionConstant,
  ApiOperationGet,
} from 'swagger-express-ts';
import { ApiEnum } from '@models/enums/api-category.enum';

@Controller('')
@Service()
@ApiPath({
  name: 'Health',
  path: '',
})
export class HealthController {
  @Get(ApiEnum.HEALTH)
  @ContentType('application/json')
  @ApiOperationGet({
    path: ApiEnum.HEALTH,
    description: 'Check health of server',
    responses: {
      200: {
        description: 'Success',
        type: SwaggerDefinitionConstant.Response.Type.OBJECT,
        model: 'BaseResponse',
      },
      500: {
        description: 'Internal server error',
        type: SwaggerDefinitionConstant.Response.Type.OBJECT,
        model: 'BaseResponse',
      },
    },
  })
  checkHealth(): BaseResponse<string> {
    return new ResponseBuilder('OK').build();
  }

  @ApiOperationGet({
    description: 'Get home message',
    path: ApiEnum.HOME,
    responses: {
      200: {
        description: 'Success',
        type: SwaggerDefinitionConstant.Response.Type.STRING,
      },
    },
  })
  @Get(ApiEnum.HOME)
  @ContentType('text/html')
  home(): string {
    return '<h1>Hello World!</h1>';
  }
}
