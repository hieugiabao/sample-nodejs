import 'reflect-metadata';
import readline from 'readline';
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
      var rl = readline.createInterface(process.stdin, process.stdout);
      console.log(
        '\x1b[31m%s\x1b[0m',
        '!!!!!!!!!!!!!!!!!!! DANGEROUS ACTION !!!!!!!!!!!!!!!!!!!',
      );
      rl.question('Still done? [yes]/no: ', async (answer) => {
        if (answer !== 'yes') {
          console.log('Aborted');
          process.exit(0);
        } else {
          await dataSource.undoLastMigration();
        }
      });
      break;
    case 'drop':
      var rl = readline.createInterface(process.stdin, process.stdout);
      console.log(
        '\x1b[31m%s\x1b[0m',
        '!!!!!!!!!!!!!!!!!!! DANGEROUS ACTION !!!!!!!!!!!!!!!!!!!',
      );
      rl.question('Still done? [yes]/no: ', async (answer) => {
        if (answer !== 'yes') {
          console.log('Aborted');
          process.exit(0);
        } else {
          await dataSource.dropDatabase();
        }
      });
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
