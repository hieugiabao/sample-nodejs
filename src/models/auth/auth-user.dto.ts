import { UserRole } from '@entities/postgres-entities/user.entity';
import { Expose } from 'class-transformer';
import { ApiModel, ApiModelProperty } from 'swagger-express-ts';

@ApiModel({
  description: 'Auth user data',
  name: 'AuthUserDto',
})
export class AuthUserDto {
  @ApiModelProperty({
    description: 'Id of entity',
    required: false,
  })
  @Expose()
  id: number;

  @ApiModelProperty({
    description: 'Username',
    required: true,
  })
  @Expose()
  username: string;

  @ApiModelProperty({
    description: 'Email',
    required: true,
  })
  @Expose()
  email: string;

  @ApiModelProperty({
    description: 'Role',
    required: true,
    enum: Object.values(UserRole)
      .filter((i) => !isNaN(Number(i)))
      .map((value) => String(value)),
  })
  @Expose()
  role: UserRole;

  @ApiModelProperty({
    description: 'Created date',
    required: false,
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiModelProperty({
    description: 'Updated date',
    format: 'date-time',
    required: false,
  })
  @Expose()
  updatedAt: Date;
}
