import { InjectRepository } from '@common/decorators/inject-repository.decorator';
import { UserEntity } from '@entities/postgres-entities/user.entity';
import { AuthUserDto } from '@models/auth/auth-user.dto';
import { UserInformationDto } from '@models/user/user-information.dto';
import { plainToInstance } from 'class-transformer';
import { Service } from 'typedi';
import { DeepPartial, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Service()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { username } });
  }

  async getProfile(user: AuthUserDto): Promise<UserInformationDto | null> {
    if (!user) {
      return null;
    }
    const userEntity = await this.repo
      .createQueryBuilder('u')
      .setFindOptions({
        select: [
          'id',
          'username',
          'email',
          'name',
          'avatarUrl',
          'location',
          'bio',
        ],
        take: 1,
      })
      .getOne();
    console.dir(userEntity);
    return plainToInstance(UserInformationDto, userEntity, {
      excludeExtraneousValues: true,
    });
  }

  async createUser(user: DeepPartial<UserEntity>): Promise<UserEntity> {
    return this.repo.save(user);
  }

  async update(
    user: AuthUserDto,
    dataBody: QueryDeepPartialEntity<UserEntity>,
  ): Promise<UserInformationDto | null> {
    if (!user) {
      return null;
    }

    const res = await this.repo
      .createQueryBuilder()
      .update()
      .set(dataBody)
      .where('id = :userId', { userId: user.id })
      .returning('*')
      .updateEntity(true)
      .execute();

    return plainToInstance(UserInformationDto, res.raw[0], {
      excludeExtraneousValues: true,
    });
  }

  async deleteAccount(user: AuthUserDto): Promise<boolean> {
    if (!user) {
      return false;
    }

    const res = await this.repo.delete(user.id);
    return res.affected > 0;
  }
}
