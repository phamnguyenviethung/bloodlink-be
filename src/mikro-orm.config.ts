import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { config } from 'dotenv';

config();

export default defineConfig({
  highlighter: new SqlHighlighter(),
  debug: process.env.NODE_ENV === 'development',
  dbName: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  entities: ['./dist/database/entities/*.entity.js'],
  entitiesTs: ['./src/database/entities/*.entity.ts'],
  extensions: [Migrator, SeedManager],
  migrations: {
    path: 'dist/database/migrations',
    pathTs: 'src/database/migrations',
  },
  seeder: {
    path: './dist/database/seeders',
    pathTs: './src/database/seeders',
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
    fileName: (className: string) => className,
  },
});
