import request from 'supertest';
import { actionCreators, emptyProjectData, Project } from '@taskboar/model';

import { model, TestUser, baseUrl, setupSuite, TestSuite } from './setup';

describe('a user can update a project', () => {
  let suite: TestSuite;
  beforeAll(async () => {
    suite = await setupSuite();
  });

  test('via model', async () => {
    // setup
    const { action, project } = await setupTest(suite.user1);

    // act
    await model.updateProjectData(suite.user1.token, project.id, action);

    // verify
    const updated = await model.getProject(suite.user1.token, project.id);
    const expected = getExpected(project);
    expect(updated).toEqual(expected);
  });

  test('via http server', async () => {
    // setup
    const { action, project } = await setupTest(suite.user1);

    // act
    await request(suite.httpServer)
      .patch(`/projects/${project.id}`)
      .set('Authorization', suite.user1.authHeader)
      .send(action);

    // verify
    const updated = await model.getProject(suite.user1.token, project.id);
    const expected = getExpected(project);
    expect(updated).toEqual(expected);
  });

  async function setupTest(user: TestUser) {
    const projectId = await model.createProject(user.token, 'my first project!');
    const project = await model.getProject(user.token, projectId) as Project;

    const action = actionCreators.batch(
      actionCreators.create('user', 'u1', { id: 'u1', username: 'user1' }),
      actionCreators.create('status', 's1', { id: 's1', title: 'Status 1' }),
      actionCreators.create('task', 't1', { id: 't1', title: 'Task 1', creatorId: 'u1' }),
      actionCreators.attach('user', 'u1', 'createdTaskIds', 't1'),
      actionCreators.attach('status', 's1', 'taskIds', 't1'),
    );

    return { project, action };
  }

  function getExpected(original: Project): Project {
    return {
      ...original,
      data: {
        entities: {
          ...emptyProjectData.entities,
          user: {
            'u1': { id: 'u1', username: 'user1', createdTaskIds: ['t1'] }
          },
          status: {
            's1': { id: 's1', title: 'Status 1', taskIds: ['t1'] },
          },
          task: {
            't1': { id: 't1', title: 'Task 1', statusId: 's1', creatorId: 'u1' }
          },
        },
        ids: {
          ...emptyProjectData.ids,
          user: ['u1'],
          status: ['s1'],
          task: ['t1'],
        }
      }
    };
  }
});
