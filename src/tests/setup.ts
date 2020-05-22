import { Express } from 'express';
import { Server } from 'http';

import { App } from '../app';
import { Model } from '../model';
import * as env from '../env';

const user1Id = env.getVariable('TEST_USER1_ID');
const user2Id = env.getVariable('TEST_USER2_ID');

export const { model, httpServer } = App();

export const port = 8004;
export const baseUrl = `http://localhost:${port}`;

export interface TestUser {
  id: string,
  token: string,
  authHeader: string
}

export async function obtainTestUsers(model: Model): Promise<[TestUser, TestUser]> {
  const [token1, token2] = await Promise.all([
    model.auth.obtainIdToken(user1Id),
    model.auth.obtainIdToken(user2Id),
  ]);

  return [
    { id: user1Id, token: token1, authHeader: `Bearer ${token1}` },
    { id: user2Id, token: token2, authHeader: `Bearer ${token2}` }
  ];
}

export interface TestSuite {
  user1: TestUser,
  user2: TestUser,
  httpServer: Express,
  // startServer: () => void,
  // stopServer: (callback?: (err?: Error) => void) => any
}

export async function setupSuite(): Promise<TestSuite> {
  const [user1, user2] = await obtainTestUsers(model);
  // let instance: Server;
  //
  // const startServer = () => {
  //   instance = httpServer.listen(port);
  // };
  //
  // const stopServer = () => {
  //   instance.close.bind(instance);
  // };

  return {
    user1,
    user2,
    httpServer,
    // startServer,
    // stopServer,
  };
}
