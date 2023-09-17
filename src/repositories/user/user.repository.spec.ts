import { UserEntity } from '@entities/postgres-entities/user.entity';
import { Repository } from 'typeorm';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let userRepositoryMock: MockType<Repository<UserEntity>>;

  beforeEach(async () => {
    try {
      userRepositoryMock = repositoryMockFactory();
      userRepository = new UserRepository(userRepositoryMock as any);
      expect(userRepository).toBeDefined();
    } catch (error) {
      console.log(error);
    }
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      const user = new UserEntity();
      user.username = 'testuser';
      userRepositoryMock.findOne.mockReturnValue(user);

      const result = await userRepository.findByUsername('testuser');

      expect(result).toEqual(user);
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });

    it('should return null if user is not found', async () => {
      userRepositoryMock.findOne.mockReturnValue(null);

      const result = await userRepository.findByUsername('testuser');

      expect(result).toBeNull();
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = new UserEntity();
      user.email = 'testuser@example.com';
      userRepositoryMock.findOne.mockReturnValue(user);

      const result = await userRepository.findByEmail('testuser@example.com');

      expect(result).toEqual(user);
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { email: 'testuser@example.com' },
      });
    });

    it('should return null if user is not found', async () => {
      userRepositoryMock.findOne.mockReturnValue(null);

      const result = await userRepository.findByEmail('testuser@example.com');

      expect(result).toBeNull();
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { email: 'testuser@example.com' },
      });
    });
  });

  describe('getProfile', () => {
    it('should return a user profile', async () => {
      const user = new UserEntity();
      user.id = 1;
      user.username = 'testuser';
      user.email = 'testuser@example.com';
      user.name = 'Test User';
      user.avatarUrl = 'https://example.com/avatar.png';
      user.location = 'Test Location';
      user.bio = 'Test Bio';
      userRepositoryMock.createQueryBuilder.mockReturnValue({
        setFindOptions: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockReturnValue(user),
      });

      const result = await userRepository.getProfile({
        id: 1,
        username: 'testuser',
        email: 'testuser@example.com',
      } as UserEntity);

      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        email: 'testuser@example.com',
        name: 'Test User',
        avatarUrl: 'https://example.com/avatar.png',
        location: 'Test Location',
        bio: 'Test Bio',
      });
      expect(userRepositoryMock.createQueryBuilder).toHaveBeenCalledWith('u');
    });

    it('should return null if user is not authenticated', async () => {
      const result = await userRepository.getProfile(null);

      expect(result).toBeNull();
      expect(userRepositoryMock.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const user = new UserEntity();
      user.username = 'testuser';
      user.email = 'testuser@example.com';
      userRepositoryMock.save.mockReturnValue(user);

      const result = await userRepository.createUser({
        username: 'testuser',
        email: 'testuser@example.com',
      });

      expect(result).toEqual(user);
      expect(userRepositoryMock.save).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'testuser@example.com',
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const user = new UserEntity();
      user.id = 1;
      user.username = 'testuser';
      user.email = 'testuser@example.com';
      user.name = 'Test User';
      user.avatarUrl = 'https://example.com/avatar.png';
      user.location = 'Test Location';
      user.bio = 'Test Bio';

      const updatedUser = new UserEntity();
      Object.assign(updatedUser, user, {
        name: 'New Name',
        avatarUrl: 'https://example.com/new-avatar.png',
        location: 'New Location',
        bio: 'New Bio',
      });

      userRepositoryMock.createQueryBuilder.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        updateEntity: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ raw: [updatedUser] }),
      });

      const result = await userRepository.update(
        {
          id: 1,
          username: 'testuser',
          email: 'testuser@example.com',
        } as UserEntity,
        {
          name: 'New Name',
          avatarUrl: 'https://example.com/new-avatar.png',
          location: 'New Location',
          bio: 'New Bio',
        },
      );

      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        email: 'testuser@example.com',
        name: 'New Name',
        avatarUrl: 'https://example.com/new-avatar.png',
        location: 'New Location',
        bio: 'New Bio',
      });
      expect(userRepositoryMock.createQueryBuilder).toHaveBeenCalledWith();
      expect(
        (userRepositoryMock.createQueryBuilder() as any).update,
      ).toHaveBeenCalledWith();
      expect(
        (userRepositoryMock.createQueryBuilder() as any).set,
      ).toHaveBeenCalledWith({
        name: 'New Name',
        avatarUrl: 'https://example.com/new-avatar.png',
        location: 'New Location',
        bio: 'New Bio',
      });
      expect(
        (userRepositoryMock.createQueryBuilder() as any).where,
      ).toHaveBeenCalledWith('id = :userId', { userId: 1 });
      expect(
        (userRepositoryMock.createQueryBuilder() as any).returning,
      ).toHaveBeenCalledWith('*');
      expect(
        (userRepositoryMock.createQueryBuilder() as any).updateEntity,
      ).toHaveBeenCalledWith(true);
      expect(
        (userRepositoryMock.createQueryBuilder() as any).execute,
      ).toHaveBeenCalled();
    });

    it('should return null if user is not authenticated', async () => {
      const result = await userRepository.update(null, {});

      expect(result).toBeNull();
      expect(userRepositoryMock.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('deleteAccount', () => {
    it('should delete a user account', async () => {
      userRepositoryMock.delete.mockReturnValue({ affected: 1 });

      const result = await userRepository.deleteAccount({
        id: 1,
        username: 'testuser',
        email: 'testuser@example.com',
      } as UserEntity);

      expect(result).toBe(true);
      expect(userRepositoryMock.delete).toHaveBeenCalledWith(1);
    });

    it('should return false if user is not authenticated', async () => {
      const result = await userRepository.deleteAccount(null);

      expect(result).toBe(false);
      expect(userRepositoryMock.delete).not.toHaveBeenCalled();
    });
  });
});

type MockType<T> = {
  [P in keyof T]: jest.Mock<{}>;
};

const repositoryMockFactory: () => MockType<Repository<UserEntity>> = jest.fn(
  () =>
    ({
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    }) as any,
);
