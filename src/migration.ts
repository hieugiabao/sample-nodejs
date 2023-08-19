import 'reflect-metadata';
import { Database } from '@config/db';
import { logger } from '@common/logger';
import { argv } from 'process';

console.log('!!!!!!!!!!!!!!!!!!!!!!!!! Migration !!!!!!!!!!!!!!!!!!!!!!!!!');

export const handler = async (event: string): Promise<string> => {
  logger.info('Action:', event);
  const dataSource = await Database.getPostgresConnection();

  switch (event) {
    case 'up':
      await dataSource.runMigrations();
      break;
    case 'down':
      await dataSource.undoLastMigration();
      break;
    case 'drop':
      await dataSource.dropDatabase();
      break;
    case 'show':
      await dataSource.showMigrations();
      break;
    default:
      throw new Error('Unknown event');
  }

  return 'Done';
};

handler(argv[2]);
