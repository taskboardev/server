import { DynamoDB } from 'aws-sdk';
import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { Project, ProjectData, makeProject, reducer } from '@taskboar/model';
import { Action } from 'normalized-reducer';
import { Persistence, Preview } from './model';

export const ERR_PROJECT_EXISTS = 'project exists';
export const ERR_PROJECT_DNE = 'project does not exist';

export class DynamoDbPersistence implements Persistence {
  client: DynamoDB;
  tableName: string;

  constructor (dynamoRegion: string, dynamoEndpoint: string, tableName: string) {
    this.client = new DynamoDB({
      region: dynamoRegion,
      endpoint: dynamoEndpoint,
    });

    this.tableName = tableName;
  }

  async getProject(id: string): Promise<Project|undefined> {
    const args = {
      TableName: this.tableName,
      Key: { id: { S: id } },
    };

    const { Item } = await this.client.getItem(args).promise();

    if (!Item) {
      return undefined;
    }

    return transformItem(Item);
  }

  async getPreviews(ownerId: string): Promise<Preview[]> {
    const args: DynamoDB.QueryInput = {
      TableName: this.tableName,
      IndexName: 'ownerId-idx',
      KeyConditionExpression: 'ownerId = :ownerId',
      ExpressionAttributeValues: { ':ownerId': { S: ownerId } },
      ProjectionExpression: 'id, ownerId, title'
    };

    const result = await this.client.query(args).promise();

    const items = result.Items;
    if (!items) {
      return [] as Preview[];
    }

    return items.map((item) => transformItem(item))
  }

  async createProject(id: string, ownerId: string, title: string): Promise<void> {
    const exists = await this.getProject(id);
    if (exists) {
      throw new Error(ERR_PROJECT_EXISTS);
    }

    const project = makeProject(id, ownerId, title);
    const item = transformProject(project);
    const args = {
      TableName: this.tableName,
      Item: item,
    };

    await this.client.putItem(args).promise();
  }

  async replaceProject(id: string, project: Project): Promise<void> {
    const args = {
      TableName: this.tableName,
      Item: transformProject(project)
    };

    await this.client.putItem(args).promise();
  }

  async updateProjectData(id: string, action: Action<ProjectData>): Promise<void> {
    const project = await this.getProject(id);

    if (!project) {
      throw new Error(ERR_PROJECT_DNE);
    }

    const data = reducer(project.data, action);

    await this.replaceProject(id, { ...project, data });
  }
}

function transformItem(item: AttributeMap): Project {
  const rawData = item['data']?.S;
  const data = rawData ? JSON.parse(rawData) : {};

  return {
    id: item['id'].S || '',
    ownerId: item['ownerId']?.S || '',
    title: item['title']?.S || '',
    data,
  }
}

function transformProject({ id, ownerId, title, data }: Project): AttributeMap  {
  return {
    id: { S: id },
    ownerId: { S: ownerId },
    title: { S: title },
    data: { S: JSON.stringify(data) },
  }
}
