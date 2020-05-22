export { Project, ProjectData } from '@taskboar/model';

export interface Auth {
  extractAuthenticatedUserId(idToken: string): string;
  createUser(email: string, password: string): string;
  obtainIdToken(userId: string): string;
}
