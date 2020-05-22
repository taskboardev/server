import { DynamoDB } from 'aws-sdk';

import { App } from '../app';
import { makeServer } from '../../src/server';

require('dotenv').config();

const logger = console;

const dynamoRegion = process.env.DYNAMO_REGION;
const dynamoEndpoint = process.env.DYNAMO_ENDPOINT;
const dynamoTable = process.env.DYNAMO_TABLE;
if (!dynamoTable) {
  logger.error('dynamo table is required');
  process.exit(1);
}

const firebaseDbName = process.env.FIREBASE_DB_NAME;
if (!firebaseDbName) {
  logger.error('firebase db name is required');
  process.exit(1);
}

const firebaseConfigPath = process.env.FIREBASE_CONFIG;
if (!firebaseConfigPath) {
  logger.error('firebase config path is required');
  process.exit(1);
}

try {
  const firebaseConfig = require(__dirname + '/../' + firebaseConfigPath);

  const dynamodb = new DynamoDB({
    region: dynamoRegion,
    endpoint: dynamoEndpoint,
  });

  const app = new App({
    dynamodb,
    dynamoTable,
    firebaseConfig,
    firebaseDbName,
    logger: console
  });

  const server = makeServer({ app, logger });
  server.run(8001);
} catch (error) {
  logger.error(error.message);
}

