import { ServiceAccount } from 'firebase-admin';

import { FirebaseAuth } from './auth';
import { DynamoDbPersistence } from './persistence';
import { Model } from './model';
import { HttpServer } from './server';
import * as env from './env';

require('dotenv').config();
const dynamoRegion = env.getVariable('DYNAMO_REGION');
const dynamoEndpoint = env.getVariable('DYNAMO_ENDPOINT');
const dynamoTable = env.getVariable('DYNAMO_TABLE');
const firebaseDbUrl = env.getVariable('FIREBASE_DB_URL');
const firebaseApiKey = env.getVariable('FIREBASE_APIKEY');
const firebaseCredentials = env.getByPath<ServiceAccount>('FIREBASE_CREDENTIALS_PATH');

export const App = () => {
  const logger = console;
  const auth = new FirebaseAuth(firebaseCredentials, firebaseDbUrl, firebaseApiKey);
  const persistence = new DynamoDbPersistence(dynamoRegion, dynamoEndpoint, dynamoTable);
  const model = new Model({ auth, persistence, logger });

  const httpServer = HttpServer({ model, logger });

  return {
    model,
    httpServer,
  }
};
