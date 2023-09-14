import { IsEmail } from 'class-validator';
import { ApiModel, ApiModelProperty } from 'swagger-express-ts';

@ApiModel({
  description: 'Forgot password request',
  name: 'ForgotPasswordRequest',
})
export class ForgotPasswordRequest {
  @IsEmail()
  @ApiModelProperty({
    required: true,
  })
  email: string;
}
