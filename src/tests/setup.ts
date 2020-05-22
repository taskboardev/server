import { App } from '../app';
import { randomString } from '../util';
import { Model } from '../model';

export const { model, httpServer } = App();

export async function obtainTestUsers(model: Model) {
  const [userId1, userId2] = await Promise.all([
    model.auth.createUser(`taskboar+${randomString()}@gmail.com`, 'password123'),
    model.auth.createUser(`taskboar+${randomString()}@gmail.com`, 'password123')
  ]);

  const [token1, token2] = await Promise.all([
    model.auth.obtainIdToken(userId1),
    model.auth.obtainIdToken(userId2),
  ]);

  return {
    user1: {
      id: userId1,
      token: token1
    },
    user2: {
      id: userId2,
      token: token2
    }
  };
}
