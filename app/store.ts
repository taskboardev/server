import { DynamoDB } from 'aws-sdk';
import { AttributeMap } from 'aws-sdk/clients/dynamodb';
import { makeProject, reducer } from '@taskboar/model';

import { Project, ProjectData } from './interfaces';
import { Action } from 'normalized-reducer';

export const ERR_PROJECT_EXISTS = 'project exists';
export const ERR_PROJECT_DNE = 'project does not exist';

export class Store {
  client: DynamoDB;
  tableName: string;

  constructor (client: DynamoDB, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  async getProject(id: string): Promise<Project|undefined> {
    const args = {
      TableName: this.tableName,
      Key: { id: { S: id } },
    };

    const { Item } = await this.client.getItem(args).promise();

    return transformItem(Item);
  }

  async getProjectTitlesOfOwner(ownerId: string) {
    const args: DynamoDB.QueryInput = {
      TableName: this.tableName,
      IndexName: 'ownerId-idx',
      KeyConditionExpression: 'ownerId = :ownerId',
      ExpressionAttributeValues: { ':ownerId': { S: ownerId } },
      ProjectionExpression: 'id, ownerId, title'
    };

    const result = await this.client.query(args).promise();

    return (result.Items || [])
      .map(item => transformItem(item))
      .reduce<Record<string, string>>((titlesByOwnerId, project) => {
        if (project) {
          titlesByOwnerId[project.id] = project.title;
        }
        return titlesByOwnerId;
      }, {})
  }

  async createProject(id: string, ownerId: string, title: string) {
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

    return this.client.putItem(args).promise();
  }

  async replaceProject(id: string, project: Project) {
    const args = {
      TableName: this.tableName,
      Item: transformProject(project)
    };

    return this.client.putItem(args).promise();
  }

  async updateProjectData(id: string, action: Action<ProjectData>) {
    const project = await this.getProject(id);

    if (!project) {
      throw new Error(ERR_PROJECT_DNE);
    }

    const data = reducer(project.data, action);

    return this.replaceProject(id, { ...project, data });
  }
}

function transformItem(item?: AttributeMap): Project|undefined {
  if (!item) {
    return undefined;
  }

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
