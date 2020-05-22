import { DynamoDB } from 'aws-sdk';
import { emptyProjectData, actionCreators } from '@taskboar/model';

import { App } from './app';
import { Project } from './interfaces';
import { randomString } from '../../lib/rand';

const dynamoRegion = process.env.DYNAMO_REGION;
const dynamoEndpoint = process.env.DYNAMO_ENDPOINT;
const dynamoTable = process.env.DYNAMO_TABLE;
if (!dynamoTable) {
  throw new Error('DYNAMO_TABLE not found');
}

const firebaseDbName = process.env.FIREBASE_DB_NAME;
if (!firebaseDbName) {
  throw new Error('FIREBASE_DB_NAME not found')
}
const firebaseConfigPath = process.env.FIREBASE_CONFIG;
const firebaseConfig = require(__dirname + '/../' + firebaseConfigPath);
const dynamoClient = new DynamoDB({
  region: dynamoRegion,
  endpoint: dynamoEndpoint,
});
const app = new App({
  dynamodb: dynamoClient,
  firebaseConfig: firebaseConfig,
  logger: console,
  firebaseDbName,
  dynamoTable,
});

describe('app', () => {
  test('create, get, and replace project', async () => {
    const ownerId = randomString();

    // create and get
    const project1 = { id: randomString(), ownerId, title: randomString() };
    const project2 = { id: randomString(), ownerId, title: randomString(), };
    await app.createProject(project1.id, project1.ownerId, project1.title);
    await app.createProject(project2.id, project2.ownerId, project2.title);

    const retrieved1 = await app.getProject(project1.id) as Project;
    const retrieved2 = await app.getProject(project2.id) as Project;
    expect(retrieved1).toEqual({ ...project1, data: emptyProjectData });
    expect(retrieved2).toEqual({ ...project2, data: emptyProjectData });

    // get project titles of owner
    const projects = await app.getProjectTitlesOfOwner(ownerId);
    const expected = {
      [project1.id]: retrieved1?.title,
      [project2.id]: retrieved2?.title
    };
    expect(projects).toEqual(expected);

    // replace
    const replacement = {
      ...retrieved1,
      title: randomString(),
    };
    await app.replaceProject(replacement.id, replacement as Project);
    const replaced = await app.getProject(replacement.id);
    expect(replaced).toEqual(replacement);
  });

  test('update project data', async () => {
    const ownerId = randomString();

    // create
    const project = { id: randomString(), ownerId, title: randomString() };
    await app.createProject(project.id, project.ownerId, project.title);

    // update data
    const action = actionCreators.batch(
      actionCreators.create('user', 'u1', { id: 'u1', username: 'user1' }),
      actionCreators.create('status', 's1', { id: 's1', title: 'Status 1' }),
      actionCreators.create('task', 't1', { id: 't1', title: 'Task 1', creatorId: 'u1' }),
      actionCreators.attach('user', 'u1', 'createdTaskIds', 't1'),
      actionCreators.attach('status', 's1', 'taskIds', 't1'),
    );
    await app.updateProjectData(project.id, action);
    const updated = await app.getProject(project.id);

    const expectedUpdated: Project = {
      ...project,
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

    expect(updated).toEqual(expectedUpdated);
  });
});
