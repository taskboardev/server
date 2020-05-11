import admin, { ServiceAccount } from 'firebase-admin';

export class FirebaseAuth {
  client: admin.app.App;

  constructor(configPath: ServiceAccount, databaseURL: string) {
    this.client = admin.initializeApp({
      credential: admin.credential.cert(configPath),
      databaseURL,
    });
  }

  async authenticateRequestor(idToken: string) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      return decoded.uid;
    } catch (error) {
      throw new Error(`invalid token: ${error}`);
    }
  }
}





