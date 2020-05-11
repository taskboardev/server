import { DynamoDB } from 'aws-sdk';

import { App } from '../app';
import { makeServer } from '../server/server';

require('dotenv').config();

const dynamoRegion = process.env.DYNAMO_REGION;
const dynamoEndpoint = process.env.DYNAMO_ENDPOINT;
const dynamoTable = process.env.DYNAMO_TABLE;
if (!dynamoTable) {
  throw new Error('dynamo table is required')
}

const firebaseDbName = process.env.FIREBASE_DB_NAME;
if (!firebaseDbName) {
  throw new Error('firebase db name is required')
}

const firebaseConfigPath = process.env.FIREBASE_CONFIG;
if (!firebaseConfigPath) {
  throw new Error('firebase config path is required')
}
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
});

const server = makeServer(app);

server.run(8001);
