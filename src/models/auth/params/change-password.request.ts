import { IsMatchWith } from '@common/decorators/validators/is-match-with.decorator';
import { IsNotEmpty } from 'class-validator';
import { ApiModel, ApiModelProperty } from 'swagger-express-ts';

@ApiModel({
  description: 'Change password',
  name: 'ChangePasswordRequest',
})
export class ChangePasswordRequest {
  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  oldPassword: string;

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  newPassword: string;

  @ApiModelProperty({ required: true })
  @IsNotEmpty()
  @IsMatchWith('newPassword')
  confirmPassword: string;
}
