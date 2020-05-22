import { uuid } from '../lib/rand';
import { Logger } from '../lib/log';

import { Project, ProjectData, Action } from '@taskboar/model';

export const errors = {
  UNAUTHORIZED: 'unauthorized',
  DNE: 'dne'
};

export interface Auth {
  extractAuthenticatedUserId(idToken: string): Promise<string>;
  createUser(email: string, password: string): Promise<string>;
  obtainIdToken(userId: string): Promise<string>;
}

export interface Persistence {
  createProject(id: string, requestorId: string, title: string): Promise<void>;
  getProject(id: string): Promise<Project|undefined>;
  getPreviews(ownerId: string): Promise<({ id: string, title: string })[]>;
  replaceProject(id: string, replacement: Project): Promise<void>;
  updateProjectData(id: string, action: Action<ProjectData>): Promise<void>;
}

export type Preview = { id: string, title: string };

export interface Args {
  auth: Auth,
  persistence: Persistence,
  logger: Logger
}

export class Model {
  auth: Auth;
  persistence: Persistence;

  constructor({ auth, persistence, logger, }: Args) {
    this.auth = auth;
    this.persistence = persistence;
  }

  async createProject(token: string, title: string) {
    const requestorId = await this.auth.extractAuthenticatedUserId(token);
    if (!requestorId) {
      throw new Error(errors.UNAUTHORIZED);
    }

    const id = uuid();
    await this.persistence.createProject(id, requestorId, title);

    return id;
  }

  async getProject(token: string, id: string) {
    const requestorId = await this.auth.extractAuthenticatedUserId(token);
    if (!requestorId) {
      throw new Error(errors.UNAUTHORIZED);
    }

    return this.persistence.getProject(id);
  }

  async getPreviewsOfOwner(token: string, ownerId: string) {
    const requestorId = await this.auth.extractAuthenticatedUserId(token);
    if (!requestorId || requestorId !== ownerId) {
      throw new Error(errors.UNAUTHORIZED);
    }

    return this.persistence.getPreviews(ownerId);
  }

  async replaceProject(token: string, id: string, replacement: Project) {
    const requestorId = await this.auth.extractAuthenticatedUserId(token);
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

    return this.persistence.replaceProject(id, replacement);
  }

  async updateProjectData(token: string, id: string, action: Action<ProjectData>) {
    const requestorId = await this.auth.extractAuthenticatedUserId(token);
    if (!requestorId) {
      throw new Error(errors.UNAUTHORIZED);
    }

    return this.persistence.updateProjectData(id, action);
  }

  manuallyCreateUser(email: string, password: string) {
    return this.auth.createUser(email, password);
  }
}

