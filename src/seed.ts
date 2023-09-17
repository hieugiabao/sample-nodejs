import 'reflect-metadata';
import { logger } from '@common/logger';
import { Database } from '@config/db';
import { importFiles, loadFiles } from '@seeds/utils/file.util';
import { SeederConstructor, runSeeder } from '@seeds/core';
import { DataSource } from 'typeorm';

console.log('!!!!!!!!!!!!!!!!!!!!!!!!! Seeding !!!!!!!!!!!!!!!!!!!!!!!!!');

export const handler = async (
  event: string,
  clazz: string,
): Promise<string> => {
  logger.info('Action:', event);
  const dataSource = await Database.getPostgresConnection();

  switch (event) {
    case 'run':
      await seeding(dataSource, clazz);
      break;
    default:
      throw new Error('Unknown event');
  }

  return 'Done';
};

const seeding = async (dataSource: DataSource, clazz: string) => {
  try {
    logger.debug('Importing factories');
    const factoryFiles = loadFiles([
      'src/seeds/factories/**/*.factory.{js,ts}',
    ]);
    await importFiles(factoryFiles);
    logger.debug('Factories are imported');

    logger.debug('Importing seeders');
    const seedFiles = loadFiles(['src/seeds/*.seed.{js,ts}']);
    let seedFileObjects: any[] = [];
    seedFileObjects = await Promise.all(
      seedFiles.map((seedFile) => importSeed(seedFile)),
    );
    seedFileObjects = seedFileObjects.filter(
      (seedFileObject) => clazz === undefined || clazz === seedFileObject.name,
    );
    logger.debug('Seeders are imported');

    // Run seeds
    for (const seedFileObject of seedFileObjects) {
      logger.debug(`Executing ${seedFileObject.name} Seeder`);
      try {
        await runSeeder(seedFileObject, dataSource);
        logger.debug(`Seeder ${seedFileObject.name} executed`);
      } catch (error) {
        logger.error(`Could not run the seed ${seedFileObject.name}!`);
      }
    }

    logger.info('👍 Finished Seeding');
    process.exit(0);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const importSeed = async (
  filePath: string,
): Promise<SeederConstructor> => {
  const seedFileObject: { [key: string]: SeederConstructor } = await import(
    filePath
  );
  const keys = Object.keys(seedFileObject);
  return seedFileObject[keys[0]];
};

handler(process.argv[2], process.argv[3]);
