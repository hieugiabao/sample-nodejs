import { ResponseBuilder } from '@common/utils/response-builder';
import { BaseResponse } from '@models/base.response';
import { ContentType, Controller, Get } from 'routing-controllers';
import { Service } from 'typedi';
import {
  ApiPath,
  SwaggerDefinitionConstant,
  ApiOperationGet,
} from 'swagger-express-ts';

@Controller('')
@Service()
@ApiPath({
  name: 'Health',
  path: '/',
})
export class HealthController {
  @Get('/health')
  @ContentType('application/json')
  @ApiOperationGet({
    path: 'health',
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
    responses: {
      200: {
        description: 'Success',
        type: SwaggerDefinitionConstant.Response.Type.STRING,
      },
    },
  })
  @Get('/')
  @ContentType('text/html')
  home(): string {
    return '<h1>Hello World!</h1>';
  }
}
