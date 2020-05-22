import { actionCreators, emptyProjectData, Project } from '@taskboar/model';

import { model, obtainTestUsers, TestUser } from './setup';

let user1: TestUser, user2: TestUser;
beforeAll(async () => {
  const testUsers = await obtainTestUsers(model);
  user1 = testUsers[0];
  user2 = testUsers[1];
});

test('a user can create and get a project', async () => {
  const projectId = await model.createProject(user1.token, 'my first project!');
  const project = await model.getProject(user1.token, projectId);
  expect(project).toEqual({
    ...project,
    id: projectId,
    title: project?.title
  });
});
