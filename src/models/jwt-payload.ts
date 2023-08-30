import { UserRole } from '@entities/postgres-entities/user.entity';

export interface JwtPayload {
  email: string;
  username: string;
  role: UserRole;
}
