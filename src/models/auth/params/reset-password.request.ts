import { IsMatchWith } from '@common/decorators/validators/is-match-with.decorator';
import { IsEmail, IsNotEmpty, IsNumberString, Length } from 'class-validator';
import { ApiModel, ApiModelProperty } from 'swagger-express-ts';

@ApiModel({
  description: 'Reset password',
  name: 'ResetPasswordRequest',
})
export class ResetPasswordRequest {
  @ApiModelProperty({ required: true })
  @IsEmail()
  email: string;

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  @Length(6, 6)
  @IsNumberString()
  code: string;

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  newPassword: string;

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  @IsMatchWith('newPassword')
  confirmPassword: string;
}
