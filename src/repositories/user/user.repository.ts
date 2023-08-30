import { InjectRepository } from '@common/decorators/inject-repository.decorator';
import { UserEntity } from '@entities/postgres-entities/user.entity';
import { Service } from 'typedi';
import { DeepPartial, Repository } from 'typeorm';

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

  async save(user: DeepPartial<UserEntity>): Promise<UserEntity> {
    return this.repo.save(user);
  }
}
