import { model, obtainTestUsers } from './setup';

test('model', async () => {
  const testUsers = await obtainTestUsers(model);
  console.log(testUsers);
});
