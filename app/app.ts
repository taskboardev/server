import { DynamoDB } from 'aws-sdk';
import { ServiceAccount } from 'firebase-admin';
import { Action } from '@taskboar/model';

import { Logger, Project, ProjectData } from './interfaces';
import { Store } from './store';
import { FirebaseAuth } from './auth';
import { uuid } from '../lib/rand';

export const errors = {
  UNAUTHORIZED: 'unauthorized',
  DNE: 'dne'
};

export interface Args {
  firebaseConfig: ServiceAccount,
  firebaseDbName: string,
  dynamodb: DynamoDB,
  dynamoTable: string,
  logger?: Logger
}

export class App {
  auth: FirebaseAuth;
  store: Store;

  constructor({
    firebaseConfig,
    firebaseDbName,
    dynamodb,
    dynamoTable,
    logger
  }: Args) {
    this.auth = new FirebaseAuth(firebaseConfig, firebaseDbName);
    this.store = new Store(dynamodb, dynamoTable);
  }

  async createProject(token: string, title: string) {
    const requestorId = await this.auth.authenticateRequestor(token);
    if (!requestorId) {
      throw new Error(errors.UNAUTHORIZED);
    }

    return this.store.createProject(uuid(), requestorId, title);
  }

  async getProject(token: string, id: string) {
    const requestorId = await this.auth.authenticateRequestor(token);
    if (!requestorId) {
      throw new Error(errors.UNAUTHORIZED);
    }

    return this.store.getProject(id);
  }

  async getProjectTitlesOfOwner(token: string, ownerId: string) {
    const requestorId = await this.auth.authenticateRequestor(token);
    if (!requestorId || requestorId !== ownerId) {
      throw new Error(errors.UNAUTHORIZED);
    }

    return this.store.getProjectTitlesOfOwner(ownerId);
  }

  async replaceProject(token: string, id: string, replacement: Project) {
    const requestorId = await this.auth.authenticateRequestor(token);
    if (!requestorId) {
      throw new Error(errors.UNAUTHORIZED);
    }

    const project = await this.getProject(token, id);
    if (!project) {
      throw new Error(errors.DNE);
    }

    if (project.ownerId !== requestorId) {
      throw new Error(errors.UNAUTHORIZED);
    }

    return this.store.replaceProject(id, replacement);
  }

  async updateProjectData(token: string, id: string, action: Action<ProjectData>) {
    const requestorId = await this.auth.authenticateRequestor(token);
    if (!requestorId) {
      throw new Error(errors.UNAUTHORIZED);
    }

    return this.store.updateProjectData(id, action);
  }
}
