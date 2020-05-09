import { DynamoDB } from 'aws-sdk';

import { Logger, Project, ProjectData } from './interfaces';
import { Store } from './store';
import { Action } from 'normalized-reducer';

export type Config = 'dev' | 'test';

export interface Args {
  dynamodb: DynamoDB,
  dynamoTable: string
  logger?: Logger
}

export class App {
  store: Store;

  constructor({ dynamodb, dynamoTable, logger }: Args) {
    this.store = new Store(dynamodb, dynamoTable);
  }

  async createProject(id: string, ownerId: string, title: string) {
    return this.store.createProject(id, ownerId, title);
  }

  async getProject(id: string) {
    return this.store.getProject(id);
  }

  async getProjectTitlesOfOwner(ownerId: string) {
    return this.store.getProjectTitlesOfOwner(ownerId);
  }

  async replaceProject(id: string, project: Project) {
    return this.store.replaceProject(id, project);
  }

  async updateProjectData(id: string, action: Action<ProjectData>) {
    return this.store.updateProjectData(id, action);
  }
}
